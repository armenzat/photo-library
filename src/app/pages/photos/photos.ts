import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-photos',
  imports: [MatProgressSpinnerModule],
  templateUrl: './photos.html',
  styleUrl: './photos.scss',
})
export class Photos {
  protected readonly placeholders = Array.from({ length: 9 }, (_, i) => i);
}
