import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { Movie, MovieResponse, WatchProvidersResponse } from '../models/movie.model';
import { CreditsResponse } from '../models/cast.model';
import { delay, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private apiUrl = environment.baseUrl;
  private platformId = inject(PLATFORM_ID);

  public get trendingCache(): MovieResponse | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const cached = sessionStorage.getItem('trendingCache');
    return cached ? JSON.parse(cached) : null;
  }
  public set trendingCache(value: MovieResponse | null) {
    if (isPlatformBrowser(this.platformId)) {
      if (value) {
        sessionStorage.setItem('trendingCache', JSON.stringify(value));
      } else {
        sessionStorage.removeItem('trendingCache');
      }
    }
  }

  public get popularCache(): { [page: number]: MovieResponse } {
    if (!isPlatformBrowser(this.platformId)) return {};
    const cached = sessionStorage.getItem('popularCache');
    return cached ? JSON.parse(cached) : {};
  }
  public set popularCache(value: { [page: number]: MovieResponse }) {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('popularCache', JSON.stringify(value));
    }
  }

  public get catalogMoviesCache(): Movie[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    const cached = sessionStorage.getItem('catalogMoviesCache');
    return cached ? JSON.parse(cached) : [];
  }
  public set catalogMoviesCache(value: Movie[]) {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('catalogMoviesCache', JSON.stringify(value));
    }
  }

  public get currentPageCache(): number {
    if (!isPlatformBrowser(this.platformId)) return 1;
    const cached = sessionStorage.getItem('currentPageCache');
    return cached ? parseInt(cached, 10) : 1;
  }
  public set currentPageCache(value: number) {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('currentPageCache', value.toString());
    }
  }

  getTrendingMovies() {
    const cached = this.trendingCache;
    if (cached) {
      return of(cached);
    }
    return this.http.get<MovieResponse>(`${this.apiUrl}/trending/movie/day`).pipe(
      tap(data => this.trendingCache = data),
      delay(200)
    );
  }


  getPopularMovies(page: number = 1) {
    const cached = this.popularCache[page];
    if (cached) {
      return of(cached);
    }
    return this.http.get<MovieResponse>(`${this.apiUrl}/movie/popular`, {
      params: { page: page.toString() }
    }).pipe(
      tap(data => {
        const cache = this.popularCache;
        cache[page] = data;
        this.popularCache = cache;
      }),
      delay(200)
    );
  }

  getMovieById(id: string | number) {
    return this.http.get<Movie>(`${this.apiUrl}/movie/${id}`);
  }

  getMovieCredits(id: string | number) {
    return this.http.get<CreditsResponse>(`${this.apiUrl}/movie/${id}/credits`);
  }

  getWatchProviders(id: string | number) {
    return this.http.get<WatchProvidersResponse>(`${this.apiUrl}/movie/${id}/watch/providers`);
  }

  /**
   * Obtiene los videos (tráilers, teasers, etc.) de una película.
   * @param id ID de la película en TMDB
   */
  getMovieVideos(id: string | number) {
    return this.http.get<{ results: Array<{ key: string; site: string; type: string; name: string }> }>(
      `${this.apiUrl}/movie/${id}/videos`
    );
  }

  searchMovies(query: string) {
    return this.http.get<MovieResponse>(`${this.apiUrl}/search/movie`, {
      params: { query }
    });
  }

  // --- SISTEMA DE FAVORITOS ---
  private favoritesSignal = signal<Movie[]>(this.loadFavoritesFromStorage());

  private loadFavoritesFromStorage(): Movie[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const stored = localStorage.getItem('favorites');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error al cargar favoritos de localStorage', e);
      return [];
    }
  }

  get favoriteMovies() {
    return this.favoritesSignal.asReadonly();
  }

  toggleFavorite(movie: Movie) {
    if (!isPlatformBrowser(this.platformId)) return;
    const current = this.favoritesSignal();
    const exists = current.some(m => m.id === movie.id);
    let updated: Movie[];
    if (exists) {
      updated = current.filter(m => m.id !== movie.id);
    } else {
      updated = [...current, movie];
    }
    this.favoritesSignal.set(updated);
    try {
      localStorage.setItem('favorites', JSON.stringify(updated));
    } catch (e) {
      console.error('Error al guardar favoritos en localStorage', e);
    }
  }

  isFavorite(movieId: number | string): boolean {
    return this.favoritesSignal().some(m => m.id.toString() === movieId.toString());
  }
}