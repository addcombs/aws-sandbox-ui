import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ShellComponent } from './shell.component';

describe('ShellComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    localStorage.removeItem('aws-sandbox-theme');
    document.documentElement.classList.remove('dark-theme');
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'currentProfile',
      'signIn',
      'signOut',
    ]);
    authService.currentProfile.and.returnValue(of(null));
    authService.signIn.and.resolveTo();
    authService.signOut.and.resolveTo();
    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the workspace shell and theme toggle', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-sidenav')).toBeTruthy();
    expect(compiled.querySelector('mat-toolbar')).toBeTruthy();
    expect(compiled.querySelector('.theme-toggle')?.getAttribute('aria-label')).toMatch(
      /^Switch to (light|dark) theme$/,
    );
    expect(compiled.querySelector('.theme-toggle + .profile-control .profile-toggle')).toBeTruthy();
  });

  it('should show a sign-in button in the account popover when signed out', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    const profileControl = fixture.nativeElement.querySelector('.profile-control') as HTMLElement;

    profileControl.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.profile-popover')?.textContent).toContain(
      'Sign in or create an account',
    );
    const signInButton = fixture.nativeElement.querySelector(
      '.profile-popover .profile-action',
    ) as HTMLButtonElement;
    expect(signInButton.textContent).toContain('Sign in / sign up');

    signInButton.click();
    expect(authService.signIn).toHaveBeenCalled();
  });

  it('should show the signed-in user account information on hover', () => {
    authService.currentProfile.and.returnValue(
      of({
        id: 1,
        firstName: 'Ada',
        lastName: 'Lovelace',
        emailAddress: 'ada@example.com',
        createdDate: '',
        updatedDate: '',
      }),
    );
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    const profileControl = fixture.nativeElement.querySelector('.profile-control') as HTMLElement;

    profileControl.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();

    const popover = fixture.nativeElement.querySelector('.profile-popover') as HTMLElement;
    expect(popover.textContent).toContain('Ada Lovelace');
    expect(popover.textContent).toContain('ada@example.com');
    expect(popover.textContent).toContain('Sign out');
  });

  it('should toggle the sidenav from the toolbar hamburger', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('.navigation-toggle') as HTMLButtonElement;
    const startingState = toggle.getAttribute('aria-expanded');

    toggle.click();
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-expanded')).not.toBe(startingState);
  });

  it('should toggle and persist the selected theme', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('.theme-toggle') as HTMLButtonElement;
    const startingLabel = toggle.getAttribute('aria-label');

    toggle.click();
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-label')).not.toBe(startingLabel);
    expect(localStorage.getItem('aws-sandbox-theme')).toMatch(/^(light|dark)$/);
  });
});
