import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, fromEvent } from 'rxjs';

import { StorageService } from './storage';

export const FAVORITES_STORAGE_KEY = 'photo-library:favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly storage = inject(StorageService);
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly idsState = signal<ReadonlySet<string>>(this.load());

  readonly ids = this.idsState.asReadonly();

  constructor() {
    if (!this.window) {
      return;
    }
    fromEvent<StorageEvent>(this.window, 'storage')
      .pipe(
        filter((event) => event.key === FAVORITES_STORAGE_KEY || event.key === null),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.idsState.set(this.load()));
  }

  has(id: string): boolean {
    return this.idsState().has(id);
  }

  add(id: string): boolean {
    if (this.has(id)) {
      return false;
    }
    this.update(new Set(this.idsState()).add(id));
    return true;
  }

  remove(id: string): void {
    if (!this.has(id)) {
      return;
    }
    const next = new Set(this.idsState());
    next.delete(id);
    this.update(next);
  }

  private update(next: ReadonlySet<string>): void {
    this.idsState.set(next);
    this.storage.set(FAVORITES_STORAGE_KEY, [...next]);
  }

  private load(): ReadonlySet<string> {
    const stored = this.storage.get<unknown>(FAVORITES_STORAGE_KEY, []);
    const isIdList = Array.isArray(stored) && stored.every((id) => typeof id === 'string');
    return new Set(isIdList ? stored : []);
  }
}
