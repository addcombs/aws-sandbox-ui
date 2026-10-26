import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.removeItem('aws-sandbox-theme');
    localStorage.removeItem('aws-sandbox-primary-color');
    document.documentElement.classList.remove('dark-theme');
    document.documentElement.style.colorScheme = '';
    document.documentElement.style.removeProperty('--mat-sys-primary');
    document.documentElement.style.removeProperty('--mat-sys-on-primary');
    document.documentElement.style.removeProperty('--mat-sys-primary-container');
    document.documentElement.style.removeProperty('--mat-sys-on-primary-container');
    document.documentElement.style.removeProperty('--mat-sys-inverse-primary');
    document.documentElement.style.removeProperty('--mat-sys-secondary');
    document.documentElement.style.removeProperty('--mat-sys-on-secondary');
    document.documentElement.style.removeProperty('--mat-sys-secondary-container');
    document.documentElement.style.removeProperty('--mat-sys-on-secondary-container');
    TestBed.configureTestingModule({ providers: [ThemeService] });
  });

  it('uses the operating system preference when no theme is saved', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);

    const theme = TestBed.inject(ThemeService);

    expect(theme.mode()).toBe('dark');
    expect(document.documentElement.classList.contains('dark-theme')).toBeTrue();
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('uses the saved preference instead of the operating system preference', () => {
    localStorage.setItem('aws-sandbox-theme', 'light');
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);

    const theme = TestBed.inject(ThemeService);

    expect(theme.mode()).toBe('light');
    expect(document.documentElement.classList.contains('dark-theme')).toBeFalse();
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('defaults to dark blue-gray as the primary color', () => {
    const theme = TestBed.inject(ThemeService);

    expect(theme.primaryColor()).toBe('dark-blue-gray');
    expect(document.documentElement.style.getPropertyValue('--mat-sys-primary')).toBe('#2C3E50');
  });

  it('applies and persists the selected primary color', () => {
    const theme = TestBed.inject(ThemeService);

    theme.setPrimaryColor('orange');

    expect(document.documentElement.style.getPropertyValue('--mat-sys-primary')).toBe('#F39C12');
    expect(document.documentElement.style.getPropertyValue('--mat-sys-on-primary')).toBe('#1B1B1B');
    expect(document.documentElement.style.getPropertyValue('--mat-sys-secondary')).toBe('#2C3E50');
    expect(theme.primaryColor()).toBe('orange');
    expect(localStorage.getItem('aws-sandbox-primary-color')).toBe('orange');
  });

  it('restores a saved primary color and reapplies it when the theme changes', () => {
    localStorage.setItem('aws-sandbox-primary-color', 'red');

    const theme = TestBed.inject(ThemeService);
    theme.toggleTheme();

    expect(theme.primaryColor()).toBe('red');
    expect(document.documentElement.style.getPropertyValue('--mat-sys-primary')).toBe('#E74C3C');
    expect(document.documentElement.style.getPropertyValue('--mat-sys-primary-container')).toContain(
      'color-mix',
    );
  });
});
