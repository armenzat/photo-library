import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Photo } from '../../models/photo.model';
import { FavoritesService } from '../../services/favorites';
import { PhotosApi } from '../../services/photos-api';
import { PhotosGrid } from '../../shared/components/photos-grid/photos-grid';
import { SNACK_BAR_DURATION_MS } from '../../shared/constants';
import { InfiniteScroll } from '../../shared/directives/infinite-scroll/infinite-scroll';

@Component({
  selector: 'app-photos',
  imports: [InfiniteScroll, MatButtonModule, MatProgressSpinnerModule, PhotosGrid],
  templateUrl: './photos.html',
  styleUrl: './photos.scss',
})
export class Photos {
  private readonly api = inject(PhotosApi);
  private readonly favorites = inject(FavoritesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly nextIndex = signal(0);

  protected readonly photos = signal<Photo[]>([]);
  protected readonly favoriteIds = this.favorites.ids;
  protected readonly loading = signal(false);
  protected readonly failed = signal(false);
  protected readonly done = computed(() => this.nextIndex() >= this.api.pageCount);

  constructor() {
    this.api.reshuffle();
    this.loadMore();
  }

  protected addToFavorites(photo: Photo): void {
    const added = this.favorites.add(photo.id);
    this.snackBar.open(added ? 'Added to favorites' : 'Already in favorites', undefined, {
      duration: SNACK_BAR_DURATION_MS,
    });
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
