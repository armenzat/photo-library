import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NotFound } from './not-found';

describe('NotFound', () => {
  let fixture: ComponentFixture<NotFound>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(NotFound);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should tell the user the page was not found', () => {
    expect(el.textContent).toContain('Page not found');
  });

  it('should link back to the photos page', () => {
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/');
    expect(el.querySelector('a')?.textContent).toContain('Browse photos');
  });
});
