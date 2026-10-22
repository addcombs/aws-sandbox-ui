import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('checks the API health endpoint and displays a connected state', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
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
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'https://api.example.com/';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    const request = httpTestingController.expectOne('https://api.example.com/api/health');
    expect(request.request.method).toBe('GET');
    request.flush({ status: 'UP' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.connection-status')?.textContent).toContain(
      'Connected to https://api.example.com.',
    );
  });
});
