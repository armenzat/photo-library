import { Component, input, output } from '@angular/core';

import { Photo } from '../../../models/photo.model';
import { PhotoCard } from '../photo-card/photo-card';

@Component({
  selector: 'app-photos-grid',
  imports: [PhotoCard],
  templateUrl: './photos-grid.html',
  styleUrl: './photos-grid.scss',
})
export class PhotosGrid {
  readonly photos = input.required<readonly Photo[]>();
  readonly favoriteIds = input<ReadonlySet<string>>(new Set());
  readonly photoSelected = output<Photo>();
}
