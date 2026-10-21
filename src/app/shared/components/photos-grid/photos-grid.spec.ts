import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Photo } from '../../../models/photo.model';
import { PhotosApi } from '../../../services/photos-api';
import { PhotosGrid } from './photos-grid';

describe('PhotosGrid', () => {
  let fixture: ComponentFixture<PhotosGrid>;
  let el: HTMLElement;

  const photos: Photo[] = [{ id: '1' }, { id: '2' }, { id: '3' }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotosGrid],
      providers: [
        {
          provide: PhotosApi,
          useValue: { photoUrl: (id: string, w: number, h: number) => `/img/${id}/${w}/${h}` },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PhotosGrid);
    fixture.componentRef.setInput('photos', photos);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should render a card per photo', () => {
    expect(el.querySelectorAll('app-photo-card')).toHaveLength(3);
  });

  it('should render the cards in the order of the photos', () => {
    const srcs = Array.from(el.querySelectorAll('img')).map((img) => img.getAttribute('src'));

    expect(srcs).toEqual(['/img/1/400/600', '/img/2/400/600', '/img/3/400/600']);
  });

  it('should mark only the favorite photos', () => {
    fixture.componentRef.setInput('favoriteIds', new Set(['2']));
    fixture.detectChanges();

    const cards = Array.from(el.querySelectorAll('app-photo-card'));
    expect(cards.map((card) => !!card.querySelector('.favorite'))).toEqual([false, true, false]);
  });

  it('should not mark any photo by default', () => {
    expect(el.querySelectorAll('.favorite')).toHaveLength(0);
  });

  it('should emit the photo of the clicked card', () => {
    const selected = vi.fn();
    fixture.componentInstance.photoSelected.subscribe(selected);

    el.querySelectorAll('button')[1].click();

    expect(selected).toHaveBeenCalledExactlyOnceWith({ id: '2' });
  });
});
