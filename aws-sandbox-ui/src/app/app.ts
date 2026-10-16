import { BreakpointObserver } from '@angular/cdk/layout';
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
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly handsetQuery = '(max-width: 760px)';

  protected readonly theme = inject(ThemeService);
  protected readonly isHandset = toSignal(
    this.breakpointObserver.observe(this.handsetQuery).pipe(map(({ matches }) => matches)),
    { initialValue: this.breakpointObserver.isMatched(this.handsetQuery) },
  );
  protected readonly navigationOpen = signal(!this.isHandset());
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
}
