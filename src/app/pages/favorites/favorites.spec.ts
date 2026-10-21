import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { FavoritesService } from '../../services/favorites';
import { PhotosApi } from '../../services/photos-api';
import { Favorites } from './favorites';

@Component({ template: '' })
class Blank {}

describe('Favorites', () => {
  let fixture: ComponentFixture<Favorites>;
  let favorites: FavoritesService;
  let el: HTMLElement;

  const cards = () => Array.from(el.querySelectorAll('app-photo-card'));
  const srcs = () => cards().map((card) => card.querySelector('img')!.getAttribute('src'));
  const emptyState = () => el.querySelector('.empty');

  const open = async (storedIds: string[] = []) => {
    localStorage.setItem('photo-library:favorites', JSON.stringify(storedIds));
    TestBed.configureTestingModule({
      imports: [Favorites],
      providers: [
        provideRouter([{ path: 'photos/:id', component: Blank }]),
        {
          provide: PhotosApi,
          useValue: { photoUrl: (id: string, w: number, h: number) => `/img/${id}/${w}/${h}` },
        },
      ],
    });
    favorites = TestBed.inject(FavoritesService);
    fixture = TestBed.createComponent(Favorites);
    el = fixture.nativeElement;
    await fixture.whenStable();
  };

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('should show an empty state with a link back to the photos when there are no favorites', async () => {
    await open([]);

    expect(emptyState()?.textContent).toContain('No favorites yet');
    expect(emptyState()?.querySelector('a')?.getAttribute('href')).toBe('/');
    expect(cards()).toHaveLength(0);
  });

  it('should render the favorite photos in the order they were added', async () => {
    await open(['9', '2', '5']);

    expect(srcs()).toEqual(['/img/9/400/600', '/img/2/400/600', '/img/5/400/600']);
    expect(emptyState()).toBeNull();
  });

  it('should load the first row of photos eagerly and the rest lazily', async () => {
    await open(['1', '2', '3', '4']);

    const loading = Array.from(el.querySelectorAll('img')).map((img) => img.getAttribute('loading'));
    expect(loading).toEqual(['eager', 'eager', 'eager', 'lazy']);
  });

  it('should keep a photo that moves into the first row loading correctly', async () => {
    await open(['1', '2', '3', '4']);

    favorites.remove('1');
    await fixture.whenStable();

    const loading = Array.from(el.querySelectorAll('img')).map((img) => img.getAttribute('loading'));
    expect(loading).toEqual(['eager', 'eager', 'eager']);
  });

  it('should not show favorite badges', async () => {
    await open(['1', '2']);

    expect(el.querySelectorAll('.favorite')).toHaveLength(0);
  });

  it('should open the single photo page when a photo is clicked', async () => {
    await open(['9', '2']);

    cards()[1].querySelector('button')!.click();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/photos/2');
  });

  it('should drop a photo that is removed from the favorites', async () => {
    await open(['1', '2']);

    favorites.remove('1');
    await fixture.whenStable();

    expect(srcs()).toEqual(['/img/2/400/600']);
  });

  it('should show the empty state once the last favorite is removed', async () => {
    await open(['1']);

    favorites.remove('1');
    await fixture.whenStable();

    expect(emptyState()).toBeTruthy();
  });
});
