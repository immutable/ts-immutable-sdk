import { PASSPORT_OVERLAY_CONTENTS_ID } from './constants';
import { getEmbeddedLoginPromptOverlay } from './elements';

export default class EmbeddedLoginPromptOverlay {
  private static overlay: HTMLDivElement | undefined;

  private static onCloseListener: (() => void) | undefined;

  private static closeButton: HTMLButtonElement | undefined;

  static remove() {
    if (this.onCloseListener) {
      this.closeButton?.removeEventListener?.('click', this.onCloseListener);
    }
    this.overlay?.remove();

    this.closeButton = undefined;
    this.onCloseListener = undefined;
    this.overlay = undefined;
  }

  static appendOverlay(embeddedLoginPrompt: HTMLIFrameElement, onCloseListener: () => void) {
    if (!this.overlay) {
      const overlay = document.createElement('div');
      overlay.innerHTML = getEmbeddedLoginPromptOverlay();
      document.body.insertAdjacentElement('beforeend', overlay);
      const overlayContents = document.querySelector<HTMLDivElement>(`#${PASSPORT_OVERLAY_CONTENTS_ID}`);
      if (overlayContents) {
        overlayContents.appendChild(embeddedLoginPrompt);
      }

      overlay.addEventListener('click', onCloseListener);

      this.overlay = overlay;
    }
  }
}
