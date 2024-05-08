import {
  CLOSE_BUTTON_SVG,
  POPUP_BLOCKED_SVG,
  IMMUTABLE_LOGO_SVG,
  PASSPORT_OVERLAY_CLOSE,
  PASSPORT_OVERLAY,
  PASSPORT_OVERLAY_TRY_AGAIN,
} from './constants';

const getCloseButton = (): string => `
    <button
      class="${PASSPORT_OVERLAY_CLOSE}"
      style="
        background: #f3f3f326;
        border: none;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        position: absolute;
        top: 40px;
        right: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      ${CLOSE_BUTTON_SVG}
    </button>
  `;

const getBlockedContents = () => `
    <div
      style="
        color: #e01a3d;
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 10px;
      "
    >
      ${POPUP_BLOCKED_SVG}
      Pop-up blocked
    </div>
    <p style="color: #b6b6b6; text-align: center; margin: 0">
      Please adjust your browser settings <br />and try again below
    </p>
  `;

const getGenericContents = () => `
    <p style="color: #b6b6b6; text-align: center; margin: 0">
      Secure pop-up didn't open?<br />We'll help you re-launch
    </p>
  `;

const getTryAgainButton = () => `
    <button
      class="${PASSPORT_OVERLAY_TRY_AGAIN}"
      style="
        margin-top: 27px;
        color: #f3f3f3;
        background: transparent;
        padding: 12px 24px;
        border-radius: 30px;
        border: 2px solid #f3f3f3;
        font-size: 1em;
        font-weight: 500;
        cursor: pointer;
      "
    >
      Try again
    </button>
  `;

const getOverlay = (contents: string): string => `
    <div
      class="${PASSPORT_OVERLAY}"
      style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(13, 13, 13, 0.48);
        backdrop-filter: blur(28px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 16px;
        line-height: 1.5;
        font-family: Roboto;
        font-style: normal;
        font-weight: 400;
        font-feature-settings: 'clig' off, 'liga' off;
        z-index: 2147483647;
      "
    >
      ${getCloseButton()}
      <div
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 400px;
        "
      >
        ${IMMUTABLE_LOGO_SVG}
        ${contents}
        ${getTryAgainButton()}
      </div>
    </div>
  `;

export const getBlockedOverlay = () => getOverlay(getBlockedContents());
export const getGenericOverlay = () => getOverlay(getGenericContents());
