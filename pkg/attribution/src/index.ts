import { getStorageAdapter, MemoryStorageAdapter, type StorageAdapter } from './storage';
import {
  parseAttributionFromUrl,
  mergeAttributionData,
  type AttributionData,
} from './attribution';
import {
  getAnonymousId,
  resetAnonymousId,
  setUserId,
  getUserId,
  setUserEmail,
  getUserEmail,
  setOptOut,
  isOptedOut,
} from './id';
import {
  queueEvent,
  getQueuedEvents,
  clearEventQueue,
  removeEventsFromQueue,
  type EventData,
} from './events';
import {
  extractDeepLinkData,
  type DeepLinkData,
} from './deeplink';

const ATTRIBUTION_DATA_KEY = '__imtbl_attribution_data__';

/**
 * Configuration options for Attribution SDK
 */
export interface AttributionConfig {
  /** API endpoint for sending events (required) */
  apiEndpoint: string;
  /** API key for authentication (optional) */
  apiKey?: string;
  /** Whether to automatically track page views */
  trackPageViews?: boolean;
  /** Custom storage adapter (defaults to auto-detected storage) */
  storage?: StorageAdapter;
  /** Whether to parse attribution from current URL on init */
  parseOnInit?: boolean;
  /** Callback function called when deep link is detected */
  onDeepLink?: (deepLink: DeepLinkData) => void;
}

/**
 * Attribution SDK - replacement for AppsFlyer/Adjust web SDKs
 *
 * Provides a minimal, dependency-free marketing attribution solution with
 * APIs compatible with AppsFlyer and Adjust for easy migration.
 *
 * @example
 * ```typescript
 * import { Attribution } from '@imtbl/attribution';
 *
 * const attribution = new Attribution({
 *   apiEndpoint: 'https://api.example.com/events',
 *   apiKey: 'your-api-key',
 * });
 *
 * // Get anonymous ID (similar to AppsFlyer.getAppsFlyerUID())
 * const anonymousId = attribution.getAnonymousId();
 *
 * // Track events (similar to AppsFlyer.logEvent())
 * attribution.logEvent('purchase', { revenue: 99.99 });
 *
 * // Set user ID (similar to AppsFlyer.setCustomerUserId())
 * attribution.setUserId('user123');
 * ```
 */
export class Attribution {
  private storage: StorageAdapter;
  private config: AttributionConfig;
  private initialized = false;

  constructor(config: AttributionConfig) {
    if (!config.apiEndpoint) {
      throw new Error('apiEndpoint is required');
    }
    
    this.config = {
      trackPageViews: false,
      parseOnInit: true,
      ...config,
    };
    this.storage = config.storage || getStorageAdapter();

    if (this.config.parseOnInit && typeof window !== 'undefined') {
      this.parseAttribution();
    }

    if (this.config.trackPageViews && typeof window !== 'undefined') {
      this.trackPageView();
    }

    this.initialized = true;
  }

  /**
   * Initialize the SDK (called automatically in constructor, but can be called manually)
   */
  init(): void {
    if (this.initialized) {
      return;
    }

    if (this.config.parseOnInit && typeof window !== 'undefined') {
      this.parseAttribution();
    }

    if (this.config.trackPageViews && typeof window !== 'undefined') {
      this.trackPageView();
    }

    this.initialized = true;
  }

  /**
   * Parse attribution data from current URL
   * Similar to AppsFlyer's automatic attribution parsing
   */
  parseAttribution(url?: string): AttributionData {
    const incoming = parseAttributionFromUrl(url);
    const existing = this.getAttributionData();

    const merged = mergeAttributionData(existing, incoming);
    this.saveAttributionData(merged);

    // Check for deep link and trigger callback if configured
    if (this.config.onDeepLink) {
      const deepLink = extractDeepLinkData(merged);
      if (deepLink) {
        this.config.onDeepLink(deepLink);
      }
    }

    return merged;
  }

  /**
   * Get stored attribution data
   */
  getAttributionData(): AttributionData | null {
    const dataStr = this.storage.getItem(ATTRIBUTION_DATA_KEY);
    if (!dataStr) {
      return null;
    }

    try {
      return JSON.parse(dataStr) as AttributionData;
    } catch {
      return null;
    }
  }

  /**
   * Save attribution data to storage
   */
  private saveAttributionData(data: AttributionData): void {
    this.storage.setItem(ATTRIBUTION_DATA_KEY, JSON.stringify(data));
  }

  /**
   * Get anonymous ID (AppsFlyer/Adjust compatible)
   * Similar to AppsFlyer.getAppsFlyerUID() or Adjust.getAdid()
   */
  getAnonymousId(): string {
    return getAnonymousId(this.storage);
  }

  /**
   * Reset anonymous ID (generates new one)
   */
  resetAnonymousId(): string {
    return resetAnonymousId(this.storage);
  }

  /**
   * Set user ID (AppsFlyer/Adjust compatible)
   * Similar to AppsFlyer.setCustomerUserId() or Adjust.setUserId()
   */
  setUserId(userId: string | null): void {
    setUserId(this.storage, userId);
  }

  /**
   * Get user ID
   */
  getUserId(): string | null {
    return getUserId(this.storage);
  }

  /**
   * Set user email (AppsFlyer/Adjust compatible)
   * Similar to AppsFlyer.setUserEmails() or Adjust.setEmail()
   */
  setUserEmail(email: string | null): void {
    setUserEmail(this.storage, email);
  }

  /**
   * Get user email
   */
  getUserEmail(): string | null {
    return getUserEmail(this.storage);
  }

  /**
   * Log an event (AppsFlyer/Adjust compatible)
   * Similar to AppsFlyer.logEvent() or Adjust.trackEvent()
   *
   * Events are sent immediately. If the network request fails, the event
   * is queued and will be retried automatically (like AppsFlyer/Adjust).
   *
   * If user has opted out, events are queued but not sent.
   *
   * @param eventName - Event name
   * @param eventParams - Event parameters (e.g., { revenue: 99.99, currency: 'USD' })
   */
  logEvent(
    eventName: string,
    eventParams?: Record<string, string | number | boolean>,
  ): void {
    // Check if user has opted out
    if (this.isOptedOut()) {
      // Queue event but don't send (for when opt-out is removed)
      queueEvent(this.storage, eventName, eventParams);
      return;
    }

    // Queue event first (for offline resilience)
    queueEvent(this.storage, eventName, eventParams);

    // Send immediately (like AppsFlyer/Adjust do)
    this.sendEvent(eventName, eventParams).catch(() => {
      // Event is already queued, will be retried automatically
    });
  }

  /**
   * Track page view (automatically called if trackPageViews is enabled)
   */
  trackPageView(pageName?: string): void {
    const params: Record<string, string> = {
      page_url: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (pageName) {
      params.page_name = pageName;
    }

    this.logEvent('page_view', params);
  }

  /**
   * Get all queued events
   */
  getQueuedEvents(): EventData[] {
    return getQueuedEvents(this.storage);
  }

  /**
   * Send queued events to API endpoint
   * Called automatically on network recovery or can be called manually
   * (Internal retry mechanism, similar to AppsFlyer/Adjust)
   */
  async sendQueuedEvents(): Promise<void> {
    const events = getQueuedEvents(this.storage);
    if (events.length === 0) {
      return;
    }

    try {
      await this.sendEvents(events);
      clearEventQueue(this.storage);
    } catch (error) {
      // Events remain in queue for retry
      throw error;
    }
  }

  /**
   * Send a single event to API endpoint
   * Internal method - events are queued first, then sent immediately
   * If send fails, event remains in queue for retry
   */
  private async sendEvent(
    eventName: string,
    eventParams?: Record<string, string | number | boolean>,
  ): Promise<void> {
    const event: EventData = {
      eventName,
      eventParams,
      timestamp: Date.now(),
    };

    await this.sendEvents([event]);
    
    // On successful send, remove the most recent matching event from queue
    const queue = getQueuedEvents(this.storage);
    if (queue.length > 0) {
      // Find last matching event (most recent)
      let foundIndex = -1;
      for (let i = queue.length - 1; i >= 0; i--) {
        const e = queue[i];
        if (
          e.eventName === eventName &&
          JSON.stringify(e.eventParams) === JSON.stringify(eventParams)
        ) {
          foundIndex = i;
          break;
        }
      }
      
      if (foundIndex !== -1) {
        const updatedQueue = queue.filter((_, i) => i !== foundIndex);
        if (updatedQueue.length === 0) {
          clearEventQueue(this.storage);
        } else {
          const queueStr = JSON.stringify(updatedQueue);
          this.storage.setItem('__imtbl_attribution_event_queue__', queueStr);
        }
      }
    }
  }

  /**
   * Send events to API endpoint
   */
  private async sendEvents(events: EventData[]): Promise<void> {
    if (events.length === 0) {
      return;
    }

    const payload = {
      anonymousId: this.getAnonymousId(),
      userId: this.getUserId(),
      email: this.getUserEmail(),
      attribution: this.getAttributionData(),
      events,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers.Authorization = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(this.config.apiEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to send events: ${response.statusText}`);
    }
  }

  /**
   * Get deep link data from current attribution
   * Similar to AppsFlyer.getDeepLinkValue() or Adjust.getDeeplink()
   */
  getDeepLinkData(): DeepLinkData | null {
    const attribution = this.getAttributionData();
    return extractDeepLinkData(attribution);
  }

  /**
   * Set opt-out status (GDPR compliance)
   * Similar to AppsFlyer.setDisableCollectIAd() or Adjust.setOfflineMode()
   * When opted out, events are not sent (but still queued for when opt-out is removed)
   */
  setOptOut(optedOut: boolean): void {
    const wasOptedOut = this.isOptedOut();
    setOptOut(this.storage, optedOut);
    
    // If opting out, send an opt-out event (bypass opt-out check for this event)
    if (optedOut && !wasOptedOut) {
      queueEvent(this.storage, 'opt_out', { timestamp: Date.now() });
      this.sendEvent('opt_out', { timestamp: Date.now() }).catch(() => {
        // Event queued for retry
      });
    }
  }

  /**
   * Get opt-out status (GDPR compliance)
   */
  isOptedOut(): boolean {
    return isOptedOut(this.storage);
  }

  /**
   * Forget user data (GDPR "right to be forgotten")
   * Similar to AppsFlyer.stop() or Adjust.gdprForgetMe()
   * Clears all local data and sends forget event to backend
   */
  forgetMe(): void {
    // Send forget me event before clearing data
    this.logEvent('forget_me', {
      anonymousId: this.getAnonymousId(),
      timestamp: Date.now(),
    });

    // Clear all local data
    this.clear();
    
    // Also clear opt-out status
    this.storage.removeItem('__imtbl_attribution_opt_out__');
  }

  /**
   * Clear all stored data (for testing or reset)
   */
  clear(): void {
    this.storage.removeItem(ATTRIBUTION_DATA_KEY);
    this.storage.removeItem('__imtbl_attribution_anonymous_id__');
    this.storage.removeItem('__imtbl_attribution_user_id__');
    this.storage.removeItem('__imtbl_attribution_user_email__');
    clearEventQueue(this.storage);
  }
}

// Export types
export type { AttributionData, EventData, StorageAdapter, DeepLinkData };

// Export convenience functions and classes for advanced usage
export {
  getStorageAdapter,
  MemoryStorageAdapter,
  parseAttributionFromUrl,
  mergeAttributionData,
  getAnonymousId,
  resetAnonymousId,
  setUserId,
  getUserId,
  setUserEmail,
  getUserEmail,
  setOptOut,
  isOptedOut,
  queueEvent,
  getQueuedEvents,
  clearEventQueue,
  extractDeepLinkData,
};

