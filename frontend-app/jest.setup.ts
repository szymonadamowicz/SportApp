import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverMock {
  root: Element | Document | null = null;
  rootMargin = "0px";
  thresholds: ReadonlyArray<number> = [0];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

(global as typeof globalThis).ResizeObserver =
  ResizeObserverMock as unknown as typeof ResizeObserver;
(global as typeof globalThis).IntersectionObserver =
  IntersectionObserverMock as unknown as typeof IntersectionObserver;

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, "crypto", {
    value: {
      randomUUID: () => `test-uuid-${Math.random().toString(16).slice(2)}`,
    },
  });
}

if (!globalThis.crypto.randomUUID) {
  Object.defineProperty(globalThis.crypto, "randomUUID", {
    value: () => `test-uuid-${Math.random().toString(16).slice(2)}`,
  });
}
