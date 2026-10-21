import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

import { MockIntersectionObserver } from '../../../testing/mock-intersection-observer';
import { Photo } from '../../models/photo.model';
import { FavoritesService } from '../../services/favorites';
import { PhotosApi } from '../../services/photos-api';
import { Photos } from './photos';

describe('Photos', () => {
  let fixture: ComponentFixture<Photos>;
  let el: HTMLElement;
  let requests: Subject<Photo[]>[];
  let getPage: ReturnType<typeof vi.fn>;

  const PAGE_COUNT = 2;

  const sentinel = () => el.querySelector('.sentinel');
  const endMessage = () => el.querySelector('.end');
  const spinner = () => el.querySelector('mat-spinner');
  const images = () => Array.from(el.querySelectorAll('.grid img'));
  const retry = () => el.querySelector<HTMLButtonElement>('button');

  const respond = async (ids: string[]) => {
    requests.at(-1)!.next(ids.map((id) => ({ id })));
    requests.at(-1)!.complete();
    await fixture.whenStable();
  };

  const scrollToBottom = async () => {
    MockIntersectionObserver.active[0].trigger(true);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    localStorage.clear();
    MockIntersectionObserver.install();
    requests = [];
    getPage = vi.fn(() => {
      const subject = new Subject<Photo[]>();
      requests.push(subject);
      return subject;
    });

    await TestBed.configureTestingModule({
      imports: [Photos],
      providers: [
        {
          provide: PhotosApi,
          useValue: {
            pageCount: PAGE_COUNT,
            getPage,
            photoUrl: (id: string, w: number, h: number) => `/img/${id}/${w}/${h}`,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Photos);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => {
    MockIntersectionObserver.uninstall();
    localStorage.clear();
  });

  it('should request the first page of the stream on creation', () => {
    expect(getPage).toHaveBeenCalledExactlyOnceWith(0);
  });

  it('should show only the loader while loading', () => {
    expect(spinner()).toBeTruthy();
    expect(images()).toHaveLength(0);
    expect(sentinel()).toBeNull();
  });

  it('should render an image per photo and hide the loader', async () => {
    await respond(['3', '4', '5']);

    expect(images().map((img) => img.getAttribute('src'))).toEqual([
      '/img/3/400/600',
      '/img/4/400/600',
      '/img/5/400/600',
    ]);
    expect(spinner()).toBeNull();
  });

  it('should bring the sentinel back once a batch has loaded', async () => {
    await respond(['3']);

    expect(sentinel()).toBeTruthy();
  });

  it('should load the next page of the stream when the sentinel is reached', async () => {
    await respond(['3']);
    await scrollToBottom();

    expect(getPage).toHaveBeenNthCalledWith(2, 1);
    expect(spinner()).toBeTruthy();
    expect(sentinel()).toBeNull();
  });

  it('should append the next batch after the current photos', async () => {
    await respond(['3']);
    await scrollToBottom();
    await respond(['4', '5']);

    expect(images().map((img) => img.getAttribute('src'))).toEqual([
      '/img/3/400/600',
      '/img/4/400/600',
      '/img/5/400/600',
    ]);
  });

  it('should not show the end message while more pages remain', async () => {
    await respond(['3']);

    expect(endMessage()).toBeNull();
  });

  it('should show the end message instead of the sentinel after the last page', async () => {
    await respond(['3']);
    await scrollToBottom();
    await respond(['4']);

    expect(endMessage()?.textContent).toContain('No more photos to load');
    expect(sentinel()).toBeNull();
    expect(spinner()).toBeNull();
    expect(getPage).toHaveBeenCalledTimes(PAGE_COUNT);
  });

  it('should keep showing the loader for the last batch and only then the end message', async () => {
    await respond(['3']);
    await scrollToBottom();

    expect(spinner()).toBeTruthy();
    expect(endMessage()).toBeNull();
  });

  it('should show an error with a retry button when loading fails', async () => {
    requests.at(-1)!.error(new Error('boom'));
    await fixture.whenStable();

    expect(el.textContent).toContain('Failed to load photos');
    expect(retry()).toBeTruthy();
    expect(spinner()).toBeNull();
    expect(sentinel()).toBeNull();
    expect(endMessage()).toBeNull();
  });

  it('should request the same page of the stream again on retry', async () => {
    requests.at(-1)!.error(new Error('boom'));
    await fixture.whenStable();

    retry()!.click();
    await fixture.whenStable();
    await respond(['7']);

    expect(getPage).toHaveBeenNthCalledWith(2, 0);
    expect(images()).toHaveLength(1);
    expect(el.textContent).not.toContain('Failed to load photos');
  });

  it('should stop listening to a pending request when destroyed', () => {
    expect(requests.at(-1)!.observed).toBe(true);

    fixture.destroy();

    expect(requests.at(-1)!.observed).toBe(false);
  });
  describe('favorites', () => {
    let snackBar: MatSnackBar;
    let favorites: FavoritesService;

    const cardButtons = () => Array.from(el.querySelectorAll<HTMLButtonElement>('app-photo-card button'));

    beforeEach(async () => {
      snackBar = TestBed.inject(MatSnackBar);
      favorites = TestBed.inject(FavoritesService);
      vi.spyOn(snackBar, 'open');
      await respond(['3', '4']);
    });

    it('should add a clicked photo to the favorites and confirm it', async () => {
      cardButtons()[0].click();
      await fixture.whenStable();

      expect([...favorites.ids()]).toEqual(['3']);
      expect(snackBar.open).toHaveBeenCalledWith('Added to favorites', undefined, expect.anything());
    });

    it('should not add a photo twice and say so', async () => {
      cardButtons()[0].click();
      await fixture.whenStable();
      cardButtons()[0].click();
      await fixture.whenStable();

      expect([...favorites.ids()]).toEqual(['3']);
      expect(snackBar.open).toHaveBeenLastCalledWith(
        'Already in favorites',
        undefined,
        expect.anything(),
      );
    });

    it('should keep the order in which photos were added', async () => {
      cardButtons()[1].click();
      cardButtons()[0].click();
      await fixture.whenStable();

      expect([...favorites.ids()]).toEqual(['4', '3']);
    });
  });
});
