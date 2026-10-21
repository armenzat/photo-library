import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';

describe('routes', () => {
  let harness: RouterTestingHarness;

  const routedTag = () => harness.routeNativeElement?.tagName.toLowerCase();

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
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
