import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { TimeoutError } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import type { UserProfile } from '../models/user-profile';

export type CurrentUserStatus =
  | 'idle'
  | 'checking'
  | 'signed-out'
  | 'signing-in'
  | 'signed-in'
  | 'signing-out'
  | 'error';

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private readonly authService = inject(AuthService);
  private requestVersion = 0;

  readonly profile = signal<UserProfile | null>(null);
  readonly status = signal<CurrentUserStatus>('idle');
  readonly errorMessage = signal('');
  readonly displayName = computed(() => {
    const profile = this.profile();
    if (!profile) {
      return '';
    }

    return (
      [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() ||
      profile.emailAddress
    );
  });

  loadCurrentUser(apiOrigin: string): void {
    if (this.status() !== 'idle') {
      return;
    }

    this.fetchProfile(apiOrigin);
  }

  refreshCurrentUser(apiOrigin: string): void {
    this.fetchProfile(apiOrigin);
  }

  signIn(): void {
    this.requestVersion++;
    this.status.set('signing-in');
    this.errorMessage.set('');
    void this.authService.signIn().catch((error: unknown) => this.setError(error));
  }

  signOut(): void {
    const requestVersion = ++this.requestVersion;
    this.status.set('signing-out');
    this.errorMessage.set('');
    void this.authService
      .signOut()
      .then(() => {
        if (requestVersion !== this.requestVersion) {
          return;
        }

        this.profile.set(null);
        this.status.set('signed-out');
      })
      .catch((error: unknown) => {
        if (requestVersion === this.requestVersion) {
          this.setError(error);
        }
      });
  }

  private fetchProfile(apiOrigin: string): void {
    const requestVersion = ++this.requestVersion;
    this.status.set('checking');
    this.errorMessage.set('');
    this.authService.currentProfile(apiOrigin).subscribe({
      next: (profile) => {
        if (requestVersion !== this.requestVersion) {
          return;
        }

        this.profile.set(profile);
        this.status.set(profile ? 'signed-in' : 'signed-out');
      },
      error: (error: unknown) => {
        if (requestVersion === this.requestVersion) {
          this.setError(error);
        }
      },
    });
  }

  private setError(error: unknown): void {
    this.status.set('error');
    this.errorMessage.set(this.getErrorMessage(error));
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof TimeoutError) {
      return 'The user profile request timed out.';
    }
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Could not reach the API. Check HTTPS availability and the API CORS allowlist.';
      }
      if (error.status === 401) {
        return 'Your sign-in session expired. Sign in again to continue.';
      }
      if (error.status === 403) {
        return 'Verify your email address before loading your profile.';
      }
      return `Could not load the signed-in profile (HTTP ${error.status}).`;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Authentication failed for an unknown reason.';
  }
}
