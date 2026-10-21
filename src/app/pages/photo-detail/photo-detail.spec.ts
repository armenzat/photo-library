import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { FavoritesService } from '../../services/favorites';
import { PhotosApi } from '../../services/photos-api';
import { PhotoDetail } from './photo-detail';

@Component({ template: '' })
class Blank {}

describe('PhotoDetail', () => {
  let harness: RouterTestingHarness;
  let favorites: FavoritesService;
  let snackBar: MatSnackBar;
  let el: HTMLElement;

  const img = () => el.querySelector('img');
  const removeButton = () => el.querySelector<HTMLButtonElement>('.remove');
  const notFound = () => el.querySelector('.not-found');

  const open = async (id: string, storedIds: string[] = [id]) => {
    localStorage.setItem('photo-library:favorites', JSON.stringify(storedIds));
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'photos/:id', component: PhotoDetail },
            { path: 'favorites', component: Blank },
            { path: '', component: Blank },
          ],
          withComponentInputBinding(),
        ),
        {
          provide: PhotosApi,
          useValue: { photoUrl: (id: string, w: number, h: number) => `/img/${id}/${w}/${h}` },
        },
      ],
    });
    favorites = TestBed.inject(FavoritesService);
    snackBar = TestBed.inject(MatSnackBar);
    vi.spyOn(snackBar, 'open');
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/photos/${id}`, PhotoDetail);
    el = harness.routeNativeElement as HTMLElement;
  };

  beforeEach(() => localStorage.clear());

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should show a large photo for the id from the route', async () => {
    await open('42');

    expect(img()?.getAttribute('src')).toBe('/img/42/1200/800');
  });

  it('should load the photo eagerly with its intrinsic size', async () => {
    await open('42');

    expect(img()?.getAttribute('loading')).toBe('eager');
    expect(img()?.getAttribute('fetchpriority')).toBe('high');
    expect(img()?.getAttribute('width')).toBe('1200');
    expect(img()?.getAttribute('height')).toBe('800');
  });

  it('should show the remove button with a broken heart for a favorite photo', async () => {
    await open('42');

    expect(removeButton()?.textContent).toContain('Remove from favorites');
    expect(removeButton()?.querySelector('mat-icon')?.textContent?.trim()).toBe('heart_broken');
  });

  describe('photo that is not a favorite', () => {
    beforeEach(() => open('42', ['7']));

    it('should explain that the image has to be added to the favorites first', () => {
      expect(notFound()?.textContent).toContain('Image not found in favorites');
      expect(notFound()?.textContent).toContain('Add the image to favorites first');
    });

    it('should link back to the photos page', () => {
      expect(notFound()?.querySelector('a')?.getAttribute('href')).toBe('/');
    });

    it('should not show the photo or the remove button', () => {
      expect(img()).toBeNull();
      expect(removeButton()).toBeNull();
    });

    it('should show the photo once it becomes a favorite', async () => {
      favorites.add('42');
      harness.detectChanges();

      expect(notFound()).toBeNull();
      expect(img()?.getAttribute('src')).toBe('/img/42/1200/800');
    });
  });

  describe('removing', () => {
    beforeEach(async () => {
      await open('42', ['7', '42']);
      removeButton()!.click();
      await harness.fixture.whenStable();
    });

    it('should remove the photo from the favorites', () => {
      expect([...favorites.ids()]).toEqual(['7']);
    });

    it('should confirm the removal', () => {
      expect(snackBar.open).toHaveBeenCalledWith(
        'Removed from favorites',
        undefined,
        expect.anything(),
      );
    });

    it('should go back to the favorites page', () => {
      expect(TestBed.inject(Router).url).toBe('/favorites');
    });
  });

  describe('removing order', () => {
    it('should leave the page before removing so the missing-favorite message never shows', async () => {
      await open('42', ['42']);
      const router = TestBed.inject(Router);
      let urlWhenRemoved: string | undefined;
      vi.spyOn(favorites, 'remove').mockImplementation(() => {
        urlWhenRemoved = router.url;
      });

      removeButton()!.click();
      await harness.fixture.whenStable();

      expect(urlWhenRemoved).toBe('/favorites');
    });
  });

  describe('invalid photo', () => {
    it('should show a not found state when the image fails to load', async () => {
      await open('abc');

      img()!.dispatchEvent(new Event('error'));
      harness.detectChanges();

      expect(notFound()?.textContent).toContain('Image not found in favorites');
      expect(notFound()?.querySelector('a')?.getAttribute('href')).toBe('/');
      expect(img()).toBeNull();
      expect(removeButton()).toBeNull();
    });

    it('should recover when navigating to another photo', async () => {
      await open('abc', ['abc', '2']);
      img()!.dispatchEvent(new Event('error'));
      harness.detectChanges();

      await harness.navigateByUrl('/photos/2', PhotoDetail);
      el = harness.routeNativeElement as HTMLElement;

      expect(notFound()).toBeNull();
      expect(img()?.getAttribute('src')).toBe('/img/2/1200/800');
    });
  });
});
