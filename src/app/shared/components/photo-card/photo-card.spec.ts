import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotosApi } from '../../../services/photos-api';
import { PhotoCard } from './photo-card';

describe('PhotoCard', () => {
  let fixture: ComponentFixture<PhotoCard>;
  let el: HTMLElement;

  const img = () => el.querySelector('img')!;

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

  it('should reveal the image only after it has loaded', () => {
    expect(img().classList).not.toContain('loaded');

    img().dispatchEvent(new Event('load'));
    fixture.detectChanges();

    expect(img().classList).toContain('loaded');
  });

  it('should emit selected when clicked', () => {
    const selected = vi.fn();
    fixture.componentInstance.selected.subscribe(selected);

    el.querySelector('button')!.click();

    expect(selected).toHaveBeenCalledTimes(1);
  });
});
