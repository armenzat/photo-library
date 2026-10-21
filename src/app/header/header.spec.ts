import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { Header } from './header';

@Component({ template: '' })
class Blank {}

describe('Header', () => {
  let harness: RouterTestingHarness;
  let el: HTMLElement;

  const link = (text: string) =>
    Array.from(el.querySelectorAll('a')).find((a) => a.textContent?.trim() === text)!;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([
          { path: '', component: Blank },
          { path: 'favorites', component: Blank },
          { path: 'photos/:id', component: Blank },
        ]),
      ],
    });
    harness = await RouterTestingHarness.create();
    const fixture = TestBed.createComponent(Header);
    el = fixture.nativeElement;
    fixture.autoDetectChanges();
  });

  it('should render a toolbar with Photos and Favorites links', () => {
    expect(el.querySelector('mat-toolbar')).toBeTruthy();
    expect(link('Photos').getAttribute('href')).toBe('/');
    expect(link('Favorites').getAttribute('href')).toBe('/favorites');
  });

  it('should highlight Photos on /', async () => {
    await harness.navigateByUrl('/');

    expect(link('Photos').classList).toContain('active');
    expect(link('Favorites').classList).not.toContain('active');
  });

  it('should highlight Favorites on /favorites', async () => {
    await harness.navigateByUrl('/favorites');

    expect(link('Favorites').classList).toContain('active');
    expect(link('Photos').classList).not.toContain('active');
  });

  it('should highlight nothing on a photo page', async () => {
    await harness.navigateByUrl('/photos/1');

    expect(link('Photos').classList).not.toContain('active');
    expect(link('Favorites').classList).not.toContain('active');
  });

  it('should mark the active link as the current page for assistive technology', async () => {
    await harness.navigateByUrl('/favorites');

    expect(link('Favorites').getAttribute('aria-current')).toBe('page');
    expect(link('Photos').hasAttribute('aria-current')).toBe(false);
  });
});
