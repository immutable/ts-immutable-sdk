import type { ConsentLevel } from '@imtbl/audience-core';
import { canTrack, canIdentify } from '@imtbl/audience-core';

export interface AutocaptureOptions {
  /** Enable form submission auto-capture. Default: true */
  forms?: boolean;
  /** Enable outbound link click auto-capture. Default: true */
  clicks?: boolean;
}

type EnqueueFn = (eventName: string, properties: Record<string, unknown>) => void;
type ConsentFn = () => ConsentLevel;

/**
 * SHA-256 hash a value using Web Crypto API.
 * Returns `sha256:<hex>`. The raw value never enters the event queue.
 */
async function hashSHA256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input.toLowerCase().trim());
  const buf = await crypto.subtle.digest('SHA-256', data);
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `sha256:${hex}`;
}

function isEmailInput(el: HTMLInputElement): boolean {
  if (el.type === 'email') return true;
  const name = (el.name || el.id || '').toLowerCase();
  return name.includes('email');
}

function findEmail(form: HTMLFormElement): string | null {
  const inputs = form.querySelectorAll<HTMLInputElement>('input');
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    if (isEmailInput(input) && input.value && input.value.includes('@')) {
      return input.value;
    }
  }
  return null;
}

function getFieldNames(form: HTMLFormElement): string[] {
  const names: string[] = [];
  const { elements } = form;
  for (let i = 0; i < elements.length; i++) {
    const name = (elements[i] as HTMLInputElement).name
      || (elements[i] as HTMLInputElement).id;
    if (name && !names.includes(name)) names.push(name);
  }
  return names;
}

/**
 * Attach document-level listeners for form submissions and outbound link clicks.
 * Returns a teardown function that removes all listeners.
 *
 * - Single document-level listener per event type (event delegation).
 * - Consent is checked at fire time, not at attach time.
 * - Email values are SHA-256 hashed client-side before enqueuing.
 */
export function setupAutocapture(
  options: AutocaptureOptions,
  enqueue: EnqueueFn,
  getConsent: ConsentFn,
): () => void {
  const teardowns: Array<() => void> = [];

  if (options.forms !== false) {
    const onSubmit = (e: Event): void => {
      if (!canTrack(getConsent())) return;

      const form = e.target as HTMLFormElement;
      if (!form || form.tagName !== 'FORM') return;

      const properties: Record<string, unknown> = {
        formAction: form.action || undefined,
        formId: form.id || undefined,
        formName: form.getAttribute('name') || undefined,
        fieldNames: getFieldNames(form),
      };

      const consent = getConsent();
      if (canIdentify(consent)) {
        const email = findEmail(form);
        if (email) {
          // Hash before enqueuing — raw email never enters the queue.
          // If crypto.subtle is unavailable (HTTP pages, older browsers),
          // enqueue without emailHash rather than losing the event entirely.
          hashSHA256(email).then(
            (hash) => {
              properties.emailHash = hash;
              enqueue('form_submitted', properties);
            },
            () => {
              enqueue('form_submitted', properties);
            },
          );
          return;
        }
      }

      enqueue('form_submitted', properties);
    };

    document.addEventListener('submit', onSubmit, true);
    teardowns.push(() => document.removeEventListener('submit', onSubmit, true));
  }

  if (options.clicks !== false) {
    const onClick = (e: Event): void => {
      if (!canTrack(getConsent())) return;

      const target = e.target as HTMLElement;
      const anchor = target.closest?.('a') as HTMLAnchorElement | null;
      if (!anchor || !anchor.href) return;

      try {
        const linkHost = new URL(anchor.href, window.location.origin).hostname;
        if (linkHost === window.location.hostname) return;

        enqueue('link_clicked', {
          linkUrl: anchor.href,
          linkText: (anchor.textContent || '').trim().slice(0, 256),
          elementId: anchor.id || undefined,
          outbound: true,
        });
      } catch {
        // Invalid URL — skip silently
      }
    };

    document.addEventListener('click', onClick, true);
    teardowns.push(() => document.removeEventListener('click', onClick, true));
  }

  return () => teardowns.forEach((fn) => fn());
}
