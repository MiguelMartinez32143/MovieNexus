import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Movie, MovieResponse } from '../models/movie.model';
import { CreditsResponse } from '../models/cast.model';
import { delay, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private apiUrl = environment.baseUrl;

  private trendingCache: MovieResponse | null = null;
  private popularCache: { [page: number]: MovieResponse } = {};

  getTrendingMovies() {
    if (this.trendingCache) {
      return of(this.trendingCache);
    }
    return this.http.get<MovieResponse>(`${this.apiUrl}/trending/movie/day`).pipe(
      tap(data => this.trendingCache = data),
      delay(500)
    );
  }


  getPopularMovies(page: number = 1) {
    if (this.popularCache[page]) {
      return of(this.popularCache[page]);
    }
    return this.http.get<MovieResponse>(`${this.apiUrl}/movie/popular`, {
      params: { page: page.toString() }
    }).pipe(
      tap(data => this.popularCache[page] = data),
      delay(500)
    );
  }

  getMovieById(id: string | number) {
    return this.http.get<Movie>(`${this.apiUrl}/movie/${id}`);
  }

  getMovieCredits(id: string | number) {
    return this.http.get<CreditsResponse>(`${this.apiUrl}/movie/${id}/credits`);
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
}