import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import type { UserProfile } from '../models/user-profile';
import { CurrentUserService } from './current-user.service';

describe('CurrentUserService', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let currentUser: CurrentUserService;

  const profile: UserProfile = {
    id: 1,
    firstName: 'Ada',
    lastName: 'Lovelace',
    emailAddress: 'ada@example.com',
    createdDate: '',
    updatedDate: '',
  };

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'currentProfile',
      'signIn',
      'signOut',
    ]);
    authService.currentProfile.and.returnValue(of(profile));
    authService.signIn.and.resolveTo();
    authService.signOut.and.resolveTo();

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authService }],
    });
    currentUser = TestBed.inject(CurrentUserService);
  });

  it('loads a profile once and shares its state', () => {
    currentUser.loadCurrentUser('https://api.example.com');
    currentUser.loadCurrentUser('https://api.example.com');

    expect(authService.currentProfile).toHaveBeenCalledOnceWith('https://api.example.com');
    expect(currentUser.profile()).toEqual(profile);
    expect(currentUser.displayName()).toBe('Ada Lovelace');
    expect(currentUser.status()).toBe('signed-in');
  });

  it('clears the shared profile after signing out', fakeAsync(() => {
    currentUser.loadCurrentUser('https://api.example.com');
    currentUser.signOut();
    flushMicrotasks();

    expect(currentUser.profile()).toBeNull();
    expect(currentUser.status()).toBe('signed-out');
  }));
});
