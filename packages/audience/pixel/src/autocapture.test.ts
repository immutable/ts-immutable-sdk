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

  function setup(options = {}) {
    teardown = setupAutocapture(
      { forms: true, clicks: true, ...options },
      enqueue,
      () => consent,
    );
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
          formAction: expect.stringContaining('/signup'),
          formId: 'signup-form',
          formName: 'newsletter',
          fieldNames: ['email'],
        }),
      );

      // At anonymous consent, no emailHash
      const props = enqueue.mock.calls[0][1];
      expect(props.emailHash).toBeUndefined();
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
          formAction: expect.stringContaining('/register'),
          emailHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
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

      expect(enqueue.mock.calls[0][1].emailHash).toBe(`sha256:${expected}`);
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
          fieldNames: ['user_email_address'],
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

      expect(enqueue.mock.calls[0][1].fieldNames).toEqual([
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
          formAction: expect.stringContaining('/search'),
          fieldNames: ['query'],
        }),
      );
      expect(enqueue.mock.calls[0][1].emailHash).toBeUndefined();
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
        expect.objectContaining({ formAction: expect.stringContaining('/signup') }),
      );
      expect(enqueue.mock.calls[0][1].emailHash).toBeUndefined();

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

      // Should fire synchronously (no hash), no emailHash
      expect(enqueue).toHaveBeenCalledTimes(1);
      expect(enqueue.mock.calls[0][1].emailHash).toBeUndefined();
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
          linkUrl: 'https://store.steampowered.com/app/12345',
          linkText: 'Wishlist on Steam',
          elementId: 'steam-link',
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
          linkUrl: 'https://discord.gg/invite',
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
      expect(props.linkText).toHaveLength(256);
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
          linkUrl: 'https://store.steampowered.com/app/12345',
          linkText: 'Click me',
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

      expect(enqueue.mock.calls[0][1].elementId).toBeUndefined();
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
      teardown = setupAutocapture({}, enqueue, () => consent);

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
      const hash1 = enqueue.mock.calls[0][1].emailHash;
      const hash2 = enqueue.mock.calls[1][1].emailHash;
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^sha256:[a-f0-9]{64}$/);
    });
  });
});
