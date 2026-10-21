import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Photo } from '../../models/photo.model';
import { PhotosApi } from '../../services/photos-api';

@Component({
  selector: 'app-photos',
  imports: [MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './photos.html',
  styleUrl: './photos.scss',
})
export class Photos {
  private readonly api = inject(PhotosApi);
  private readonly destroyRef = inject(DestroyRef);
  private page = 1;

  protected readonly photos = signal<Photo[]>([]);
  protected readonly loading = signal(false);
  protected readonly failed = signal(false);

  constructor() {
    this.loadMore();
  }

  protected src(id: string): string {
    return this.api.photoUrl(id, 400, 600);
  }

  protected loadMore(): void {
    this.loading.set(true);
    this.failed.set(false);

    this.api
      .getPage(this.page)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (batch) => {
          this.photos.update((photos) => [...photos, ...batch]);
          this.page++;
          this.loading.set(false);
        },
        error: () => {
          this.failed.set(true);
          this.loading.set(false);
        },
      });
  }
}
