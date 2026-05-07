import { Component, inject, OnInit, signal } from '@angular/core';
import { MovieService } from '../../core/services/movie.service';
import { Hero } from './components/hero/hero';
import { Movie } from '../../core/models/movie.model';
import { CommonModule } from '@angular/common';
import { MovieSlider } from '../../shared/components/movie-slider/movie-slider';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Hero, MovieSlider],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private movieService = inject(MovieService);

  featuredMovie = signal<Movie | null>(null);
  trendingMovies = signal<Movie[]>([]);
  popularMovies = signal<Movie[]>([]);

  ngOnInit(): void {
    this.movieService.getTrendingMovies().subscribe(data => {
      if (data.results.length > 0) {

        this.trendingMovies.set(data.results);
        this.featuredMovie.set(data.results[0]);

      }
    });

    this.movieService.getPopularMovies().subscribe({
      next: (data) => {
        this.popularMovies.set(data.results);
      }
    });
  }
}

