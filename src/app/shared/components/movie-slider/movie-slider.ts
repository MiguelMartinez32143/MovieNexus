import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Movie } from '../../../core/models/movie.model';
import { MovieCard } from '../movie-card/movie-card';
import { CommonModule } from '@angular/common';
import { SkeletonCard } from '../skeleton-card/skeleton-card';

@Component({
  selector: 'app-movie-slider',
  standalone: true,
  imports: [CommonModule, MovieCard, SkeletonCard],
  templateUrl: './movie-slider.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './movie-slider.css',
})
export class MovieSlider {
  @Input({ required: true }) movies: Movie[] = [];
  @Input({ required: true }) title: string = '';
}
