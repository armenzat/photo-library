import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { Photo } from '../../models/photo.model';
import { PhotosApi } from '../../services/photos-api';
import { Photos } from './photos';

describe('Photos', () => {
  let fixture: ComponentFixture<Photos>;
  let el: HTMLElement;
  let requests: Subject<Photo[]>[];
  let getPage: ReturnType<typeof vi.fn>;

  const placeholders = () => el.querySelectorAll('.placeholder');
  const spinner = () => el.querySelector('mat-spinner');
  const images = () => Array.from(el.querySelectorAll('.grid img'));
  const retry = () => el.querySelector<HTMLButtonElement>('button');

  const respond = (ids: string[]) => {
    requests.at(-1)!.next(ids.map((id) => ({ id })));
    requests.at(-1)!.complete();
    fixture.detectChanges();
  };

  beforeEach(async () => {
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
            getPage,
            photoUrl: (id: string, w: number, h: number) => `/img/${id}/${w}/${h}`,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Photos);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should request the first page of the stream on creation', () => {
    expect(getPage).toHaveBeenCalledExactlyOnceWith(0);
  });

  it('should show only the loader while loading', () => {
    expect(spinner()).toBeTruthy();
    expect(placeholders()).toHaveLength(0);
    expect(images()).toHaveLength(0);
  });

  it('should render an image per photo and hide the loader', () => {
    respond(['3', '4', '5']);

    expect(images().map((img) => img.getAttribute('src'))).toEqual([
      '/img/3/400/600',
      '/img/4/400/600',
      '/img/5/400/600',
    ]);
    expect(spinner()).toBeNull();
  });

  it('should show an error with a retry button when loading fails', () => {
    requests.at(-1)!.error(new Error('boom'));
    fixture.detectChanges();

    expect(el.textContent).toContain('Failed to load photos');
    expect(retry()).toBeTruthy();
    expect(spinner()).toBeNull();
  });

  it('should request the same page of the stream again on retry', () => {
    requests.at(-1)!.error(new Error('boom'));
    fixture.detectChanges();

    retry()!.click();
    fixture.detectChanges();
    respond(['7']);

    expect(getPage).toHaveBeenNthCalledWith(2, 0);
    expect(images()).toHaveLength(1);
    expect(el.textContent).not.toContain('Failed to load photos');
  });

  it('should stop listening to a pending request when destroyed', () => {
    expect(requests.at(-1)!.observed).toBe(true);

    fixture.destroy();

    expect(requests.at(-1)!.observed).toBe(false);
  });
});
