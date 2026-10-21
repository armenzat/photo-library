import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Photo } from '../../models/photo.model';
import { PhotosApi } from '../../services/photos-api';
import { PhotosGrid } from '../../shared/components/photos-grid/photos-grid';
import { InfiniteScroll } from '../../shared/directives/infinite-scroll/infinite-scroll';

@Component({
  selector: 'app-photos',
  imports: [InfiniteScroll, MatButtonModule, MatProgressSpinnerModule, PhotosGrid],
  templateUrl: './photos.html',
  styleUrl: './photos.scss',
})
export class Photos {
  private readonly api = inject(PhotosApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly nextIndex = signal(0);

  protected readonly photos = signal<Photo[]>([]);
  protected readonly loading = signal(false);
  protected readonly failed = signal(false);
  protected readonly done = computed(() => this.nextIndex() >= this.api.pageCount);

  constructor() {
    this.loadMore();
  }

  protected loadMore(): void {
    if (this.loading() || this.done()) {
      return;
    }
    this.loading.set(true);
    this.failed.set(false);

    this.api
      .getPage(this.nextIndex())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (batch) => {
          this.photos.update((photos) => [...photos, ...batch]);
          this.nextIndex.update((index) => index + 1);
          this.loading.set(false);
        },
        error: () => {
          this.failed.set(true);
          this.loading.set(false);
        },
      });
  }
}
