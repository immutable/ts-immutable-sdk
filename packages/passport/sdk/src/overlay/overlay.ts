import { PopupOverlayOptions } from 'types';
import { PASSPORT_OVERLAY_CLOSE_ID, PASSPORT_OVERLAY_TRY_AGAIN_ID } from './constants';
import { getBlockedOverlay, getGenericOverlay } from './elements';

export default class Overlay {
  private disableGenericPopupOverlay: boolean;

  private disableBlockedPopupOverlay: boolean;

  private overlay: HTMLDivElement | undefined;

  private isBlockedOverlay: boolean;

  private tryAgainListener: (() => void) | undefined;

  private onCloseListener: (() => void) | undefined;

  constructor(popupOverlayOptions: PopupOverlayOptions, isBlockedOverlay: boolean = false) {
    this.disableBlockedPopupOverlay = popupOverlayOptions.disableBlockedPopupOverlay || false;
    this.disableGenericPopupOverlay = popupOverlayOptions.disableGenericPopupOverlay || false;
    this.isBlockedOverlay = isBlockedOverlay;
  }

  append(tryAgainOnClick: () => void, onCloseClick: () => void) {
    if (this.shouldAppendOverlay()) {
      this.appendOverlay();
      this.updateTryAgainButton(tryAgainOnClick);
      this.updateCloseButton(onCloseClick);
    }
  }

  update(tryAgainOnClick: () => void) {
    this.updateTryAgainButton(tryAgainOnClick);
  }

  remove() {
    if (this.overlay) {
      this.overlay.remove();
    }
  }

  private shouldAppendOverlay(): boolean {
    if (this.disableGenericPopupOverlay && this.disableBlockedPopupOverlay) return false;
    if (this.disableGenericPopupOverlay && !this.isBlockedOverlay) return false;
    if (this.disableBlockedPopupOverlay && this.isBlockedOverlay) return false;
    return true;
  }

  private appendOverlay() {
    if (!this.overlay) {
      const link1: HTMLLinkElement = document.createElement('link');
      link1.href = 'https://fonts.googleapis.com';
      link1.rel = 'preconnect';
      document.head.appendChild(link1);

      const link2: HTMLLinkElement = document.createElement('link');
      link2.href = 'https://fonts.gstatic.com';
      link2.rel = 'preconnect';
      link2.crossOrigin = 'anonymous';
      document.head.appendChild(link2);

      const link3: HTMLLinkElement = document.createElement('link');
      link3.href = 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap';
      link3.rel = 'stylesheet';
      document.head.appendChild(link3);

      const overlay = document.createElement('div');
      overlay.innerHTML = this.isBlockedOverlay ? getBlockedOverlay() : getGenericOverlay();
      document.body.insertAdjacentElement('beforeend', overlay);
      this.overlay = overlay;
    }
  }

  private updateTryAgainButton(tryAgainOnClick: () => void) {
    const tryAgainButton = document.getElementById(PASSPORT_OVERLAY_TRY_AGAIN_ID);
    if (tryAgainButton) {
      if (this.tryAgainListener) {
        tryAgainButton.removeEventListener('click', this.tryAgainListener);
      }
      this.tryAgainListener = tryAgainOnClick;
      tryAgainButton.addEventListener('click', tryAgainOnClick);
    }
  }

  private updateCloseButton(onCloseClick: () => void) {
    const closeButton = document.getElementById(PASSPORT_OVERLAY_CLOSE_ID);
    if (closeButton) {
      if (this.onCloseListener) {
        closeButton.removeEventListener('click', this.onCloseListener);
      }
      this.onCloseListener = onCloseClick;
      closeButton.addEventListener('click', onCloseClick);
    }
  }
}
