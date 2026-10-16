import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    localStorage.removeItem('aws-sandbox-theme');
    document.documentElement.classList.remove('dark-theme');
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the workspace shell and theme toggle', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-sidenav')).toBeTruthy();
    expect(compiled.querySelector('mat-toolbar')).toBeTruthy();
    expect(compiled.querySelector('.theme-toggle')?.getAttribute('aria-label')).toMatch(
      /^Switch to (light|dark) theme$/,
    );
  });

  it('should toggle the sidenav from the toolbar hamburger', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('.navigation-toggle') as HTMLButtonElement;
    const startingState = toggle.getAttribute('aria-expanded');

    toggle.click();
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-expanded')).not.toBe(startingState);
  });

  it('should toggle and persist the selected theme', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('.theme-toggle') as HTMLButtonElement;
    const startingLabel = toggle.getAttribute('aria-label');

    toggle.click();
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-label')).not.toBe(startingLabel);
    expect(localStorage.getItem('aws-sandbox-theme')).toMatch(/^(light|dark)$/);
  });
});
