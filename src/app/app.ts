import { BreakpointObserver } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { AuthService, UserProfile } from './auth/auth.service';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly authService = inject(AuthService);
  private readonly document = inject(DOCUMENT);
  private readonly handsetQuery = '(max-width: 760px)';

  protected readonly theme = inject(ThemeService);
  protected readonly isHandset = toSignal(
    this.breakpointObserver.observe(this.handsetQuery).pipe(map(({ matches }) => matches)),
    { initialValue: this.breakpointObserver.isMatched(this.handsetQuery) },
  );
  protected readonly navigationOpen = signal(!this.isHandset());
  protected readonly accountPopoverOpen = signal(false);
  protected readonly accountState = signal<
    'idle' | 'checking' | 'signed-out' | 'signing-in' | 'signed-in' | 'signing-out' | 'error'
  >('idle');
  protected readonly accountProfile = signal<UserProfile | null>(null);
  protected readonly accountErrorMessage = signal('');
  protected readonly accountDisplayName = computed(() => {
    const profile = this.accountProfile();
    if (!profile) {
      return '';
    }

    return (
      [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() ||
      profile.emailAddress
    );
  });
  protected readonly themeIcon = computed(() =>
    this.theme.mode() === 'dark' ? 'light_mode' : 'dark_mode',
  );
  protected readonly navigationToggleLabel = computed(() =>
    this.navigationOpen() ? 'Close navigation' : 'Open navigation',
  );
  protected readonly themeToggleLabel = computed(() =>
    this.theme.mode() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
  );

  protected toggleNavigation(): void {
    this.navigationOpen.update((open) => !open);
  }

  protected closeNavigation(): void {
    if (this.isHandset()) {
      this.navigationOpen.set(false);
    }
  }

  protected openAccountPopover(): void {
    if (this.accountPopoverOpen()) {
      return;
    }

    this.accountPopoverOpen.set(true);
    this.loadAccountProfile();
  }

  protected closeAccountPopover(): void {
    const profileControl = this.document.activeElement?.closest('.profile-control');
    if (!profileControl) {
      this.accountPopoverOpen.set(false);
    }
  }

  protected closeAccountPopoverOnFocusOut(event: FocusEvent): void {
    const nextTarget = event.relatedTarget;
    if (
      nextTarget instanceof Node &&
      event.currentTarget instanceof HTMLElement &&
      event.currentTarget.contains(nextTarget)
    ) {
      return;
    }

    this.accountPopoverOpen.set(false);
  }

  protected signInFromAccount(): void {
    this.accountState.set('signing-in');
    this.accountErrorMessage.set('');
    void this.authService.signIn().catch((error: unknown) => {
      this.accountState.set('error');
      this.accountErrorMessage.set(this.getAccountErrorMessage(error));
    });
  }

  protected signOutFromAccount(): void {
    this.accountState.set('signing-out');
    this.accountErrorMessage.set('');
    void this.authService
      .signOut()
      .then(() => {
        this.accountProfile.set(null);
        this.accountState.set('signed-out');
      })
      .catch((error: unknown) => {
        this.accountState.set('error');
        this.accountErrorMessage.set(this.getAccountErrorMessage(error));
      });
  }

  protected retryAccountProfileLoad(): void {
    this.loadAccountProfile();
  }

  private loadAccountProfile(): void {
    this.accountState.set('checking');
    this.accountErrorMessage.set('');
    this.authService.currentProfile(this.getDefaultApiOrigin()).subscribe({
      next: (profile) => {
        this.accountProfile.set(profile);
        this.accountState.set(profile ? 'signed-in' : 'signed-out');
      },
      error: (error: unknown) => {
        this.accountState.set('error');
        this.accountErrorMessage.set(this.getAccountErrorMessage(error));
      },
    });
  }

  private getDefaultApiOrigin(): string {
    return this.document.defaultView?.location.hostname === 'localhost' ||
      this.document.defaultView?.location.hostname === '127.0.0.1'
      ? 'http://localhost:8080'
      : 'https://api.acombs-dev.com';
  }

  private getAccountErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Your sign-in session expired. Sign in again.';
      }
      if (error.status === 403) {
        return 'Verify your email address before loading your profile.';
      }
      return `Could not load account information (HTTP ${error.status}).`;
    }

    return error instanceof Error ? error.message : 'Could not load account information.';
  }
}
