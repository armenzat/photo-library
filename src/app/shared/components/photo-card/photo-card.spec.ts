import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotosApi } from '../../../services/photos-api';
import { PhotoCard } from './photo-card';

describe('PhotoCard', () => {
  let fixture: ComponentFixture<PhotoCard>;
  let el: HTMLElement;

  const img = () => el.querySelector('img')!;
  const badge = () => el.querySelector('.favorite');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoCard],
      providers: [
        {
          provide: PhotosApi,
          useValue: { photoUrl: (id: string, w: number, h: number) => `/img/${id}/${w}/${h}` },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PhotoCard);
    fixture.componentRef.setInput('photo', { id: '42' });
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should render the image for the photo id', () => {
    expect(img().getAttribute('src')).toBe('/img/42/400/600');
    expect(img().getAttribute('alt')).toBe('Photo 42');
  });

  it('should give the image its intrinsic size', () => {
    expect(img().getAttribute('width')).toBe('400');
    expect(img().getAttribute('height')).toBe('600');
  });

  it('should load the image lazily by default', () => {
    expect(img().getAttribute('loading')).toBe('lazy');
    expect(img().getAttribute('fetchpriority')).not.toBe('high');
  });

  it('should load a priority image eagerly with high fetch priority', () => {
    const priorityFixture = TestBed.createComponent(PhotoCard);
    priorityFixture.componentRef.setInput('photo', { id: '42' });
    priorityFixture.componentRef.setInput('priority', true);
    priorityFixture.detectChanges();
    const priorityImg = priorityFixture.nativeElement.querySelector('img');

    expect(priorityImg.getAttribute('loading')).toBe('eager');
    expect(priorityImg.getAttribute('fetchpriority')).toBe('high');
  });

  it('should switch to a priority image when priority changes after the first render', () => {
    fixture.componentRef.setInput('priority', true);
    fixture.detectChanges();

    expect(img().getAttribute('loading')).toBe('eager');
    expect(img().getAttribute('fetchpriority')).toBe('high');

    fixture.componentRef.setInput('priority', false);
    fixture.detectChanges();

    expect(img().getAttribute('loading')).toBe('lazy');
  });

  it('should reveal the image only after it has loaded', () => {
    expect(img().classList).not.toContain('loaded');

    img().dispatchEvent(new Event('load'));
    fixture.detectChanges();

    expect(img().classList).toContain('loaded');
  });

  it('should not show the favorite badge by default', () => {
    expect(badge()).toBeNull();
  });

  it('should show the favorite badge for a favorite photo', () => {
    fixture.componentRef.setInput('favorite', true);
    fixture.detectChanges();

    expect(badge()).toBeTruthy();
    expect(badge()?.querySelector('mat-icon')?.textContent?.trim()).toBe('favorite');
  });

  it('should label the favorite badge for assistive technology', () => {
    fixture.componentRef.setInput('favorite', true);
    fixture.detectChanges();

    expect(badge()?.getAttribute('role')).toBe('img');
    expect(badge()?.getAttribute('aria-label')).toBe('In favorites');
  });

  it('should emit selected when clicked', () => {
    const selected = vi.fn();
    fixture.componentInstance.selected.subscribe(selected);

    el.querySelector('button')!.click();

    expect(selected).toHaveBeenCalledTimes(1);
  });
});
