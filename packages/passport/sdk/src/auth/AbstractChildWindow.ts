/* eslint-disable no-underscore-dangle */
import {
  IWindow, Logger, NavigateParams, NavigateResponse,
} from 'oidc-client-ts';
import { Event } from './Event';

const messageSource = 'oidc-client';

interface MessageData {
  source: string;
  url: string;
  keepOpen: boolean;
}

/**
 * Window implementation which resolves via communication from a child window
 * via the `Window.postMessage()` interface.
 *
 * @internal
 */
export abstract class AbstractChildWindow implements IWindow {
  protected abstract readonly _logger: Logger;

  protected readonly _abort = new Event<[reason: Error]>('Window navigation aborted');

  protected readonly _disposeHandlers = new Set<() => void>();

  protected _window: WindowProxy | null = null;

  public static readParams(url: string, responseMode: 'query' | 'fragment' = 'query'): URLSearchParams {
    if (!url) throw new TypeError('Invalid URL');
    // the base URL is irrelevant, it's just here to support relative url arguments
    const parsedUrl = new URL(url, 'http://127.0.0.1');
    const params = parsedUrl[responseMode === 'fragment' ? 'hash' : 'search'];
    return new URLSearchParams(params.slice(1));
  }

  public async navigate(params: NavigateParams): Promise<NavigateResponse> {
    const logger = this._logger.create('navigate');
    if (!this._window) {
      throw new Error('Attempted to navigate on a disposed window');
    }

    logger.debug('setting URL in window');
    this._window.location.replace(params.url);

    const { url, keepOpen } = await new Promise<MessageData>((resolve, reject) => {
      const listener = (e: MessageEvent) => {
        const { data } = e;
        const origin = params.scriptOrigin ?? window.location.origin;
        if (e.origin !== origin || data?.source !== messageSource) {
          // silently discard events not intended for us
          return;
        }
        try {
          const state = AbstractChildWindow.readParams(data.url, params.response_mode).get('state');
          if (!state) {
            logger.warn('no state found in response url');
          }
          if (e.source !== this._window && state !== params.state) {
            // MessageEvent source is a relatively modern feature, we can't rely on it
            // so we also inspect the payload for a matching state key as an alternative
            return;
          }
        } catch (err) {
          this._dispose();
          reject(new Error('Invalid response from window'));
        }
        resolve(data);
      };
      window.addEventListener('message', listener, false);
      this._disposeHandlers.add(() => window.removeEventListener('message', listener, false));
      this._disposeHandlers.add(this._abort.addHandler((reason) => {
        this._dispose();
        reject(reason);
      }));
    });
    logger.debug('got response from window');
    this._dispose();

    if (!keepOpen) {
      this.close();
    }

    return { url };
  }

  public abstract close(): void;

  // eslint-disable-next-line
  private _dispose(): void {
    this._logger.create('_dispose');

    for (const dispose of this._disposeHandlers) {
      dispose();
    }
    this._disposeHandlers.clear();
  }

  protected static _notifyParent(
    parent: Window,
    url: string,
    keepOpen = false,
    targetOrigin = window.location.origin,
  ): void {
    parent.postMessage({
      source: messageSource,
      url,
      keepOpen,
    } as MessageData, targetOrigin);
  }
}
