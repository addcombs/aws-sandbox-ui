import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TimeoutError } from 'rxjs';
import { ApiHealthService } from '../shared/services/api-health.service';
import { CurrentUserService } from '../shared/services/current-user.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-main',
  imports: [MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit {
  private readonly apiHealthService = inject(ApiHealthService);
  private readonly currentUser = inject(CurrentUserService);

  protected readonly apiOrigin = signal(this.getDefaultApiOrigin());
  protected readonly connectionState = signal<'idle' | 'checking' | 'connected' | 'error'>('idle');
  protected readonly authState = this.currentUser.status;
  protected readonly profile = this.currentUser.profile;
  protected readonly authMessage = this.currentUser.errorMessage;
  protected readonly welcomeMessage = computed(() => {
    const displayName = this.currentUser.displayName();
    return displayName ? `Welcome, ${displayName}` : 'Welcome';
  });
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
    this.currentUser.loadCurrentUser(this.apiOrigin());
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
    this.currentUser.signIn();
  }

  protected signOut(): void {
    this.currentUser.signOut();
  }

  protected retryProfileLoad(): void {
    this.currentUser.refreshCurrentUser(this.apiOrigin());
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

}
