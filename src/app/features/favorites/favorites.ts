import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { MovieCard } from '../../shared/components/movie-card/movie-card';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent, MovieCard],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css'
})
export class Favorites {
  private movieService = inject(MovieService);
  favoriteMovies = this.movieService.favoriteMovies;
}
