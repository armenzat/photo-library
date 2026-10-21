import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';

import { Photo } from '../../models/photo.model';
import { FavoritesService } from '../../services/favorites';
import { PhotosGrid } from '../../shared/components/photos-grid/photos-grid';

@Component({
  selector: 'app-favorites',
  imports: [MatButtonModule, PhotosGrid, RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss',
})
export class Favorites {
  private readonly router = inject(Router);
  private readonly favorites = inject(FavoritesService);

  protected readonly photos = computed<Photo[]>(() =>
    [...this.favorites.ids()].map((id) => ({ id })),
  );

  protected open(photo: Photo): void {
    this.router.navigate(['/photos', photo.id]);
  }
}
