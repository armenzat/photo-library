import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockIntersectionObserver } from '../../../../testing/mock-intersection-observer';
import { InfiniteScroll } from './infinite-scroll';

@Component({
  imports: [InfiniteScroll],
  template: `
    @if (visible()) {
      <div appInfiniteScroll [rootMargin]="margin()" (scrolled)="count.set(count() + 1)"></div>
    }
  `,
})
class Host {
  readonly visible = signal(true);
  readonly margin = signal('300px');
  readonly count = signal(0);
}

describe('InfiniteScroll', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  beforeEach(async () => {
    MockIntersectionObserver.install();
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => MockIntersectionObserver.uninstall());

  it('should observe its host element', () => {
    const [observer] = MockIntersectionObserver.active;

    expect(observer.observed).toEqual([fixture.nativeElement.querySelector('div')]);
  });

  it('should pass the root margin to the observer', () => {
    const [observer] = MockIntersectionObserver.active;

    expect(observer.options?.rootMargin).toBe('300px');
  });

  it('should emit scrolled when the host becomes visible', () => {
    MockIntersectionObserver.active[0].trigger(true);

    expect(host.count()).toBe(1);
  });

  it('should not emit scrolled when the host is not visible', () => {
    MockIntersectionObserver.active[0].trigger(false);

    expect(host.count()).toBe(0);
  });

  it('should disconnect the observer when destroyed', async () => {
    host.visible.set(false);
    await fixture.whenStable();

    expect(MockIntersectionObserver.active).toHaveLength(0);
  });
});
