import { Component, inject, OnInit } from '@angular/core';
import { MovieService } from '../../core/services/movie.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private movieService = inject(MovieService);

  ngOnInit(): void {
    console.log('Inicializando: Cargando películas...');
    this.movieService.getTrendingMovies().subscribe(data => {
      console.log('¡Éxito! Datos recibidos de TMDB:', data.results);
    });
  }
}

