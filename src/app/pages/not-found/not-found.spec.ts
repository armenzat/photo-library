import { TestBed } from '@angular/core/testing';

import { NotFound } from './not-found';

describe('NotFound', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(NotFound);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
