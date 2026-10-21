import { TestBed } from '@angular/core/testing';

import { Photos } from './photos';

describe('Photos', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Photos],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Photos);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
