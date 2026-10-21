import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
} from '@angular/core';

@Directive({ selector: '[appInfiniteScroll]' })
export class InfiniteScroll {
  readonly rootMargin = input('300px');
  readonly scrolled = output<void>();

  constructor() {
    const element = inject<ElementRef<Element>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.scrolled.emit();
          }
        },
        { rootMargin: this.rootMargin() },
      );
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
