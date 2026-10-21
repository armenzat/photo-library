import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Photos } from './photos';

describe('Photos', () => {
  let fixture: ComponentFixture<Photos>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Photos],
    }).compileComponents();
    fixture = TestBed.createComponent(Photos);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a grid of placeholder boxes', () => {
    expect(el.querySelector('.grid')).toBeTruthy();
    expect(el.querySelectorAll('.grid .placeholder')).toHaveLength(9);
  });

  it('should render a loader below the grid', () => {
    const loader = el.querySelector('.loader');

    expect(loader?.querySelector('mat-spinner')).toBeTruthy();
    expect(loader?.previousElementSibling?.classList).toContain('grid');
  });
});
