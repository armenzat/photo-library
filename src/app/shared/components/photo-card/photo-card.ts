import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { Photo } from '../../../models/photo.model';
import { PhotosApi } from '../../../services/photos-api';

const WIDTH = 400;
const HEIGHT = 600;

@Component({
  selector: 'app-photo-card',
  imports: [MatIconModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './photo-card.html',
  styleUrl: './photo-card.scss',
})
export class PhotoCard {
  private readonly api = inject(PhotosApi);

  readonly photo = input.required<Photo>();
  readonly favorite = input(false);
  readonly priority = input(false);
  readonly selected = output<void>();

  protected readonly width = WIDTH;
  protected readonly height = HEIGHT;
  protected readonly src = computed(() => this.api.photoUrl(this.photo().id, WIDTH, HEIGHT));
  protected readonly loaded = signal(false);
}
