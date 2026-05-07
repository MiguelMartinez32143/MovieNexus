import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movie } from '../../../../core/models/movie.model';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {

  @Input({required: true}) movie!: Movie;
  
  get backdropUrl(): string {
    return this.movie.backdrop_path ? `https://image.tmdb.org/t/p/original${this.movie.backdrop_path}`
    : '';
  }
}

