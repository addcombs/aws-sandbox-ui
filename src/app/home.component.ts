import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { TimeoutError } from 'rxjs';
import { ApiHealthService } from './api-health.service';
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
export class HomeComponent {
  private readonly apiHealthService = inject(ApiHealthService);

  protected readonly apiOrigin = signal(this.getDefaultApiOrigin());
  protected readonly connectionState = signal<'idle' | 'checking' | 'connected' | 'error'>('idle');
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

  private getDefaultApiOrigin(): string {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8080'
      : '';
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
