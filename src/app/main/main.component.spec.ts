import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { MainComponent } from './main.component';

describe('MainComponent', () => {
  let httpTestingController: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'currentProfile',
      'signIn',
      'signOut',
    ]);
    authService.currentProfile.and.returnValue(of(null));
    authService.signIn.and.returnValue(Promise.resolve());
    authService.signOut.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [MainComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('checks the API health endpoint and displays a connected state', () => {
    const fixture = TestBed.createComponent(MainComponent);
    fixture.detectChanges();

    const button = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((candidate) => candidate.textContent?.includes('Test connection')) as HTMLButtonElement;
    button.click();

    const request = httpTestingController.expectOne('http://localhost:8080/api/health');
    expect(request.request.method).toBe('GET');
    request.flush({ status: 'UP' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.connection-status')?.textContent).toContain(
      'Connected to http://localhost:8080.',
    );
  });

  it('uses the API origin entered in the form', () => {
    const fixture = TestBed.createComponent(MainComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'https://api.example.com/';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const testConnectionButton = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('Test connection')) as HTMLButtonElement;
    testConnectionButton.click();

    const request = httpTestingController.expectOne('https://api.example.com/api/health');
    expect(request.request.method).toBe('GET');
    request.flush({ status: 'UP' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.connection-status')?.textContent).toContain(
      'Connected to https://api.example.com.',
    );
  });

  it('starts Cognito managed sign-in from the account card', () => {
    const fixture = TestBed.createComponent(MainComponent);
    fixture.detectChanges();

    const signInButton = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('Sign in / sign up'));
    expect(signInButton).toBeDefined();

    signInButton?.click();

    expect(authService.signIn).toHaveBeenCalled();
  });
});
