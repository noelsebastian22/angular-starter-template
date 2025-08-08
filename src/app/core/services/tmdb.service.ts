import { Injectable } from '@angular/core';
import { environment as baseEnv } from '../../../environments/environment';

import { ResourceService } from '@infrastructure/http';
import { ApiResult, MovieResult, MovieDetails } from '@infrastructure/models';

const env = { ...baseEnv };

@Injectable({ providedIn: 'root' })
export class TmdbService extends ResourceService {
  // We don’t have a fixed resourcePath (varies: /movie, /search/movie, etc.)
  constructor() {
    super('', {
      Authorization: `Bearer ${env.tmdbApiToken}`,
    });
  }

  // Override base to TMDB base (not your app API)
  protected override baseUrl = env.apiUrl.replace(/\/+$/, '');

  // --- API methods ---

  /** GET /movie/popular */
  getPopularMovies(page = 1) {
    return this.request<ApiResult<MovieResult>>(
      'GET',
      this.url('movie', 'popular'),
      {
        params: { page },
      },
    );
  }

  /** GET /movie/{id} */
  getMovie(id: number) {
    return this.request<MovieDetails>('GET', this.url('movie', id), {});
  }

  /** GET /search/movie?query=... */
  searchMovies(query: string, page = 1) {
    return this.request<ApiResult<MovieResult>>(
      'GET',
      this.url('searchs', 'movie'),
      {
        params: { query, page, include_adult: false },
      },
    );
  }
}
