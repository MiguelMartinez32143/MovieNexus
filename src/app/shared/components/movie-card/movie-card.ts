import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Movie } from '../../../core/models/movie.model';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-card.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './movie-card.css',
})
export class MovieCard {
  @Input({ required: true }) movie!: Movie;

  get posterUrl(): string {
    return this.movie.poster_path
      ? `https://image.tmdb.org/t/p/original${this.movie.poster_path}`
      : 'assets/no-image.png';
  }
}
