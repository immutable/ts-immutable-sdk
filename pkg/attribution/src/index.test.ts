import { Attribution } from './index';
import { MemoryStorageAdapter } from './storage';

describe('Attribution', () => {
  let storage: MemoryStorageAdapter;
  let attribution: Attribution;

  beforeEach(() => {
    storage = new MemoryStorageAdapter();
    attribution = new Attribution({
      apiEndpoint: 'https://api.example.com/events',
      storage,
      parseOnInit: false,
      trackPageViews: false,
    });
  });

  describe('getAnonymousId', () => {
    it('should generate and return anonymous ID', () => {
      const id = attribution.getAnonymousId();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should return same ID on subsequent calls', () => {
      const id1 = attribution.getAnonymousId();
      const id2 = attribution.getAnonymousId();
      expect(id1).toBe(id2);
    });

    it('should generate new ID after reset', () => {
      const id1 = attribution.getAnonymousId();
      const id2 = attribution.resetAnonymousId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('setUserId / getUserId', () => {
    it('should set and get user ID', () => {
      attribution.setUserId('user123');
      expect(attribution.getUserId()).toBe('user123');
    });

    it('should clear user ID when set to null', () => {
      attribution.setUserId('user123');
      attribution.setUserId(null);
      expect(attribution.getUserId()).toBeNull();
    });
  });

  describe('setUserEmail / getUserEmail', () => {
    it('should set and get user email', () => {
      attribution.setUserEmail('user@example.com');
      expect(attribution.getUserEmail()).toBe('user@example.com');
    });

    it('should clear user email when set to null', () => {
      attribution.setUserEmail('user@example.com');
      attribution.setUserEmail(null);
      expect(attribution.getUserEmail()).toBeNull();
    });
  });

  describe('logEvent', () => {
    it('should queue events', () => {
      attribution.logEvent('test_event');
      const events = attribution.getQueuedEvents();
      expect(events.length).toBe(1);
      expect(events[0].eventName).toBe('test_event');
    });

    it('should queue events with parameters', () => {
      attribution.logEvent('purchase', { revenue: 99.99, currency: 'USD' });
      const events = attribution.getQueuedEvents();
      expect(events.length).toBe(1);
      expect(events[0].eventParams).toEqual({ revenue: 99.99, currency: 'USD' });
    });
  });

  describe('parseAttribution', () => {
    it('should parse UTM parameters', () => {
      const url = 'https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=test';
      const data = attribution.parseAttribution(url);
      expect(data.source).toBe('google');
      expect(data.medium).toBe('cpc');
      expect(data.campaign).toBe('test');
    });

    it('should parse AppsFlyer parameters', () => {
      const url = 'https://example.com/?af_source=facebook&af_medium=social&af_campaign=summer';
      const data = attribution.parseAttribution(url);
      expect(data.source).toBe('facebook');
      expect(data.medium).toBe('social');
      expect(data.campaign).toBe('summer');
    });

    it('should parse Adjust parameters', () => {
      const url = 'https://example.com/?adjust_source=twitter&adjust_campaign=winter';
      const data = attribution.parseAttribution(url);
      expect(data.source).toBe('twitter');
      expect(data.campaign).toBe('winter');
    });

    it('should merge with existing attribution data', () => {
      attribution.parseAttribution('https://example.com/?utm_source=google');
      const firstData = attribution.getAttributionData();
      expect(firstData?.source).toBe('google');

      attribution.parseAttribution('https://example.com/?utm_medium=cpc');
      const mergedData = attribution.getAttributionData();
      expect(mergedData?.source).toBe('google');
      expect(mergedData?.medium).toBe('cpc');
    });
  });

  describe('clear', () => {
    it('should clear all stored data', () => {
      attribution.setUserId('user123');
      attribution.setUserEmail('user@example.com');
      attribution.logEvent('test');
      attribution.parseAttribution('https://example.com/?utm_source=google');

      attribution.clear();

      expect(attribution.getUserId()).toBeNull();
      expect(attribution.getUserEmail()).toBeNull();
      expect(attribution.getQueuedEvents().length).toBe(0);
      expect(attribution.getAttributionData()).toBeNull();
    });
  });
});

