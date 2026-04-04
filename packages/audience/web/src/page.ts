import { isBrowser } from './utils';

const DEDUP_THRESHOLD_MS = 100;

/**
 * Page view tracker with SPA route detection.
 *
 * When installed, patches history.pushState / replaceState and listens
 * for popstate events to detect client-side navigation. Deduplicates
 * rapid-fire calls for the same URL (some routers fire multiple events).
 */
export class PageTracker {
  private lastPageUrl: string | null = null;

  private lastPageTime = 0;

  private installed = false;

  private originalPushState?: typeof window.history.pushState;

  private originalReplaceState?: typeof window.history.replaceState;

  private popstateHandler?: () => void;

  constructor(
    private readonly onPage: (properties?: Record<string, unknown>) => void,
  ) {}

  /** Install SPA route-change listeners (popstate + history patching). */
  installSPAListeners(): void {
    if (!isBrowser() || this.installed) return;
    this.installed = true;

    // Back/forward navigation
    this.popstateHandler = () => this.handleRouteChange();
    window.addEventListener('popstate', this.popstateHandler);

    // Patch pushState
    this.originalPushState = window.history.pushState.bind(window.history);
    window.history.pushState = (...args: Parameters<typeof window.history.pushState>) => {
      this.originalPushState!(...args);
      this.handleRouteChange();
    };

    // Patch replaceState
    this.originalReplaceState = window.history.replaceState.bind(window.history);
    window.history.replaceState = (...args: Parameters<typeof window.history.replaceState>) => {
      this.originalReplaceState!(...args);
      this.handleRouteChange();
    };
  }

  /** Restore original history methods and remove listeners. */
  teardown(): void {
    if (!this.installed) return;

    if (this.popstateHandler) {
      window.removeEventListener('popstate', this.popstateHandler);
    }
    if (this.originalPushState) {
      window.history.pushState = this.originalPushState;
    }
    if (this.originalReplaceState) {
      window.history.replaceState = this.originalReplaceState;
    }
    this.installed = false;
  }

  private handleRouteChange(): void {
    if (!isBrowser()) return;

    const now = Date.now();
    const url = window.location.href;

    // Dedup: suppress if same URL within threshold
    if (url === this.lastPageUrl && now - this.lastPageTime < DEDUP_THRESHOLD_MS) {
      return;
    }

    this.lastPageUrl = url;
    this.lastPageTime = now;
    this.onPage();
  }
}
