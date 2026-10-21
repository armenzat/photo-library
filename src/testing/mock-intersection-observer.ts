type Callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void;

export class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly observed: Element[] = [];
  disconnected = false;

  constructor(
    private readonly callback: Callback,
    readonly options?: IntersectionObserverInit,
  ) {
    MockIntersectionObserver.instances.push(this);
  }

  static install(): void {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  }

  static uninstall(): void {
    MockIntersectionObserver.instances = [];
    vi.unstubAllGlobals();
  }

  static get active(): MockIntersectionObserver[] {
    return MockIntersectionObserver.instances.filter((o) => !o.disconnected);
  }

  observe(element: Element): void {
    this.observed.push(element);
  }

  unobserve(): void {}

  disconnect(): void {
    this.disconnected = true;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  trigger(isIntersecting: boolean): void {
    const entries = this.observed.map(
      (target) => ({ isIntersecting, target }) as IntersectionObserverEntry,
    );
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}
