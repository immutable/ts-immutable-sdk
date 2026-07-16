import type { ConsentLevel } from './types';
import { canTrack, canIdentify } from './consent';
import { collectSessionAttribution } from './attribution';

export interface AutocaptureOptions {
  /** Enable form submission auto-capture. Default: true */
  forms?: boolean;
  /** Enable outbound link click auto-capture. Default: true */
  clicks?: boolean;
  /** Enable internal (same-domain) link click auto-capture. Default: false */
  internalClicks?: boolean;
  /** Enable button and input[type=button|submit|reset] click auto-capture. Default: false */
  buttons?: boolean;
  /** Enable scroll depth milestone auto-capture. Default: true */
  scroll?: boolean;
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

// -- Scroll depth tracking --------------------------------------------------

/** Milestones that fire exactly once per page view. */
const SCROLL_MILESTONES = [25, 50, 75, 90, 100];

/**
 * Fires `scroll_depth` once per milestone (25/50/75/90/100) as the user
 * scrolls. Works for both standard document scroll and SPA internal scroll
 * containers. Milestones reset when `reset()` is called (e.g. on SPA route
 * changes via the caller's `page()` method).
 *
 * Uses a capture-phase listener on `document` so scroll events on any
 * descendant element are caught without enumerating containers upfront.
 * Small containers (clientHeight ≤ 50% of viewport) are ignored to avoid
 * noise from dropdowns, tooltips, and autocomplete lists.
 *
 * Consent is checked at fire time, not at attach time.
 */
function setupScrollTracking(
  enqueue: EnqueueFn,
  getConsent: ConsentFn,
): { teardown: () => void; reset: () => void } {
  const fired = new Set<number>();
  const pending = new Set<Element>();
  let rafId = 0;

  const checkAndFire = (el: Element, scrollPos: number): void => {
    if (!canTrack(getConsent())) return;

    const scrollable = el.scrollHeight - el.clientHeight;
    if (scrollable <= 0) return;

    const pct = Math.min(100, Math.round((scrollPos / scrollable) * 100));

    for (let i = 0; i < SCROLL_MILESTONES.length; i++) {
      const milestone = SCROLL_MILESTONES[i];
      if (pct >= milestone && !fired.has(milestone)) {
        fired.add(milestone);
        enqueue('scroll_depth', { depth: milestone });
      }
    }
  };

  const cancelPending = (): void => {
    pending.clear();
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const onScroll = (e: Event): void => {
    if (fired.size === SCROLL_MILESTONES.length) return;

    const target = e.target === document
      ? document.documentElement
      : e.target as Element;

    // Ignore small containers (dropdowns, tooltips, autocompletes).
    if (target.clientHeight <= window.innerHeight * 0.5) return;

    pending.add(target);

    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      pending.forEach((el) => {
        const scrollPos = el === document.documentElement
          ? window.scrollY
          : el.scrollTop;
        checkAndFire(el, scrollPos);
      });
      pending.clear();
    });
  };

  // Check initial scroll position (e.g. anchor links, restored scroll).
  checkAndFire(document.documentElement, window.scrollY);

  document.addEventListener('scroll', onScroll, { capture: true, passive: true });

  return {
    teardown: () => {
      document.removeEventListener('scroll', onScroll, { capture: true });
      cancelPending();
    },
    // Cancel any pending rAF so a stale scroll position from the previous
    // page view can't fire milestones against the freshly-cleared set.
    reset: () => {
      fired.clear();
      cancelPending();
    },
  };
}

/**
 * Attach document-level listeners for form submissions, outbound link clicks,
 * and scroll depth milestones. `resetScroll()` clears fired scroll milestones
 * (call from the caller's `page()` method on SPA route changes).
 *
 * - Single document-level listener per event type (event delegation).
 * - Consent is checked at fire time, not at attach time.
 * - Email values are SHA-256 hashed client-side before enqueuing.
 */
export function setupAutocapture(
  options: AutocaptureOptions,
  enqueue: EnqueueFn,
  getConsent: ConsentFn,
): { teardown: () => void; resetScroll: () => void } {
  const teardowns: Array<() => void> = [];
  let scrollReset: () => void = () => undefined;

  if (options.forms !== false) {
    const onSubmit = (e: Event): void => {
      if (!canTrack(getConsent())) return;

      const form = e.target as HTMLFormElement;
      if (!form || form.tagName !== 'FORM') return;

      const properties: Record<string, unknown> = {
        form_action: form.action || undefined,
        form_id: form.id || undefined,
        form_name: form.getAttribute('name') || undefined,
        field_names: getFieldNames(form),
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
              properties.email_hash = hash;
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

  if (options.clicks !== false || options.internalClicks === true || options.buttons === true) {
    const onClick = (e: Event): void => {
      if (!canTrack(getConsent())) return;

      const target = e.target as HTMLElement;

      if (options.buttons === true) {
        const buttonSelector = 'button,'
          + ' input[type="button"], input[type="submit"], input[type="reset"]';
        const button = target.closest?.(buttonSelector) as HTMLElement | null;
        if (button) {
          const isInput = button.tagName === 'INPUT';
          const rawText = isInput
            ? (button as HTMLInputElement).value
            : (button.textContent || '');
          // For <button> elements, .type defaults to 'submit' per HTML spec even when
          // no type attribute is set — use getAttribute to get the explicit value.
          const elementType = isInput
            ? (button as HTMLInputElement).type
            : button.getAttribute('type') || 'button';
          // Skip submit buttons that are associated with a form — the form_submitted
          // event already captures that interaction and we don't want to double-count.
          const domType = (button as HTMLInputElement).type;
          if (domType === 'submit' && (button as HTMLButtonElement).form !== null) {
            return;
          }
          enqueue('button_clicked', {
            button_text: rawText.trim().slice(0, 256) || undefined,
            element_id: button.id || undefined,
            element_type: elementType,
          });
          return;
        }
      }

      const anchor = target.closest?.('a') as HTMLAnchorElement | null;
      if (!anchor || !anchor.href) return;

      try {
        const isOutbound = new URL(anchor.href, window.location.origin).hostname !== window.location.hostname;

        if (isOutbound && options.clicks !== false) {
          enqueue('link_clicked', {
            ...collectSessionAttribution(),
            link_url: anchor.href,
            link_text: (anchor.textContent || '').trim().slice(0, 256),
            element_id: anchor.id || undefined,
            outbound: true,
          });
        } else if (!isOutbound && options.internalClicks === true) {
          enqueue('link_clicked', {
            ...collectSessionAttribution(),
            link_url: anchor.href,
            link_text: (anchor.textContent || '').trim().slice(0, 256),
            element_id: anchor.id || undefined,
            outbound: false,
          });
        }
      } catch {
        // Invalid URL — skip silently
      }
    };

    document.addEventListener('click', onClick, true);
    teardowns.push(() => document.removeEventListener('click', onClick, true));
  }

  if (options.scroll !== false) {
    const scroll = setupScrollTracking(enqueue, getConsent);
    teardowns.push(scroll.teardown);
    scrollReset = scroll.reset;
  }

  return {
    teardown: () => teardowns.forEach((fn) => fn()),
    resetScroll: scrollReset,
  };
}
