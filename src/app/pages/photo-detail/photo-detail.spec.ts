import { TestBed } from '@angular/core/testing';

import { PhotoDetail } from './photo-detail';

describe('PhotoDetail', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoDetail],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PhotoDetail);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
