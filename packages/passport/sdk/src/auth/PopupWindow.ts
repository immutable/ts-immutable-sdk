/* eslint-disable no-underscore-dangle */
import {
  Logger, NavigateParams, NavigateResponse, PopupWindowFeatures,
} from 'oidc-client-ts';
import { AbstractChildWindow } from './AbstractChildWindow';
import { DefaultPopupWindowFeatures, PopupUtils } from './PopupUtils';

const checkForPopupClosedInterval = 500;
const second = 1000;

/**
 * @public
 */
export interface PopupWindowParams {
  popupWindowFeatures?: PopupWindowFeatures;
  popupWindowTarget?: string;
  /** An AbortSignal to set request's signal. */
  popupSignal?: AbortSignal | null;
}

/**
 * @internal
 */
export class PopupWindow extends AbstractChildWindow {
  protected readonly _logger = new Logger('PopupWindow');

  protected _window: WindowProxy | null = null;

  protected popupWindowTarget: string;

  protected popupWindowFeatures: PopupWindowFeatures;

  public constructor({
    popupWindowTarget = '_blank',
    popupWindowFeatures = {} as PopupWindowFeatures,
    popupSignal,
  }: PopupWindowParams) {
    super();

    this.popupWindowTarget = popupWindowTarget!;
    this.popupWindowFeatures = popupWindowFeatures!;

    if (popupSignal) {
      popupSignal.addEventListener('abort', () => {
        // @ts-ignore
        this._abort.raise(new Error(popupSignal.reason ?? 'Popup aborted'));
      });
    }

    if (popupWindowFeatures?.closePopupWindowAfterInSeconds && popupWindowFeatures.closePopupWindowAfterInSeconds > 0) {
      setTimeout(() => {
        if (!this._window || typeof this._window.closed !== 'boolean' || this._window.closed) {
          this._abort.raise(new Error('Popup blocked by user'));
          return;
        }

        this.close();
      }, popupWindowFeatures.closePopupWindowAfterInSeconds * second);
    }
  }

  public async navigate(params: NavigateParams): Promise<NavigateResponse> {
    const centeredPopup = PopupUtils.center({ ...DefaultPopupWindowFeatures, ...this.popupWindowFeatures });
    this._window = window.open(params.url, this.popupWindowTarget, PopupUtils.serialize(centeredPopup));

    // this._window?.focus();

    const popupClosedInterval = setInterval(() => {
      if (!this._window || this._window.closed) {
        this._abort.raise(new Error('Popup closed by user'));
      }
    }, checkForPopupClosedInterval);
    this._disposeHandlers.add(() => clearInterval(popupClosedInterval));

    return await super.navigate(params);
  }

  public close(): void {
    if (this._window) {
      if (!this._window.closed) {
        this._window.close();
        this._abort.raise(new Error('Popup closed'));
      }
    }
    this._window = null;
  }

  public static notifyOpener(url: string, keepOpen: boolean): void {
    if (!window.opener) {
      throw new Error("No window.opener. Can't complete notification.");
    }
    return super._notifyParent(window.opener, url, keepOpen);
  }
}
