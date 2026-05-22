import { TextEncoder as NodeTextEncoder } from 'util';
import { createHash } from 'crypto';
import type { ConsentLevel } from '@imtbl/audience-core';
import { setupAutocapture } from './autocapture';

// Polyfill TextEncoder for older jsdom
if (typeof globalThis.TextEncoder === 'undefined') {
  (globalThis as Record<string, unknown>).TextEncoder = NodeTextEncoder;
}

// Polyfill crypto.subtle.digest for jsdom
const originalCrypto = global.crypto;
beforeAll(() => {
  Object.defineProperty(global, 'crypto', {
    value: {
      ...originalCrypto,
      subtle: {
        async digest(_algo: string, data: Uint8Array) {
          const hash = createHash('sha256').update(data).digest();
          return hash.buffer;
        },
      },
    },
    configurable: true,
  });
});

afterAll(() => {
  Object.defineProperty(global, 'crypto', {
    value: originalCrypto,
    configurable: true,
  });
});

describe('autocapture', () => {
  let enqueue: jest.Mock;
  let consent: ConsentLevel;
  let teardown: () => void;

  beforeEach(() => {
    enqueue = jest.fn();
    consent = 'anonymous';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    teardown?.();
  });

  function setup(options: Record<string, unknown> = {}) {
    const result = setupAutocapture(
      {
        forms: true, clicks: true, scroll: false, ...options,
      },
      enqueue,
      () => consent,
    );
    teardown = result.teardown;
  }

  // ---------- Form submissions ----------

  describe('form submissions', () => {
    it('fires form_submitted at anonymous consent (no email hash)', () => {
      setup();
      const form = document.createElement('form');
      form.action = '/signup';
      form.id = 'signup-form';
      form.setAttribute('name', 'newsletter');

      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.name = 'email';
      emailInput.value = 'test@example.com';
      form.appendChild(emailInput);
      document.body.appendChild(form);

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      expect(enqueue).toHaveBeenCalledWith(
        'form_submitted',
        expect.objectContaining({
          form_action: expect.stringContaining('/signup'),
          form_id: 'signup-form',
          form_name: 'newsletter',
          field_names: ['email'],
        }),
      );

      // At anonymous consent, no email_hash
      const props = enqueue.mock.calls[0][1];
      expect(props.email_hash).toBeUndefined();
    });

    it('fires form_submitted with email hash at full consent', async () => {
      consent = 'full';
      setup();

      const form = document.createElement('form');
      form.action = '/register';

      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.name = 'email';
      emailInput.value = 'Player@Example.com';
      form.appendChild(emailInput);
      document.body.appendChild(form);

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      // Hash is async, wait for microtask
      await new Promise((r) => { setTimeout(r, 0); });

      expect(enqueue).toHaveBeenCalledWith(
        'form_submitted',
        expect.objectContaining({
          form_action: expect.stringContaining('/register'),
          email_hash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        }),
      );
    });

    it('normalises email before hashing (lowercase + trim)', async () => {
      consent = 'full';
      setup();

      const form = document.createElement('form');
      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.name = 'email';
      emailInput.value = '  Test@Example.COM  ';
      form.appendChild(emailInput);
      document.body.appendChild(form);

      form.dispatchEvent(new Event('submit', { bubbles: true }));
      await new Promise((r) => { setTimeout(r, 0); });

      // Verify the hash corresponds to the normalised value
      const expected = createHash('sha256')
        .update(new TextEncoder().encode('test@example.com'))
        .digest('hex');

      expect(enqueue.mock.calls[0][1].email_hash).toBe(`sha256:${expected}`);
    });

    it('detects email inputs by name containing "email"', () => {
      setup();
      const form = document.createElement('form');

      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'user_email_address';
      input.value = 'test@example.com';
      form.appendChild(input);
      document.body.appendChild(form);

      consent = 'full';
      form.dispatchEvent(new Event('submit', { bubbles: true }));

      // Should have attempted to hash (enqueue called async)
      // At anonymous it would enqueue synchronously with no hash
      consent = 'anonymous';
      enqueue.mockClear();
      form.dispatchEvent(new Event('submit', { bubbles: true }));

      expect(enqueue).toHaveBeenCalledWith(
        'form_submitted',
        expect.objectContaining({
          field_names: ['user_email_address'],
        }),
      );
    });

    it('does not fire at consent none', () => {
      consent = 'none';
      setup();

      const form = document.createElement('form');
      form.action = '/signup';
      document.body.appendChild(form);

      form.dispatchEvent(new Event('submit', { bubbles: true }));
      expect(enqueue).not.toHaveBeenCalled();
    });

    it('captures fieldNames from all named form elements', () => {
      setup();
      const form = document.createElement('form');

      const nameInput = document.createElement('input');
      nameInput.name = 'first_name';
      form.appendChild(nameInput);

      const emailInput = document.createElement('input');
      emailInput.name = 'email';
      form.appendChild(emailInput);

      const selectEl = document.createElement('select');
      selectEl.name = 'country';
      form.appendChild(selectEl);

      document.body.appendChild(form);
      form.dispatchEvent(new Event('submit', { bubbles: true }));

      expect(enqueue.mock.calls[0][1].field_names).toEqual([
        'first_name',
        'email',
        'country',
      ]);
    });

    it('does not capture when forms option is false', () => {
      setup({ forms: false });

      const form = document.createElement('form');
      form.action = '/signup';
      document.body.appendChild(form);

      form.dispatchEvent(new Event('submit', { bubbles: true }));
      expect(enqueue).not.toHaveBeenCalled();
    });

    it('fires for forms without email inputs (no hash attempt)', () => {
      consent = 'full';
      setup();

      const form = document.createElement('form');
      form.action = '/search';
      const input = document.createElement('input');
      input.name = 'query';
      input.value = 'game name';
      form.appendChild(input);
      document.body.appendChild(form);

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      expect(enqueue).toHaveBeenCalledWith(
        'form_submitted',
        expect.objectContaining({
          form_action: expect.stringContaining('/search'),
          field_names: ['query'],
        }),
      );
      expect(enqueue.mock.calls[0][1].email_hash).toBeUndefined();
    });

    it('enqueues without emailHash when crypto.subtle is unavailable', async () => {
      consent = 'full';

      // Temporarily break crypto.subtle
      const saved = global.crypto;
      Object.defineProperty(global, 'crypto', {
        value: { subtle: undefined },
        configurable: true,
      });

      setup();

      const form = document.createElement('form');
      form.action = '/signup';
      const input = document.createElement('input');
      input.type = 'email';
      input.name = 'email';
      input.value = 'test@example.com';
      form.appendChild(input);
      document.body.appendChild(form);

      form.dispatchEvent(new Event('submit', { bubbles: true }));
      await new Promise((r) => { setTimeout(r, 0); });

      // Event should still be enqueued, just without emailHash
      expect(enqueue).toHaveBeenCalledWith(
        'form_submitted',
        expect.objectContaining({ form_action: expect.stringContaining('/signup') }),
      );
      expect(enqueue.mock.calls[0][1].email_hash).toBeUndefined();

      // Restore crypto
      Object.defineProperty(global, 'crypto', { value: saved, configurable: true });
    });

    it('ignores email inputs without @ sign', () => {
      consent = 'full';
      setup();

      const form = document.createElement('form');
      const input = document.createElement('input');
      input.type = 'email';
      input.name = 'email';
      input.value = 'not-an-email';
      form.appendChild(input);
      document.body.appendChild(form);

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      // Should fire synchronously (no hash), no email_hash
      expect(enqueue).toHaveBeenCalledTimes(1);
      expect(enqueue.mock.calls[0][1].email_hash).toBeUndefined();
    });
  });

  // ---------- Outbound link clicks ----------

  describe('outbound link clicks', () => {
    it('fires link_clicked for outbound links', () => {
      setup();

      const link = document.createElement('a');
      link.href = 'https://store.steampowered.com/app/12345';
      link.textContent = 'Wishlist on Steam';
      link.id = 'steam-link';
      document.body.appendChild(link);

      link.dispatchEvent(new Event('click', { bubbles: true }));

      expect(enqueue).toHaveBeenCalledWith(
        'link_clicked',
        {
          link_url: 'https://store.steampowered.com/app/12345',
          link_text: 'Wishlist on Steam',
          element_id: 'steam-link',
          outbound: true,
        },
      );
    });

    it('does not fire for internal links', () => {
      setup();

      const link = document.createElement('a');
      link.href = `${window.location.origin}/about`;
      link.textContent = 'About';
      document.body.appendChild(link);

      link.dispatchEvent(new Event('click', { bubbles: true }));
      expect(enqueue).not.toHaveBeenCalled();
    });

    it('does not fire at consent none', () => {
      consent = 'none';
      setup();

      const link = document.createElement('a');
      link.href = 'https://discord.gg/invite';
      link.textContent = 'Join Discord';
      document.body.appendChild(link);

      link.dispatchEvent(new Event('click', { bubbles: true }));
      expect(enqueue).not.toHaveBeenCalled();
    });

    it('fires at anonymous consent', () => {
      consent = 'anonymous';
      setup();

      const link = document.createElement('a');
      link.href = 'https://discord.gg/invite';
      link.textContent = 'Join Discord';
      document.body.appendChild(link);

      link.dispatchEvent(new Event('click', { bubbles: true }));
      expect(enqueue).toHaveBeenCalledWith(
        'link_clicked',
        expect.objectContaining({
          link_url: 'https://discord.gg/invite',
          outbound: true,
        }),
      );
    });

    it('fires at full consent', () => {
      consent = 'full';
      setup();

      const link = document.createElement('a');
      link.href = 'https://discord.gg/invite';
      link.textContent = 'Join Discord';
      document.body.appendChild(link);

      link.dispatchEvent(new Event('click', { bubbles: true }));
      expect(enqueue).toHaveBeenCalledTimes(1);
    });

    it('truncates link text to 256 characters', () => {
      setup();

      const link = document.createElement('a');
      link.href = 'https://example.com/external';
      link.textContent = 'A'.repeat(300);
      document.body.appendChild(link);

      link.dispatchEvent(new Event('click', { bubbles: true }));

      const props = enqueue.mock.calls[0][1];
      expect(props.link_text).toHaveLength(256);
    });

    it('resolves clicks on child elements to nearest anchor', () => {
      setup();

      const link = document.createElement('a');
      link.href = 'https://store.steampowered.com/app/12345';
      link.textContent = '';

      const span = document.createElement('span');
      span.textContent = 'Click me';
      link.appendChild(span);
      document.body.appendChild(link);

      span.dispatchEvent(new Event('click', { bubbles: true }));

      expect(enqueue).toHaveBeenCalledWith(
        'link_clicked',
        expect.objectContaining({
          link_url: 'https://store.steampowered.com/app/12345',
          link_text: 'Click me',
          outbound: true,
        }),
      );
    });

    it('does not fire when clicks option is false', () => {
      setup({ clicks: false });

      const link = document.createElement('a');
      link.href = 'https://store.steampowered.com/app/12345';
      link.textContent = 'Steam';
      document.body.appendChild(link);

      link.dispatchEvent(new Event('click', { bubbles: true }));
      expect(enqueue).not.toHaveBeenCalled();
    });

    it('omits elementId when anchor has no id', () => {
      setup();

      const link = document.createElement('a');
      link.href = 'https://discord.gg/invite';
      link.textContent = 'Discord';
      document.body.appendChild(link);

      link.dispatchEvent(new Event('click', { bubbles: true }));

      expect(enqueue.mock.calls[0][1].element_id).toBeUndefined();
    });

    it('ignores clicks on non-link elements', () => {
      setup();

      const button = document.createElement('button');
      button.textContent = 'Click me';
      document.body.appendChild(button);

      button.dispatchEvent(new Event('click', { bubbles: true }));
      expect(enqueue).not.toHaveBeenCalled();
    });

    it('ignores anchors without href', () => {
      setup();

      const link = document.createElement('a');
      link.textContent = 'No href';
      document.body.appendChild(link);

      link.dispatchEvent(new Event('click', { bubbles: true }));
      expect(enqueue).not.toHaveBeenCalled();
    });
  });

  // ---------- Teardown ----------

  describe('teardown', () => {
    it('removes all listeners when teardown is called', () => {
      setup();

      const form = document.createElement('form');
      form.action = '/signup';
      document.body.appendChild(form);

      const link = document.createElement('a');
      link.href = 'https://discord.gg/invite';
      link.textContent = 'Discord';
      document.body.appendChild(link);

      teardown();

      form.dispatchEvent(new Event('submit', { bubbles: true }));
      link.dispatchEvent(new Event('click', { bubbles: true }));

      expect(enqueue).not.toHaveBeenCalled();
    });
  });

  // ---------- Config defaults ----------

  describe('config defaults', () => {
    it('enables both listeners when no options specified', () => {
      teardown = setupAutocapture({}, enqueue, () => consent).teardown;

      const form = document.createElement('form');
      form.action = '/signup';
      document.body.appendChild(form);
      form.dispatchEvent(new Event('submit', { bubbles: true }));

      const link = document.createElement('a');
      link.href = 'https://external.com';
      link.textContent = 'External';
      document.body.appendChild(link);
      link.dispatchEvent(new Event('click', { bubbles: true }));

      expect(enqueue).toHaveBeenCalledTimes(2);
    });

    it('can disable forms but keep clicks', () => {
      setup({ forms: false, clicks: true });

      const form = document.createElement('form');
      document.body.appendChild(form);
      form.dispatchEvent(new Event('submit', { bubbles: true }));

      const link = document.createElement('a');
      link.href = 'https://external.com';
      link.textContent = 'Ext';
      document.body.appendChild(link);
      link.dispatchEvent(new Event('click', { bubbles: true }));

      expect(enqueue).toHaveBeenCalledTimes(1);
      expect(enqueue.mock.calls[0][0]).toBe('link_clicked');
    });

    it('can disable clicks but keep forms', () => {
      setup({ forms: true, clicks: false });

      const link = document.createElement('a');
      link.href = 'https://external.com';
      link.textContent = 'Ext';
      document.body.appendChild(link);
      link.dispatchEvent(new Event('click', { bubbles: true }));

      const form = document.createElement('form');
      document.body.appendChild(form);
      form.dispatchEvent(new Event('submit', { bubbles: true }));

      expect(enqueue).toHaveBeenCalledTimes(1);
      expect(enqueue.mock.calls[0][0]).toBe('form_submitted');
    });
  });

  // ---------- Scroll depth tracking ----------

  describe('scroll depth tracking', () => {
    let rafCallbacks: Array<() => void>;
    let originalRAF: typeof requestAnimationFrame;
    let originalCAF: typeof cancelAnimationFrame;

    beforeEach(() => {
      rafCallbacks = [];
      originalRAF = window.requestAnimationFrame;
      originalCAF = window.cancelAnimationFrame;

      // Mock rAF: collect callbacks, flush manually
      let nextId = 1;
      window.requestAnimationFrame = jest.fn((cb: FrameRequestCallback) => {
        const id = nextId++;
        rafCallbacks.push(() => cb(0));
        return id;
      });
      window.cancelAnimationFrame = jest.fn();
    });

    afterEach(() => {
      window.requestAnimationFrame = originalRAF;
      window.cancelAnimationFrame = originalCAF;
    });

    function flushRAF() {
      const cbs = [...rafCallbacks];
      rafCallbacks = [];
      cbs.forEach((cb) => cb());
    }

    /**
     * Configure jsdom's document dimensions and scroll position.
     * jsdom doesn't support layout, so we stub the relevant properties.
     */
    function setScrollGeometry(
      scrollHeight: number,
      clientHeight: number,
      scrollY: number,
    ) {
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: scrollHeight, configurable: true,
      });
      Object.defineProperty(document.documentElement, 'clientHeight', {
        value: clientHeight, configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: clientHeight, configurable: true,
      });
      Object.defineProperty(window, 'scrollY', {
        value: scrollY, configurable: true, writable: true,
      });
    }

    describe('scrollable pages', () => {
      beforeEach(() => {
        // 2000px tall page in a 500px viewport → scrollable
        setScrollGeometry(2000, 500, 0);
      });

      it('fires scroll_depth at each milestone exactly once', () => {
        setup({ scroll: true });

        // Scroll to 25% → scrollY = (2000-500) * 0.25 = 375
        (window as Record<string, unknown>).scrollY = 375;
        document.dispatchEvent(new Event('scroll'));
        flushRAF();

        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 25 });
        expect(enqueue).toHaveBeenCalledTimes(1);

        // Scroll to 55% → should fire 50 (25 already fired)
        (window as Record<string, unknown>).scrollY = 825;
        document.dispatchEvent(new Event('scroll'));
        flushRAF();

        expect(enqueue).toHaveBeenCalledTimes(2);
        expect(enqueue).toHaveBeenLastCalledWith('scroll_depth', { depth: 50 });
      });

      it('fires multiple milestones in a single scroll if jumped past', () => {
        setup({ scroll: true });

        // Jump straight to 80% → should fire 25, 50, 75
        (window as Record<string, unknown>).scrollY = 1200;
        document.dispatchEvent(new Event('scroll'));
        flushRAF();

        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 25 });
        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 50 });
        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 75 });
        expect(enqueue).toHaveBeenCalledTimes(3);
      });

      it('does not re-fire milestones already reached', () => {
        setup({ scroll: true });

        // Scroll to 60%
        (window as Record<string, unknown>).scrollY = 900;
        document.dispatchEvent(new Event('scroll'));
        flushRAF();

        const countAfterFirst = enqueue.mock.calls.length;

        // Scroll back up to 30%, then to 60% again
        (window as Record<string, unknown>).scrollY = 450;
        document.dispatchEvent(new Event('scroll'));
        flushRAF();

        (window as Record<string, unknown>).scrollY = 900;
        document.dispatchEvent(new Event('scroll'));
        flushRAF();

        // No new milestones should have fired
        expect(enqueue).toHaveBeenCalledTimes(countAfterFirst);
      });

      it('fires 90 and 100 milestones', () => {
        setup({ scroll: true });

        // Scroll to 100%
        (window as Record<string, unknown>).scrollY = 1500;
        document.dispatchEvent(new Event('scroll'));
        flushRAF();

        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 25 });
        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 50 });
        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 75 });
        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 90 });
        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 100 });
        expect(enqueue).toHaveBeenCalledTimes(5);
      });

      it('does not fire at consent none', () => {
        consent = 'none';
        setup({ scroll: true });

        (window as Record<string, unknown>).scrollY = 1500;
        document.dispatchEvent(new Event('scroll'));
        flushRAF();

        expect(enqueue).not.toHaveBeenCalled();
      });

      it('throttles via requestAnimationFrame', () => {
        setup({ scroll: true });

        // Fire multiple scroll events without flushing rAF
        (window as Record<string, unknown>).scrollY = 375;
        document.dispatchEvent(new Event('scroll'));
        document.dispatchEvent(new Event('scroll'));
        document.dispatchEvent(new Event('scroll'));

        // Only one rAF should have been scheduled
        expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);

        flushRAF();

        expect(enqueue).toHaveBeenCalledTimes(1);
      });

      it('checks initial scroll position on setup', () => {
        // Page already scrolled to 30% before setup
        (window as Record<string, unknown>).scrollY = 450;
        setup({ scroll: true });

        // Should fire 25% immediately (no scroll event needed)
        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 25 });
      });
    });

    describe('non-scrollable pages', () => {
      beforeEach(() => {
        // 400px content in a 600px viewport → document does not scroll.
        // Same shape applies to SPAs / pages with internal scroll containers
        // where document.documentElement.scrollHeight equals window.innerHeight.
        setScrollGeometry(400, 600, 0);
      });

      it('does not fire any milestones on setup', () => {
        setup({ scroll: true });
        expect(enqueue).not.toHaveBeenCalled();
      });

      it('does not fire any milestones on subsequent scroll events', () => {
        setup({ scroll: true });

        // Even if a scroll event fires (e.g. iOS overscroll bounce), there is
        // nothing to scroll past, so no milestone should fire.
        document.dispatchEvent(new Event('scroll'));
        flushRAF();

        expect(enqueue).not.toHaveBeenCalled();
      });
    });

    describe('configuration', () => {
      beforeEach(() => {
        setScrollGeometry(2000, 500, 0);
      });

      it('does not track scroll when scroll option is false', () => {
        setup({ scroll: false });

        (window as Record<string, unknown>).scrollY = 1500;
        document.dispatchEvent(new Event('scroll'));
        flushRAF();

        expect(enqueue).not.toHaveBeenCalled();
      });

      it('enables scroll tracking by default', () => {
        // Call setupAutocapture directly to verify production defaults
        teardown = setupAutocapture({}, enqueue, () => consent).teardown;

        (window as Record<string, unknown>).scrollY = 375;
        document.dispatchEvent(new Event('scroll'));
        flushRAF();

        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 25 });
      });
    });

    describe('teardown', () => {
      beforeEach(() => {
        setScrollGeometry(2000, 500, 0);
      });

      it('removes scroll listener on teardown', () => {
        setup({ scroll: true });
        teardown();

        (window as Record<string, unknown>).scrollY = 1500;
        document.dispatchEvent(new Event('scroll'));
        flushRAF();

        expect(enqueue).not.toHaveBeenCalled();
      });
    });

    describe('SPA internal scroll containers', () => {
      /**
       * Stub an internal element's scroll geometry. The element must be
       * appended to document.body so the capture-phase listener on `document`
       * receives events dispatched on it.
       */
      function setContainerGeometry(
        el: HTMLElement,
        scrollHeight: number,
        clientHeight: number,
        scrollTop: number,
      ) {
        Object.defineProperty(el, 'scrollHeight', { value: scrollHeight, configurable: true });
        Object.defineProperty(el, 'clientHeight', { value: clientHeight, configurable: true });
        Object.defineProperty(el, 'scrollTop', { value: scrollTop, configurable: true, writable: true });
      }

      beforeEach(() => {
        // Document itself does not scroll (SPA pattern).
        setScrollGeometry(600, 600, 0);
      });

      it('fires milestones when an internal container scrolls', () => {
        setup({ scroll: true });

        const container = document.createElement('div');
        // 500px container in a 600px viewport → clientHeight/innerHeight = 83% → passes filter
        setContainerGeometry(container, 2000, 500, 0);
        document.body.appendChild(container);

        // Scroll to 26% → scrollTop = (2000-500)*0.26 = 390
        (container as Record<string, unknown>).scrollTop = 390;
        container.dispatchEvent(new Event('scroll'));
        flushRAF();

        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 25 });
        expect(enqueue).toHaveBeenCalledTimes(1);
      });

      it('fires all five milestones when container is scrolled to 100%', () => {
        setup({ scroll: true });

        const container = document.createElement('div');
        setContainerGeometry(container, 2000, 500, 0);
        document.body.appendChild(container);

        // 100% → scrollTop = 2000-500 = 1500
        (container as Record<string, unknown>).scrollTop = 1500;
        container.dispatchEvent(new Event('scroll'));
        flushRAF();

        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 25 });
        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 50 });
        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 75 });
        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 90 });
        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 100 });
        expect(enqueue).toHaveBeenCalledTimes(5);
      });

      it('ignores containers smaller than 50% of viewport height', () => {
        setup({ scroll: true });

        const small = document.createElement('div');
        // clientHeight = 200 px, innerHeight = 600 → 200 ≤ 300 → filtered out
        setContainerGeometry(small, 2000, 200, 0);
        document.body.appendChild(small);

        (small as Record<string, unknown>).scrollTop = 1500;
        small.dispatchEvent(new Event('scroll'));
        flushRAF();

        expect(enqueue).not.toHaveBeenCalled();
      });

      it('fires each milestone only once across multiple large containers (global dedup)', () => {
        setup({ scroll: true });

        const main = document.createElement('div');
        const sidebar = document.createElement('div');
        setContainerGeometry(main, 2000, 500, 0);
        setContainerGeometry(sidebar, 1000, 500, 0);
        document.body.appendChild(main);
        document.body.appendChild(sidebar);

        // Scroll main to 30% → fires 25
        (main as Record<string, unknown>).scrollTop = 450;
        main.dispatchEvent(new Event('scroll'));
        flushRAF();
        expect(enqueue).toHaveBeenCalledTimes(1);
        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 25 });

        // Scroll sidebar to 60% → 25 already fired, should only fire 50
        (sidebar as Record<string, unknown>).scrollTop = 300;
        sidebar.dispatchEvent(new Event('scroll'));
        flushRAF();
        expect(enqueue).toHaveBeenCalledTimes(2);
        expect(enqueue).toHaveBeenLastCalledWith('scroll_depth', { depth: 50 });
      });

      it('does not fire for a detached element not in the document', () => {
        setup({ scroll: true });

        const detached = document.createElement('div');
        setContainerGeometry(detached, 2000, 500, 0);
        // Not appended to body — capture phase won't reach document.
        (detached as Record<string, unknown>).scrollTop = 1500;
        detached.dispatchEvent(new Event('scroll'));
        flushRAF();

        expect(enqueue).not.toHaveBeenCalled();
      });
    });

    describe('reset', () => {
      beforeEach(() => {
        setScrollGeometry(2000, 500, 0);
      });

      it('allows milestones to re-fire after resetScroll() (SPA route change)', () => {
        const result = setupAutocapture({ scroll: true }, enqueue, () => consent);
        teardown = result.teardown;

        // Fire 25 milestone.
        (window as Record<string, unknown>).scrollY = 375;
        document.dispatchEvent(new Event('scroll'));
        flushRAF();
        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 25 });
        expect(enqueue).toHaveBeenCalledTimes(1);

        // Simulate SPA route change: scroll back to top, then call resetScroll.
        (window as Record<string, unknown>).scrollY = 0;
        result.resetScroll();

        // Scrolling to 25% again should re-fire the milestone.
        (window as Record<string, unknown>).scrollY = 375;
        document.dispatchEvent(new Event('scroll'));
        flushRAF();
        expect(enqueue).toHaveBeenCalledTimes(2);
        expect(enqueue).toHaveBeenLastCalledWith('scroll_depth', { depth: 25 });
      });

      it('cancels pending rAF so stale scroll position cannot fire against new page', () => {
        const result = setupAutocapture({ scroll: true }, enqueue, () => consent);
        teardown = result.teardown;

        // User has scrolled to 50% — rAF is scheduled but has not yet fired.
        (window as Record<string, unknown>).scrollY = 750;
        document.dispatchEvent(new Event('scroll'));
        expect(enqueue).not.toHaveBeenCalled(); // rAF not flushed yet

        // SPA navigates: pixel.page() calls resetScroll() before the rAF fires.
        // The reused container still reports scrollY = 750 momentarily.
        result.resetScroll();

        // Flushing the (now-cancelled) rAF must not fire any milestone against
        // the new page view.
        flushRAF();
        expect(enqueue).not.toHaveBeenCalled();
      });
    });

    describe('concurrent containers', () => {
      function setContainerGeometry(
        el: HTMLElement,
        scrollHeight: number,
        clientHeight: number,
        scrollTop: number,
      ) {
        Object.defineProperty(el, 'scrollHeight', { value: scrollHeight, configurable: true });
        Object.defineProperty(el, 'clientHeight', { value: clientHeight, configurable: true });
        Object.defineProperty(el, 'scrollTop', { value: scrollTop, configurable: true, writable: true });
      }

      beforeEach(() => {
        setScrollGeometry(600, 600, 0);
      });

      it('processes every container that scrolled within a single rAF', () => {
        setup({ scroll: true });

        const main = document.createElement('div');
        const sidebar = document.createElement('div');
        setContainerGeometry(main, 2000, 500, 0);
        setContainerGeometry(sidebar, 1000, 500, 0);
        document.body.appendChild(main);
        document.body.appendChild(sidebar);

        // Two large containers scroll in the same frame (before rAF flush).
        // main → 30% (450/1500), sidebar → 60% (300/500).
        // Without per-container queueing, only the second target would be
        // checked and main's milestone would be lost.
        (main as Record<string, unknown>).scrollTop = 450;
        main.dispatchEvent(new Event('scroll'));
        (sidebar as Record<string, unknown>).scrollTop = 300;
        sidebar.dispatchEvent(new Event('scroll'));

        flushRAF();

        // Both 25 (from main) and 50 (from sidebar) should fire — global dedup
        // applies across all containers processed in the frame.
        expect(enqueue).toHaveBeenCalledTimes(2);
        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 25 });
        expect(enqueue).toHaveBeenCalledWith('scroll_depth', { depth: 50 });
      });
    });
  });

  // ---------- Email hashing ----------

  describe('email hashing', () => {
    it('produces consistent SHA-256 output', async () => {
      consent = 'full';
      setup();

      // Submit the same email twice
      for (let i = 0; i < 2; i++) {
        const form = document.createElement('form');
        const input = document.createElement('input');
        input.type = 'email';
        input.name = 'email';
        input.value = 'consistent@test.com';
        form.appendChild(input);
        document.body.appendChild(form);
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      }

      await new Promise((r) => { setTimeout(r, 0); });

      expect(enqueue).toHaveBeenCalledTimes(2);
      const hash1 = enqueue.mock.calls[0][1].email_hash;
      const hash2 = enqueue.mock.calls[1][1].email_hash;
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^sha256:[a-f0-9]{64}$/);
    });
  });
});
