import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { Photo, PicsumPhoto } from '../models/photo.model';

const PAGE_SIZE = 30;
const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 300;
const LIST_URL = `${environment.picsumBaseUrl}/v2/list`;

@Injectable({ providedIn: 'root' })
export class PhotosApi {
  private readonly http = inject(HttpClient);

  getPage(page: number, limit = PAGE_SIZE): Observable<Photo[]> {
    const params = new HttpParams().set('page', page).set('limit', limit);

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
