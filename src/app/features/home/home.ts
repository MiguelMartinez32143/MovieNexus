import { Component, inject, OnInit, signal } from '@angular/core';
import { MovieService } from '../../core/services/movie.service';
import { Hero } from './components/hero/hero';
import { Movie } from '../../core/models/movie.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Hero],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private movieService = inject(MovieService);

  featuredMovie = signal<Movie | null>(null);
  ngOnInit(): void {
    this.movieService.getTrendingMovies().subscribe(data => {
      if(data.results.length > 0){
        this.featuredMovie.set(data.results[0]);
      }
    });
  }
}

