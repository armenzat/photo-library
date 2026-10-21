import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { Photo, PicsumPhoto } from '../models/photo.model';
import { PhotosApi } from './photos-api';

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

  const request = (page = 1, limit = 30) =>
    http.expectOne(
      (req) =>
        req.url === `${environment.picsumBaseUrl}/v2/list` &&
        req.params.get('page') === String(page) &&
        req.params.get('limit') === String(limit),
    );

  it('should request the requested page of the picsum list', () => {
    api.getPage(3, 12).subscribe();
    request(3, 12).flush([]);
  });

  it('should default to 30 photos per page', () => {
    api.getPage(1).subscribe();
    request(1, 30).flush([]);
  });

  it('should map the response to ids only', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    let result: Photo[] | undefined;
    api.getPage(1).subscribe((photos) => (result = photos));
    request().flush([picsumPhoto('3'), picsumPhoto('4')]);
    vi.advanceTimersByTime(200);

    expect(result).toEqual([{ id: '3' }, { id: '4' }]);
  });

  it('should delay the result by 200ms at the minimum', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const next = vi.fn();
    api.getPage(1).subscribe(next);
    request().flush([]);

    vi.advanceTimersByTime(199);
    expect(next).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should delay the result by just under 300ms at the maximum', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const next = vi.fn();
    api.getPage(1).subscribe(next);
    request().flush([]);

    vi.advanceTimersByTime(298);
    expect(next).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should propagate http errors', () => {
    const error = vi.fn();
    api.getPage(1).subscribe({ error });
    request().flush('fail', { status: 500, statusText: 'Server Error' });

    expect(error).toHaveBeenCalledTimes(1);
  });

  it('should build an image url from the id and the size', () => {
    expect(api.photoUrl('10', 400, 600)).toBe(`${environment.picsumBaseUrl}/id/10/400/600`);
  });
});
