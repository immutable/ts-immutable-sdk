import { detectCmp, startCmpDetection } from './cmp';

// Helper: set up a fake dataLayer with a GCM consent command
function setupGcm(
  analytics: 'granted' | 'denied' = 'granted',
  ad: 'granted' | 'denied' = 'denied',
  command: 'default' | 'update' = 'default',
): unknown[] {
  const dataLayer: unknown[] = [
    ['consent', command, { analytics_storage: analytics, ad_storage: ad }],
  ];
  (window as unknown as Record<string, unknown>).dataLayer = dataLayer;
  return dataLayer;
}

// Helper: set up a fake __tcfapi
function setupTcf(
  purposes: Record<number, boolean> = {},
  gdprApplies = true,
): { fire: (purposes: Record<number, boolean>) => void } {
  const listeners: Array<{ id: number; cb: (data: unknown, success: boolean) => void }> = [];
  let nextId = 1;

  const tcfapi = (
    command: string,
    _version: number,
    callback: (data: unknown, success: boolean) => void,
    listenerId?: number,
  ) => {
    if (command === 'addEventListener') {
      const id = nextId++;
      listeners.push({ id, cb: callback });
      // Fire immediately with current state (simulates CMP already loaded)
      callback(
        {
          gdprApplies, purpose: { consents: purposes }, listenerId: id, eventStatus: 'tcloaded',
        },
        true,
      );
    }
    if (command === 'removeEventListener' && listenerId !== undefined) {
      const idx = listeners.findIndex((l) => l.id === listenerId);
      if (idx >= 0) listeners.splice(idx, 1);
    }
  };

  // eslint-disable-next-line no-underscore-dangle
  (window as unknown as Record<string, unknown>).__tcfapi = tcfapi;

  return {
    fire(newPurposes: Record<number, boolean>) {
      for (const l of listeners) {
        l.cb(
          {
            gdprApplies, purpose: { consents: newPurposes }, listenerId: l.id, eventStatus: 'useractioncomplete',
          },
          true,
        );
      }
    },
  };
}

function cleanup(): void {
  delete (window as unknown as Record<string, unknown>).dataLayer;
  // eslint-disable-next-line no-underscore-dangle
  delete (window as unknown as Record<string, unknown>).__tcfapi;
}

afterEach(cleanup);

describe('CMP detection', () => {
  describe('Google Consent Mode v2', () => {
    it('detects GCM and returns correct source', () => {
      setupGcm('granted', 'denied');
      const onUpdate = jest.fn();
      const detector = detectCmp(onUpdate);

      expect(detector).not.toBeNull();
      expect(detector!.source).toBe('gcm');
    });

    it('maps analytics_storage denied to none', () => {
      setupGcm('denied', 'denied');
      const detector = detectCmp(jest.fn());

      expect(detector!.level).toBe('none');
    });

    it('maps analytics granted + ad denied to anonymous', () => {
      setupGcm('granted', 'denied');
      const detector = detectCmp(jest.fn());

      expect(detector!.level).toBe('anonymous');
    });

    it('maps analytics granted + ad granted to full', () => {
      setupGcm('granted', 'granted');
      const detector = detectCmp(jest.fn());

      expect(detector!.level).toBe('full');
    });

    it('reads the most recent consent command from dataLayer', () => {
      const dataLayer: unknown[] = [
        ['consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied' }],
        ['consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted' }],
      ];
      (window as unknown as Record<string, unknown>).dataLayer = dataLayer;

      const detector = detectCmp(jest.fn());
      expect(detector!.level).toBe('full');
    });

    it('ignores non-consent dataLayer entries', () => {
      const dataLayer: unknown[] = [
        ['event', 'page_view', {}],
        { event: 'gtm.js' },
        ['consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied' }],
      ];
      (window as unknown as Record<string, unknown>).dataLayer = dataLayer;

      const detector = detectCmp(jest.fn());
      expect(detector!.level).toBe('anonymous');
    });

    it('returns null when dataLayer has no consent commands', () => {
      (window as unknown as Record<string, unknown>).dataLayer = [
        ['event', 'page_view'],
      ];

      const detector = detectCmp(jest.fn());
      expect(detector).toBeNull();
    });

    it('returns null when dataLayer does not exist', () => {
      const detector = detectCmp(jest.fn());
      expect(detector).toBeNull();
    });

    it('intercepts dataLayer.push for consent updates', () => {
      const dataLayer = setupGcm('granted', 'denied');
      const onUpdate = jest.fn();
      detectCmp(onUpdate);

      // Simulate a consent update via dataLayer.push
      dataLayer.push(['consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted' }]);

      expect(onUpdate).toHaveBeenCalledWith('full', 'gcm');
    });

    it('does not fire callback for non-consent dataLayer pushes', () => {
      const dataLayer = setupGcm('granted', 'denied');
      const onUpdate = jest.fn();
      detectCmp(onUpdate);

      dataLayer.push(['event', 'page_view']);
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('stops intercepting after destroy', () => {
      const dataLayer = setupGcm('granted', 'denied');
      const onUpdate = jest.fn();
      const detector = detectCmp(onUpdate);
      detector!.destroy();

      dataLayer.push(['consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted' }]);
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('restores original push on destroy', () => {
      const dataLayer = setupGcm('granted', 'denied');
      const originalPush = dataLayer.push;
      detectCmp(jest.fn());

      // push was replaced
      expect(dataLayer.push).not.toBe(originalPush);

      // After destroy, original push should be restored
      const detector = detectCmp(jest.fn());
      detector!.destroy();
    });
  });

  describe('IAB TCF v2', () => {
    it('detects TCF and returns correct source', () => {
      setupTcf({ 1: true });
      const detector = detectCmp(jest.fn());

      expect(detector).not.toBeNull();
      expect(detector!.source).toBe('tcf');
    });

    it('maps no purposes to none', () => {
      setupTcf({});
      const detector = detectCmp(jest.fn());

      expect(detector!.level).toBe('none');
    });

    it('maps purpose 1 only to anonymous', () => {
      setupTcf({
        1: true, 3: false, 4: false, 5: false,
      });
      const detector = detectCmp(jest.fn());

      expect(detector!.level).toBe('anonymous');
    });

    it('maps purpose 1 + purpose 3 to full', () => {
      setupTcf({ 1: true, 3: true });
      const detector = detectCmp(jest.fn());

      expect(detector!.level).toBe('full');
    });

    it('maps purpose 1 + purpose 4 to full', () => {
      setupTcf({ 1: true, 4: true });
      const detector = detectCmp(jest.fn());

      expect(detector!.level).toBe('full');
    });

    it('maps purpose 1 + purpose 5 to full', () => {
      setupTcf({ 1: true, 5: true });
      const detector = detectCmp(jest.fn());

      expect(detector!.level).toBe('full');
    });

    it('maps no purpose 1 to none even with other purposes', () => {
      setupTcf({ 1: false, 3: true, 4: true });
      const detector = detectCmp(jest.fn());

      expect(detector!.level).toBe('none');
    });

    it('reacts to TCF consent changes', () => {
      const tcf = setupTcf({ 1: true });
      const onUpdate = jest.fn();
      detectCmp(onUpdate);

      // Simulate user changing consent
      tcf.fire({ 1: true, 3: true, 4: true });

      expect(onUpdate).toHaveBeenCalledWith('full', 'tcf');
    });

    it('reacts to TCF consent downgrade', () => {
      const tcf = setupTcf({ 1: true, 3: true });
      const onUpdate = jest.fn();
      detectCmp(onUpdate);

      tcf.fire({ 1: true, 3: false });
      expect(onUpdate).toHaveBeenCalledWith('anonymous', 'tcf');
    });

    it('returns null when __tcfapi does not exist', () => {
      const detector = detectCmp(jest.fn());
      expect(detector).toBeNull();
    });
  });

  describe('Detection priority', () => {
    it('prefers GCM over TCF when both are present', () => {
      setupGcm('granted', 'granted');
      setupTcf({ 1: true }); // would be 'anonymous'

      const detector = detectCmp(jest.fn());
      expect(detector!.source).toBe('gcm');
      expect(detector!.level).toBe('full');
    });

    it('falls back to TCF when GCM has no consent commands', () => {
      (window as unknown as Record<string, unknown>).dataLayer = [['event', 'page_view']];
      setupTcf({ 1: true, 3: true });

      const detector = detectCmp(jest.fn());
      expect(detector!.source).toBe('tcf');
      expect(detector!.level).toBe('full');
    });
  });

  describe('startCmpDetection (polling)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('detects CMP immediately when available', () => {
      setupGcm('granted', 'denied');
      const onUpdate = jest.fn();
      const onDetected = jest.fn();

      startCmpDetection(onUpdate, onDetected);

      expect(onDetected).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'gcm', level: 'anonymous' }),
      );
    });

    it('polls and detects CMP that loads asynchronously', () => {
      const onUpdate = jest.fn();
      const onDetected = jest.fn();

      startCmpDetection(onUpdate, onDetected);
      expect(onDetected).not.toHaveBeenCalled();

      // CMP loads after 1 poll interval
      setupGcm('granted', 'granted');
      jest.advanceTimersByTime(800);

      expect(onDetected).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'gcm', level: 'full' }),
      );
    });

    it('stops polling after max attempts', () => {
      const onUpdate = jest.fn();
      const onDetected = jest.fn();

      startCmpDetection(onUpdate, onDetected);

      // Advance past all 3 poll attempts (3 * 800ms = 2400ms)
      jest.advanceTimersByTime(3000);

      expect(onDetected).not.toHaveBeenCalled();

      // Even if CMP loads later, polling has stopped
      setupGcm('granted', 'granted');
      jest.advanceTimersByTime(1000);
      expect(onDetected).not.toHaveBeenCalled();
    });

    it('cleanup function stops polling', () => {
      const onUpdate = jest.fn();
      const onDetected = jest.fn();

      const teardown = startCmpDetection(onUpdate, onDetected);
      teardown();

      setupGcm('granted', 'granted');
      jest.advanceTimersByTime(1000);
      expect(onDetected).not.toHaveBeenCalled();
    });

    it('calls onTimeout when no CMP is found after all polls', () => {
      const onUpdate = jest.fn();
      const onDetected = jest.fn();
      const onTimeout = jest.fn();

      startCmpDetection(onUpdate, onDetected, onTimeout);

      // Advance past all 3 poll attempts
      jest.advanceTimersByTime(3000);

      expect(onDetected).not.toHaveBeenCalled();
      expect(onTimeout).toHaveBeenCalledTimes(1);
    });

    it('does not call onTimeout when CMP is detected', () => {
      const onUpdate = jest.fn();
      const onDetected = jest.fn();
      const onTimeout = jest.fn();

      startCmpDetection(onUpdate, onDetected, onTimeout);

      // CMP loads after 1 poll
      setupGcm('granted', 'denied');
      jest.advanceTimersByTime(800);

      expect(onDetected).toHaveBeenCalled();
      expect(onTimeout).not.toHaveBeenCalled();

      // Advance past remaining polls — onTimeout should still not fire
      jest.advanceTimersByTime(3000);
      expect(onTimeout).not.toHaveBeenCalled();
    });

    it('cleanup function destroys detected CMP listener', () => {
      const dataLayer = setupGcm('granted', 'denied');
      const onUpdate = jest.fn();
      const onDetected = jest.fn();

      const teardown = startCmpDetection(onUpdate, onDetected);
      teardown();

      // After teardown, consent updates should not fire
      dataLayer.push(['consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted' }]);
      expect(onUpdate).not.toHaveBeenCalled();
    });
  });
});
