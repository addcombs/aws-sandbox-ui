import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'aws-sandbox-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly mode = signal<ThemeMode>(this.getInitialMode());

  constructor() {
    this.applyTheme(this.mode());
  }

  toggleTheme(): void {
    const nextMode = this.mode() === 'light' ? 'dark' : 'light';
    this.mode.set(nextMode);
    this.applyTheme(nextMode);
    this.document.defaultView?.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
  }

  private getInitialMode(): ThemeMode {
    const view = this.document.defaultView;
    const savedMode = view?.localStorage.getItem(THEME_STORAGE_KEY);

    if (savedMode === 'light' || savedMode === 'dark') {
      return savedMode;
    }

    return view?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(mode: ThemeMode): void {
    const root = this.document.documentElement;
    root.classList.toggle('dark-theme', mode === 'dark');
    root.style.colorScheme = mode;
  }
}
