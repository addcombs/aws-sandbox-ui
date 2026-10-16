import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.removeItem('aws-sandbox-theme');
    document.documentElement.classList.remove('dark-theme');
    document.documentElement.style.colorScheme = '';
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
});
