import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { fetchAuthSession, signInWithRedirect, signOut } from 'aws-amplify/auth';
import { from, Observable, of, switchMap, timeout } from 'rxjs';
import type { UserProfile } from '../shared/models/user-profile';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  currentProfile(apiOrigin: string): Observable<UserProfile | null> {
    return from(fetchAuthSession()).pipe(
      switchMap(({ tokens }) => {
        const accessToken = tokens?.accessToken;
        if (!accessToken) {
          return of(null);
        }

        return this.http
          .get<UserProfile>(`${apiOrigin}/api/me`, {
            headers: new HttpHeaders({
              Authorization: `Bearer ${accessToken.toString()}`,
            }),
          })
          .pipe(timeout({ first: 10000 }));
      }),
    );
  }

  signIn(): Promise<void> {
    return signInWithRedirect();
  }

  signOut(): Promise<void> {
    return signOut();
  }
}
