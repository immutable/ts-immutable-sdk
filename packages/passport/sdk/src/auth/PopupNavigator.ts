// import { Logger } from "../utils";

import {
  INavigator, Logger, PopupWindowParams, UserManagerSettingsStore,
} from 'oidc-client-ts';
import { PopupWindow } from './PopupWindow';

/**
 * @internal
 */
export class PopupNavigator implements INavigator {
  private readonly _logger = new Logger('PopupNavigator');

  constructor(private _settings: UserManagerSettingsStore) { }

  public async prepare({
    // eslint-disable-next-line no-underscore-dangle
    popupWindowFeatures = this._settings.popupWindowFeatures,
    // eslint-disable-next-line no-underscore-dangle
    popupWindowTarget = this._settings.popupWindowTarget,
    popupSignal,
  }: PopupWindowParams & { popupSignal?: AbortSignal | null; }): Promise<PopupWindow> {
    return new PopupWindow({ popupWindowFeatures, popupWindowTarget, popupSignal });
  }

  public async callback(url: string, { keepOpen = false }): Promise<void> {
    // eslint-disable-next-line no-underscore-dangle
    this._logger.create('callback');

    PopupWindow.notifyOpener(url, keepOpen);
  }
}
