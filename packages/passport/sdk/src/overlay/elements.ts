import {
  CLOSE_BUTTON_SVG,
  POPUP_BLOCKED_SVG,
  IMMUTABLE_LOGO_SVG,
  PASSPORT_OVERLAY_CLOSE_ID,
  PASSPORT_OVERLAY_ID,
  PASSPORT_OVERLAY_TRY_AGAIN_ID,
} from './constants';

const getCloseButton = (): string => `
    <button
      id="${PASSPORT_OVERLAY_CLOSE_ID}"
      style="
        background: #f3f3f326 !important;
        border: none !important;
        border-radius: 50% !important;
        width: 48px !important;
        height: 48px !important;
        position: absolute !important;
        top: 40px !important;
        right: 40px !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      "
    >
      ${CLOSE_BUTTON_SVG}
    </button>
  `;

const getBlockedContents = () => `
    <div
      style="
        color: #e01a3d !important;
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
        margin-bottom: 10px !important;
      "
    >
      ${POPUP_BLOCKED_SVG}
      Pop-up blocked
    </div>
    <p style="
        color: #b6b6b6 !important;
        text-align: center !important;
        margin: 0 !important;
      "
    >
      Please adjust your browser settings <br />and try again below
    </p>
  `;

const getGenericContents = () => `
    <p style="
        color: #b6b6b6 !important;
        text-align: center !important;
        margin: 0 !important;
      "
    >
      Secure pop-up not showing?<br />We'll help you re-launch
    </p>
  `;

const getTryAgainButton = () => `
    <button
      id="${PASSPORT_OVERLAY_TRY_AGAIN_ID}"
      style="
        margin-top: 27px !important;
        color: #f3f3f3 !important;
        background: transparent !important;
        padding: 12px 24px !important;
        border-radius: 30px !important;
        border: 2px solid #f3f3f3 !important;
        font-size: 1em !important;
        font-weight: 500 !important;
        cursor: pointer !important;
      "
    >
      Try again
    </button>
  `;

const getOverlay = (contents: string): string => `
    <div
      id="${PASSPORT_OVERLAY_ID}"
      style="
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(13, 13, 13, 0.48) !important;
        backdrop-filter: blur(28px) !important;
        -webkit-backdrop-filter: blur(28px) !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        font-size: 16px !important;
        line-height: 1.5 !important;
        font-family: Roboto !important;
        font-style: normal !important;
        font-weight: 400 !important;
        font-feature-settings: 'clig' off, 'liga' off !important;
        z-index: 2147483647 !important;
      "
    >
      ${getCloseButton()}
      <div
        style="
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          max-width: 400px !important;
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
