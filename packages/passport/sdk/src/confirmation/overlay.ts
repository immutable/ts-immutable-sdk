import { getBlockedContents, getOverlay, getRefocusContents } from './overlayHtml';

export default class Overlay {
  private overlay: HTMLDivElement | undefined;

  private isBlockedOverlay: boolean;

  private tryAgainListener: (() => void) | undefined;

  constructor(isBlockedOverlay: boolean) {
    this.isBlockedOverlay = isBlockedOverlay;
  }

  createOrUpdateOverlay(
    tryAgainOnClick: () => void,
    onCloseClick: () => void,
  ) {
    this.appendOverlay();
    this.updateTryAgainButton(tryAgainOnClick);
    this.updateCloseButton(onCloseClick);
  }

  private appendOverlay() {
    if (!this.overlay) {
      const overlay = document.createElement('div');

      overlay.innerHTML = getOverlay(
        this.isBlockedOverlay ? getBlockedContents() : getRefocusContents(),
      );

      document.body.insertAdjacentElement('beforeend', overlay);
      this.overlay = overlay;
    }
  }

  private updateTryAgainButton(tryAgainOnClick: () => void) {
    const tryAgainButton = this.overlay?.querySelector('.passport-overlay-try-again');
    if (tryAgainButton) {
      if (this.tryAgainListener) {
        tryAgainButton.removeEventListener('click', this.tryAgainListener);
      }
      this.tryAgainListener = tryAgainOnClick;
      tryAgainButton.addEventListener('click', tryAgainOnClick);
    }
  }

  private updateCloseButton(onCloseClick: () => void) {
    const closeButton = this.overlay?.querySelector('.passport-overlay-close');
    if (closeButton) {
      closeButton.addEventListener('click', onCloseClick);
    }
  }

  removeOverlay() {
    if (this.overlay) {
      this.overlay.remove();
    }
  }
}

// appendOverlay(href: string, showBlockedContents: boolean) {
//   if (this.overlay) {
//     this.overlay.remove();
//   }

//   const overlay = document.createElement('div');

//   overlay.innerHTML = getOverlay(
//     showBlockedContents ? getBlockedContents() : getRefocusContents(),
//   );

//   document.body.insertAdjacentElement('beforeend', overlay);
//   this.overlay = overlay;

//   this.tryAgainListener = () => this.recreateConfirmationWindow(href);

//   // This brief timeout ensures the buttons exist before attaching the event listener
//   setTimeout(() => { // todo: see if needed
//     const tryAgainButton = overlay.querySelector('.passport-overlay-try-again');
//     if (tryAgainButton && this.tryAgainListener) {
//       tryAgainButton.addEventListener('click', this.tryAgainListener);
//     }
//     const closeButton = overlay.querySelector('.passport-overlay-close');
//     if (closeButton) {
//       closeButton.addEventListener('click', () => {
//         this.confirmationWindow?.close();
//         this.overlay?.remove();
//       });
//     }
//   }, 0);
// }
