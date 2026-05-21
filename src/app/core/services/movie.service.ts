import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { Movie, MovieResponse } from '../models/movie.model';
import { CreditsResponse } from '../models/cast.model';
import { delay, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private apiUrl = environment.baseUrl;
  private platformId = inject(PLATFORM_ID);

  public get trendingCache(): MovieResponse | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const cached = sessionStorage.getItem('trendingCache');
    return cached ? JSON.parse(cached) : null;
  }
  public set trendingCache(value: MovieResponse | null) {
    if (isPlatformBrowser(this.platformId)) {
      if (value) {
        sessionStorage.setItem('trendingCache', JSON.stringify(value));
      } else {
        sessionStorage.removeItem('trendingCache');
      }
    }
  }

  public get popularCache(): { [page: number]: MovieResponse } {
    if (!isPlatformBrowser(this.platformId)) return {};
    const cached = sessionStorage.getItem('popularCache');
    return cached ? JSON.parse(cached) : {};
  }
  public set popularCache(value: { [page: number]: MovieResponse }) {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('popularCache', JSON.stringify(value));
    }
  }

  public get catalogMoviesCache(): Movie[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    const cached = sessionStorage.getItem('catalogMoviesCache');
    return cached ? JSON.parse(cached) : [];
  }
  public set catalogMoviesCache(value: Movie[]) {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('catalogMoviesCache', JSON.stringify(value));
    }
  }

  public get currentPageCache(): number {
    if (!isPlatformBrowser(this.platformId)) return 1;
    const cached = sessionStorage.getItem('currentPageCache');
    return cached ? parseInt(cached, 10) : 1;
  }
  public set currentPageCache(value: number) {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('currentPageCache', value.toString());
    }
  }

  getTrendingMovies() {
    const cached = this.trendingCache;
    if (cached) {
      return of(cached);
    }
    return this.http.get<MovieResponse>(`${this.apiUrl}/trending/movie/day`).pipe(
      tap(data => this.trendingCache = data),
      delay(200)
    );
  }


  getPopularMovies(page: number = 1) {
    const cached = this.popularCache[page];
    if (cached) {
      return of(cached);
    }
    return this.http.get<MovieResponse>(`${this.apiUrl}/movie/popular`, {
      params: { page: page.toString() }
    }).pipe(
      tap(data => {
        const cache = this.popularCache;
        cache[page] = data;
        this.popularCache = cache;
      }),
      delay(200)
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