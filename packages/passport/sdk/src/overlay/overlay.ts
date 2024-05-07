import { PASSPORT_OVERLAY_CLOSE, PASSPORT_OVERLAY_TRY_AGAIN } from './constants';
import { getBlockedOverlay, getRefocusOverlay } from './elements';

export default class Overlay {
  private overlay: HTMLDivElement | undefined;

  private isBlockedOverlay: boolean;

  private tryAgainListener: (() => void) | undefined;

  private onCloseListener: (() => void) | undefined;

  constructor(isBlockedOverlay: boolean = false) {
    this.isBlockedOverlay = isBlockedOverlay;
  }

  append(tryAgainOnClick: () => void, onCloseClick: () => void) {
    this.appendOverlay();
    this.updateTryAgainButton(tryAgainOnClick);
    this.updateCloseButton(onCloseClick);
  }

  update(tryAgainOnClick: () => void) {
    this.updateTryAgainButton(tryAgainOnClick);
  }

  remove() {
    if (this.overlay) {
      this.overlay.remove();
    }
  }

  private appendOverlay() {
    if (!this.overlay) {
      const overlay = document.createElement('div');
      overlay.innerHTML = this.isBlockedOverlay ? getBlockedOverlay() : getRefocusOverlay();
      document.body.insertAdjacentElement('beforeend', overlay);
      this.overlay = overlay;
    }
  }

  private updateTryAgainButton(tryAgainOnClick: () => void) {
    const tryAgainButton = this.overlay?.querySelector(`.${PASSPORT_OVERLAY_TRY_AGAIN}`);
    if (tryAgainButton) {
      if (this.tryAgainListener) {
        tryAgainButton.removeEventListener('click', this.tryAgainListener);
      }
      this.tryAgainListener = tryAgainOnClick;
      tryAgainButton.addEventListener('click', tryAgainOnClick);
    }
  }

  private updateCloseButton(onCloseClick: () => void) {
    const closeButton = this.overlay?.querySelector(`.${PASSPORT_OVERLAY_CLOSE}`);
    if (closeButton) {
      if (this.onCloseListener) {
        closeButton.removeEventListener('click', this.onCloseListener);
      }
      this.onCloseListener = onCloseClick;
      closeButton.addEventListener('click', onCloseClick);
    }
  }
}
