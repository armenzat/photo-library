import { Component, computed, inject, input, output, signal } from '@angular/core';

import { Photo } from '../../../models/photo.model';
import { PhotosApi } from '../../../services/photos-api';

const WIDTH = 400;
const HEIGHT = 600;

@Component({
  selector: 'app-photo-card',
  templateUrl: './photo-card.html',
  styleUrl: './photo-card.scss',
})
export class PhotoCard {
  private readonly api = inject(PhotosApi);

  readonly photo = input.required<Photo>();
  readonly selected = output<void>();

  protected readonly src = computed(() => this.api.photoUrl(this.photo().id, WIDTH, HEIGHT));
  protected readonly loaded = signal(false);
}
