import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { Photo, PicsumPhoto } from '../models/photo.model';
import { PhotosApi } from './photos-api';

const LIST_URL = `${environment.picsumBaseUrl}/v2/list`;

const picsumPhoto = (id: string): PicsumPhoto => ({
  id,
  author: 'Author',
  width: 5000,
  height: 3333,
  url: `https://unsplash.com/photos/${id}`,
  download_url: `https://picsum.photos/id/${id}/5000/3333`,
});

describe('PhotosApi', () => {
  let api: PhotosApi;
  let http: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(PhotosApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const request = () => http.expectOne((req) => req.url === LIST_URL);

  const requestedPage = (index: number): number => {
    api.getPage(index).subscribe();
    const req = request();
    const page = Number(req.request.params.get('page'));
    req.flush([]);
    vi.advanceTimersByTime(300);
    return page;
  };

  it('should expose 33 full pages of 30 photos', () => {
    expect(api.pageCount).toBe(33);
  });

  it('should request 30 photos per page', () => {
    api.getPage(0).subscribe();
    const req = request();

    expect(req.request.params.get('limit')).toBe('30');
    req.flush([]);
  });

  it('should request every page from 1 to 33 exactly once over a full lap', () => {
    const pages = Array.from({ length: api.pageCount }, (_, i) => requestedPage(i));

    expect([...pages].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 33 }, (_, i) => i + 1),
    );
  });

  it('should never request the short last page', () => {
    const pages = Array.from({ length: api.pageCount }, (_, i) => requestedPage(i));

    expect(pages).not.toContain(34);
  });

  it('should request the same page for the same index', () => {
    const first = requestedPage(5);
    const second = requestedPage(5);

    expect(second).toBe(first);
  });

  it('should visit the pages in a different order after reshuffling', () => {
    const before = Array.from({ length: api.pageCount }, (_, i) => requestedPage(i));

    api.reshuffle();
    const after = Array.from({ length: api.pageCount }, (_, i) => requestedPage(i));

    expect(after).not.toEqual(before);
  });

  it('should still visit every page from 1 to 33 exactly once after reshuffling', () => {
    api.reshuffle();
    const pages = Array.from({ length: api.pageCount }, (_, i) => requestedPage(i));

    expect([...pages].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 33 }, (_, i) => i + 1),
    );
  });

  it('should return an empty list without a request past the last page', () => {
    const next = vi.fn();

    api.getPage(api.pageCount).subscribe(next);

    expect(next).toHaveBeenCalledWith([]);
    http.expectNone(LIST_URL);
  });

  it('should map the response to ids only', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    let result: Photo[] | undefined;
    api.getPage(0).subscribe((photos) => (result = photos));
    request().flush([picsumPhoto('3'), picsumPhoto('4')]);
    vi.advanceTimersByTime(200);

    expect(result).toEqual([{ id: '3' }, { id: '4' }]);
  });

  it('should delay the result by 200ms at the minimum', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const next = vi.fn();
    api.getPage(0).subscribe(next);
    request().flush([]);

    vi.advanceTimersByTime(199);
    expect(next).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should delay the result by just under 300ms at the maximum', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const next = vi.fn();
    api.getPage(0).subscribe(next);
    request().flush([]);

    vi.advanceTimersByTime(298);
    expect(next).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should propagate http errors', () => {
    const error = vi.fn();
    api.getPage(0).subscribe({ error });
    request().flush('fail', { status: 500, statusText: 'Server Error' });

    expect(error).toHaveBeenCalledTimes(1);
  });

  it('should build an image url from the id and the size', () => {
    expect(api.photoUrl('10', 400, 600)).toBe(`${environment.picsumBaseUrl}/id/10/400/600`);
  });
});
