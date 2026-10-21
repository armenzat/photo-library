import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';

describe('routes', () => {
  afterEach(() => localStorage.clear());

  let harness: RouterTestingHarness;

  const routedTag = () => harness.routeNativeElement?.tagName.toLowerCase();

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  it('should show the photos page on /', async () => {
    await harness.navigateByUrl('/');

    expect(routedTag()).toBe('app-photos');
  });

  it('should show the favorites page on /favorites', async () => {
    await harness.navigateByUrl('/favorites');

    expect(routedTag()).toBe('app-favorites');
  });

  it('should show the photo page on /photos/:id', async () => {
    localStorage.setItem('photo-library:favorites', JSON.stringify(['42']));
    await harness.navigateByUrl('/photos/42');

    expect(routedTag()).toBe('app-photo-detail');
  });

  it.each(['/nope', '/photos', '/favorites/extra', '/photos/1/extra'])(
    'should show the not found page for %s',
    async (url) => {
      await harness.navigateByUrl(url);

      expect(routedTag()).toBe('app-not-found');
    },
  );
});
