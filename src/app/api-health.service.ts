import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, timeout } from 'rxjs';

export interface ApiHealthResponse {
  status: 'UP';
}

@Injectable({ providedIn: 'root' })
export class ApiHealthService {
  private readonly http = inject(HttpClient);

  check(apiOrigin: string): Observable<ApiHealthResponse> {
    return this.http.get<unknown>(`${apiOrigin}/api/health`).pipe(
      timeout({ first: 8000 }),
      map((response) => {
        if (
          typeof response === 'object' &&
          response !== null &&
          'status' in response &&
          response.status === 'UP'
        ) {
          return { status: 'UP' };
        }

        throw new Error('The API health endpoint returned an unexpected response.');
      }),
    );
  }
}
