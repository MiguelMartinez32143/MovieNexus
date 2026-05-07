import { Component, Input } from '@angular/core';
import { Movie } from '../../../core/models/movie.model';
import { MovieCard } from '../movie-card/movie-card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movie-slider',
  standalone: true,
  imports: [CommonModule, MovieCard],
  templateUrl: './movie-slider.html',
  styleUrl: './movie-slider.css',
})
export class MovieSlider {
  @Input({required: true}) movies: Movie[] = [];
  @Input({required: true}) title: string = '';
}
