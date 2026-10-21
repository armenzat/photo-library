import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';

import { environment } from '../../environments/environment';
import { Photo, PicsumPhoto } from '../models/photo.model';
import { shuffle } from '../shared/utils/shuffle';

const PAGE_SIZE = 30;
// picsum's /v2/list is a fixed catalog of 993 photos (ids 0-1084 with gaps), always in the same order.
const TOTAL_PHOTOS = 993;
// Only full pages are used: 993 / 30 gives 33 pages and the last 3 photos are dropped,
// so a short page never shows up in the middle of the stream.
const PAGE_COUNT = Math.floor(TOTAL_PHOTOS / PAGE_SIZE);
const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 300;
const LIST_URL = `${environment.picsumBaseUrl}/v2/list`;

const newPageOrder = (): number[] => shuffle(Array.from({ length: PAGE_COUNT }, (_, i) => i + 1));

@Injectable({ providedIn: 'root' })
export class PhotosApi {
  private readonly http = inject(HttpClient);
  // The catalog never changes, so the randomness has to come from us: visit the 33 pages in a
  // shuffled order. Every page is shown exactly once, so no photo repeats and favorites and
  // track ids stay unique. The photos page asks for a new order each time it opens.
  private pageOrder = newPageOrder();

  readonly pageCount = PAGE_COUNT;

  reshuffle(): void {
    this.pageOrder = newPageOrder();
  }

  getPage(index: number): Observable<Photo[]> {
    const page = this.pageOrder[index];
    if (page === undefined) {
      return of([]);
    }
    const params = new HttpParams().set('page', page).set('limit', PAGE_SIZE);

    return this.http.get<PicsumPhoto[]>(LIST_URL, { params }).pipe(
      map((photos) => photos.map(({ id }) => ({ id }))),
      delay(this.randomDelay()),
    );
  }

  photoUrl(id: string, width: number, height: number): string {
    return `${environment.picsumBaseUrl}/id/${id}/${width}/${height}`;
  }

  private randomDelay(): number {
    return MIN_DELAY_MS + Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1));
  }
}
