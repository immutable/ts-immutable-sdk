import { PageTracker } from './page';

beforeEach(() => {
  // Reset location for each test
  Object.defineProperty(window, 'location', {
    value: { href: 'https://studio.com/', pathname: '/' },
    writable: true,
  });
});

describe('PageTracker', () => {
  it('calls onPage when pushState is invoked', () => {
    const onPage = jest.fn();
    const tracker = new PageTracker(onPage);
    tracker.installSPAListeners();

    // Simulate a route change
    Object.defineProperty(window, 'location', {
      value: { href: 'https://studio.com/shop', pathname: '/shop' },
      writable: true,
    });
    window.history.pushState({}, '', '/shop');

    expect(onPage).toHaveBeenCalledTimes(1);
    tracker.teardown();
  });

  it('calls onPage when replaceState is invoked', () => {
    const onPage = jest.fn();
    const tracker = new PageTracker(onPage);
    tracker.installSPAListeners();

    Object.defineProperty(window, 'location', {
      value: { href: 'https://studio.com/cart', pathname: '/cart' },
      writable: true,
    });
    window.history.replaceState({}, '', '/cart');

    expect(onPage).toHaveBeenCalledTimes(1);
    tracker.teardown();
  });

  it('deduplicates rapid calls for the same URL', () => {
    const onPage = jest.fn();
    const tracker = new PageTracker(onPage);
    tracker.installSPAListeners();

    // Two pushState calls for the same URL within dedup threshold
    window.history.pushState({}, '', '/shop');
    window.history.pushState({}, '', '/shop');

    expect(onPage).toHaveBeenCalledTimes(1);
    tracker.teardown();
  });

  it('restores original history methods on teardown', () => {
    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;

    const tracker = new PageTracker(jest.fn());
    tracker.installSPAListeners();

    // Methods should be patched
    expect(window.history.pushState).not.toBe(originalPush);
    expect(window.history.replaceState).not.toBe(originalReplace);

    tracker.teardown();

    // Methods should be restored
    expect(window.history.pushState).toBeDefined();
    expect(window.history.replaceState).toBeDefined();
  });
});
