import {
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../../../core/services/movie.service';
import { Movie } from '../../../../core/models/movie.model';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  private movieService = inject(MovieService);
  private router = inject(Router);

  searchQuery = signal<string>('');
  searchResults = signal<Movie[]>([]);
  isLoading = signal<boolean>(false);
  showDropdown = signal<boolean>(false);

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  ngOnInit() {
    this.searchSub = this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query.trim()) {
            this.isLoading.set(false);
            this.searchResults.set([]);
            this.showDropdown.set(false);
            return [];
          }
          this.isLoading.set(true);
          return this.movieService.searchMovies(query);
        }),
      )
      .subscribe({
        next: (res: any) => {
          // Obtenemos solo los primeros 5 resultados para mantener el dropdown limpio
          this.searchResults.set(res?.results?.slice(0, 5) || []);
          this.isLoading.set(false);
          this.showDropdown.set(true);
        },
        error: (err) => {
          console.error('Error al buscar películas:', err);
          this.isLoading.set(false);
        },
      });
  }

  onSearchInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.searchQuery.set(value);
    this.searchSubject.next(value);
  }

  onFocus() {
    if (this.searchQuery().trim() && this.searchResults().length > 0) {
      this.showDropdown.set(true);
    }
  }

  onBlur() {
    // Usamos setTimeout para dar tiempo a que se procese el click en un resultado
    setTimeout(() => {
      this.showDropdown.set(false);
    }, 250);
  }

  selectMovie(movieId: number) {
    this.router.navigate(['/movie', movieId]);
    this.clearSearch();
  }

  clearSearch() {
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.showDropdown.set(false);
  }

  ngOnDestroy() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }
}
