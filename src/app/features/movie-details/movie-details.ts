import { Component, inject, Input, OnInit, ChangeDetectionStrategy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { Movie, WatchProvidersResponse, CountryProviders } from '../../core/models/movie.model';
import { CastCard } from '../../shared/components/cast-card/cast-card';
import { Observable, forkJoin } from 'rxjs'; // Importamos RxJS
import { CreditsResponse } from '../../core/models/cast.model';
import { MovieTrailer } from './components/movie-trailer/movie-trailer';
import { MovieComments } from './components/movie-comments/movie-comments';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, CastCard, MovieTrailer, MovieComments], // No olvides importar CastCard, MovieTrailer y MovieComments
  templateUrl: './movie-details.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './movie-details.css',
})
export class MovieDetails implements OnInit {
  private movieService = inject(MovieService);
  private platformId = inject(PLATFORM_ID);
  @Input() id!: string;

  userRegion = 'US';

  // Declaramos un Observable que contendrá TODOS los datos que necesitamos
  movieData$!: Observable<{ details: Movie; credits: CreditsResponse; providers: WatchProvidersResponse }>;

  ngOnInit(): void {
    if (this.id) {
      this.userRegion = this.getUserRegion();
      // forkJoin dispara ambas peticiones al mismo tiempo y crea un objeto con los resultados
      this.movieData$ = forkJoin({
        details: this.movieService.getMovieById(this.id),
        credits: this.movieService.getMovieCredits(this.id),
        providers: this.movieService.getWatchProviders(this.id),
      });
    }
  }

  getUserRegion(): string {
    if (isPlatformBrowser(this.platformId) && typeof navigator !== 'undefined' && navigator.language) {
      const parts = navigator.language.split('-');
      if (parts.length > 1) {
        return parts[1].toUpperCase();
      }
      const lang = parts[0].toLowerCase();
      if (lang === 'en') return 'US';
      if (lang === 'es') return 'ES';
      return lang.toUpperCase();
    }
    return 'US';
  }

  getProvidersForRegion(providersResponse: WatchProvidersResponse | null | undefined): CountryProviders | null {
    if (!providersResponse || !providersResponse.results) return null;
    const region = this.userRegion;
    if (providersResponse.results[region]) {
      return providersResponse.results[region];
    }
    // Fallbacks
    if (providersResponse.results['US']) return providersResponse.results['US'];
    if (providersResponse.results['ES']) return providersResponse.results['ES'];
    const keys = Object.keys(providersResponse.results);
    if (keys.length > 0) return providersResponse.results[keys[0]];
    return null;
  }

  getBackdropUrl(path: string | null | undefined): string {
    return path ? `https://image.tmdb.org/t/p/original${path}` : '';
  }

  isFavorite(id: number | string): boolean {
    return this.movieService.isFavorite(id);
  }

  toggleFavorite(movie: Movie): void {
    this.movieService.toggleFavorite(movie);
  }
}
