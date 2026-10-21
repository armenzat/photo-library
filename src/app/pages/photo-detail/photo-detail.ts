import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';

import { FavoritesService } from '../../services/favorites';
import { PhotosApi } from '../../services/photos-api';
import { SNACK_BAR_DURATION_MS } from '../../shared/constants';

const WIDTH = 1200;
const HEIGHT = 800;

@Component({
  selector: 'app-photo-detail',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './photo-detail.html',
  styleUrl: './photo-detail.scss',
})
export class PhotoDetail {
  private readonly api = inject(PhotosApi);
  private readonly favorites = inject(FavoritesService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly id = input.required<string>();

  protected readonly src = computed(() => this.api.photoUrl(this.id(), WIDTH, HEIGHT));
  protected readonly isFavorite = computed(() => this.favorites.ids().has(this.id()));
  protected readonly failed = linkedSignal({ source: this.id, computation: () => false });

  protected async remove(): Promise<void> {
    const id = this.id();
    if (await this.router.navigate(['/favorites'])) {
      this.favorites.remove(id);
      this.snackBar.open('Removed from favorites', undefined, { duration: SNACK_BAR_DURATION_MS });
    }
  }
}
