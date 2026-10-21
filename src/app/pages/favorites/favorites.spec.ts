import { TestBed } from '@angular/core/testing';

import { Favorites } from './favorites';

describe('Favorites', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Favorites],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Favorites);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
