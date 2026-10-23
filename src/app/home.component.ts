import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TimeoutError } from 'rxjs';
import { ApiHealthService } from './api-health.service';
import { AuthService, UserProfile } from './auth/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly apiHealthService = inject(ApiHealthService);
  private readonly authService = inject(AuthService);

  protected readonly apiOrigin = signal(this.getDefaultApiOrigin());
  protected readonly connectionState = signal<'idle' | 'checking' | 'connected' | 'error'>('idle');
  protected readonly authState = signal<'checking' | 'signed-out' | 'signing-in' | 'signed-in' | 'error'>('checking');
  protected readonly profile = signal<UserProfile | null>(null);
  protected readonly authMessage = signal('');
  protected readonly connectionMessage = signal(
    'Enter the API origin and run a read-only health check.',
  );
  protected readonly isApiOriginValid = computed(
    () => this.parseApiOrigin(this.apiOrigin()) !== null,
  );
  protected readonly connectionIcon = computed(() => {
    switch (this.connectionState()) {
      case 'checking':
        return 'sync';
      case 'connected':
        return 'check_circle';
      case 'error':
        return 'error_outline';
      default:
        return 'info_outline';
    }
  });

  ngOnInit(): void {
    this.loadCurrentProfile();
  }

  protected updateApiOrigin(value: string): void {
    this.apiOrigin.set(value);
    this.connectionState.set('idle');
    this.connectionMessage.set('Enter the API origin and run a read-only health check.');
  }

  protected testApiConnection(): void {
    const apiOrigin = this.parseApiOrigin(this.apiOrigin());
    if (!apiOrigin) {
      return;
    }

    this.connectionState.set('checking');
    this.connectionMessage.set('Checking the API…');

    this.apiHealthService.check(apiOrigin).subscribe({
      next: () => {
        this.connectionState.set('connected');
        this.connectionMessage.set(`Connected to ${apiOrigin}.`);
      },
      error: (error: unknown) => {
        this.connectionState.set('error');
        this.connectionMessage.set(this.getErrorMessage(error));
      },
    });
  }

  protected signIn(): void {
    this.authState.set('signing-in');
    this.authMessage.set('');
    void this.authService.signIn().catch((error: unknown) => {
      this.authState.set('error');
      this.authMessage.set(this.getAuthErrorMessage(error));
    });
  }

  protected signOut(): void {
    void this.authService
      .signOut()
      .then(() => {
        this.profile.set(null);
        this.authState.set('signed-out');
        this.authMessage.set('');
      })
      .catch((error: unknown) => {
        this.authState.set('error');
        this.authMessage.set(this.getAuthErrorMessage(error));
      });
  }

  protected retryProfileLoad(): void {
    this.loadCurrentProfile();
  }

  private loadCurrentProfile(): void {
    this.authState.set('checking');
    this.authService.currentProfile(this.apiOrigin()).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.authState.set(profile ? 'signed-in' : 'signed-out');
        this.authMessage.set('');
      },
      error: (error: unknown) => {
        this.authState.set('error');
        this.authMessage.set(this.getAuthErrorMessage(error));
      },
    });
  }

  private getDefaultApiOrigin(): string {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8080'
      : 'https://api.acombs-dev.com';
  }

  private parseApiOrigin(value: string): string | null {
    try {
      const url = new URL(value.trim());
      if (
        !['http:', 'https:'].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.pathname !== '/' ||
        url.search ||
        url.hash
      ) {
        return null;
      }

      return url.origin;
    } catch {
      return null;
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof TimeoutError) {
      return 'The API did not respond within 8 seconds.';
    }
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return "Could not reach the API. Check its HTTPS availability and allow this site's exact origin in API CORS settings.";
      }
      return `The API health check failed with HTTP ${error.status}.`;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'The API health check failed for an unknown reason.';
  }

  private getAuthErrorMessage(error: unknown): string {
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
