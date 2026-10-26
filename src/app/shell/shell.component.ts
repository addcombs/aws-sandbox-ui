import { BreakpointObserver } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { CurrentUserService } from '../shared/services/current-user.service';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-root',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly document = inject(DOCUMENT);
  private readonly currentUser = inject(CurrentUserService);
  private readonly handsetQuery = '(max-width: 760px)';

  protected readonly theme = inject(ThemeService);
  protected readonly isHandset = toSignal(
    this.breakpointObserver.observe(this.handsetQuery).pipe(map(({ matches }) => matches)),
    { initialValue: this.breakpointObserver.isMatched(this.handsetQuery) },
  );
  protected readonly navigationOpen = signal(!this.isHandset());
  protected readonly accountPopoverOpen = signal(false);
  protected readonly accountState = this.currentUser.status;
  protected readonly accountProfile = this.currentUser.profile;
  protected readonly accountErrorMessage = this.currentUser.errorMessage;
  protected readonly accountDisplayName = this.currentUser.displayName;
  protected readonly themeIcon = computed(() =>
    this.theme.mode() === 'dark' ? 'light_mode' : 'dark_mode',
  );
  protected readonly navigationToggleLabel = computed(() =>
    this.navigationOpen() ? 'Close navigation' : 'Open navigation',
  );
  protected readonly themeToggleLabel = computed(() =>
    this.theme.mode() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
  );

  ngOnInit(): void {
    this.currentUser.loadCurrentUser(this.getDefaultApiOrigin());
  }

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
    this.currentUser.loadCurrentUser(this.getDefaultApiOrigin());
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
    this.currentUser.signIn();
  }

  protected signOutFromAccount(): void {
    this.currentUser.signOut();
  }

  protected retryAccountProfileLoad(): void {
    this.currentUser.refreshCurrentUser(this.getDefaultApiOrigin());
  }

  private getDefaultApiOrigin(): string {
    return this.document.defaultView?.location.hostname === 'localhost' ||
      this.document.defaultView?.location.hostname === '127.0.0.1'
      ? 'http://localhost:8080'
      : 'https://api.acombs-dev.com';
  }

}
