import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'aws-sandbox-theme';
const PRIMARY_COLOR_STORAGE_KEY = 'aws-sandbox-primary-color';

const PRIMARY_COLORS = {
  'dark-blue-gray': {
    id: 'dark-blue-gray',
    name: 'Dark blue-gray',
    hex: '#2C3E50',
    onPrimary: '#FFFFFF',
    secondaryName: 'Gold',
    secondaryHex: '#F1C40F',
    onSecondary: '#1B1B1B',
  },
  red: {
    id: 'red',
    name: 'Red',
    hex: '#E74C3C',
    onPrimary: '#1B1B1B',
    secondaryName: 'Teal',
    secondaryHex: '#00796B',
    onSecondary: '#FFFFFF',
  },
  orange: {
    id: 'orange',
    name: 'Orange',
    hex: '#F39C12',
    onPrimary: '#1B1B1B',
    secondaryName: 'Navy',
    secondaryHex: '#2C3E50',
    onSecondary: '#FFFFFF',
  },
  'light-gray': {
    id: 'light-gray',
    name: 'Light gray',
    hex: '#ECF0F1',
    onPrimary: '#1B1B1B',
    secondaryName: 'Slate blue',
    secondaryHex: '#546E7A',
    onSecondary: '#FFFFFF',
  },
  'dark-blue': {
    id: 'dark-blue',
    name: 'Dark blue',
    hex: '#34495E',
    onPrimary: '#FFFFFF',
    secondaryName: 'Amber',
    secondaryHex: '#E67E22',
    onSecondary: '#1B1B1B',
  },
} as const;

export type PrimaryColorId = keyof typeof PRIMARY_COLORS;
export const PRIMARY_COLOR_OPTIONS = Object.values(PRIMARY_COLORS);
const DEFAULT_PRIMARY_COLOR: PrimaryColorId = 'dark-blue-gray';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly mode = signal<ThemeMode>(this.getInitialMode());
  readonly primaryColors = PRIMARY_COLOR_OPTIONS;
  readonly primaryColor = signal<PrimaryColorId>(this.getInitialPrimaryColor());

  constructor() {
    this.applyTheme(this.mode());
  }

  setPrimaryColor(colorId: PrimaryColorId): void {
    this.primaryColor.set(colorId);
    this.applyPrimaryColor(colorId, this.mode());
    this.document.defaultView?.localStorage.setItem(PRIMARY_COLOR_STORAGE_KEY, colorId);
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

  private getInitialPrimaryColor(): PrimaryColorId {
    const savedColor = this.document.defaultView?.localStorage.getItem(PRIMARY_COLOR_STORAGE_KEY);
    return PRIMARY_COLOR_OPTIONS.find(({ id }) => id === savedColor)?.id ?? DEFAULT_PRIMARY_COLOR;
  }

  private applyTheme(mode: ThemeMode): void {
    const root = this.document.documentElement;
    root.classList.toggle('dark-theme', mode === 'dark');
    root.style.colorScheme = mode;
    this.applyPrimaryColor(this.primaryColor(), mode);
  }

  private applyPrimaryColor(colorId: PrimaryColorId, mode: ThemeMode): void {
    const root = this.document.documentElement;
    const color = PRIMARY_COLORS[colorId];
    const primaryContainer =
      mode === 'dark'
        ? `color-mix(in srgb, ${color.hex} 35%, #1d1b20)`
        : `color-mix(in srgb, ${color.hex} 18%, #ffffff)`;
    const secondaryContainer =
      mode === 'dark'
        ? `color-mix(in srgb, ${color.secondaryHex} 35%, #1d1b20)`
        : `color-mix(in srgb, ${color.secondaryHex} 18%, #ffffff)`;

    root.style.setProperty('--mat-sys-primary', color.hex);
    root.style.setProperty('--mat-sys-on-primary', color.onPrimary);
    root.style.setProperty('--mat-sys-primary-container', primaryContainer);
    root.style.setProperty(
      '--mat-sys-on-primary-container',
      mode === 'dark' ? '#F5F5F5' : '#1B1B1B',
    );
    root.style.setProperty('--mat-sys-inverse-primary', color.hex);
    root.style.setProperty('--mat-sys-secondary', color.secondaryHex);
    root.style.setProperty('--mat-sys-on-secondary', color.onSecondary);
    root.style.setProperty('--mat-sys-secondary-container', secondaryContainer);
    root.style.setProperty(
      '--mat-sys-on-secondary-container',
      mode === 'dark' ? '#F5F5F5' : '#1B1B1B',
    );
  }
}
