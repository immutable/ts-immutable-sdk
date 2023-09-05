import axios from 'axios';

import { getItem, setItem } from './localstorage';

export const defaultApiUrl = process.env.IMX_API_URL || 'https://api.x.immutable.com';

function getReferrer() {
  if (typeof window === 'undefined') {
    return '';
  }
  if (
    window.location.ancestorOrigins
    && window.location.ancestorOrigins.length > 0
  ) {
    return new URL(window.location.ancestorOrigins[0]).hostname;
  }

  return document.referrer ? new URL(window.document.referrer).hostname : '';
}
function runtimeHost() {
  if (typeof window === 'undefined') {
    return '';
  }
  if (window.opener || window.parent !== window) {
    return getReferrer();
  }
  return new URL(window.location.href).hostname;
}

function sdkRuntimeDetails() {
  if (typeof window === 'undefined') {
    return btoa(JSON.stringify({ browser: 'nodejs' }));
  }

  const idVal = JSON.stringify({
    browser: window.navigator.userAgent,
    domain: runtimeHost(),
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${window.screen.width}x${window.screen.height}`,
  });

  return btoa(idVal);
}
function useRuntimeId(runtimeId?: string) {
  // only run on browser
  if (typeof window === 'undefined') {
    return '';
  }
  const runtimeKey = 'runtimeid';
  if (runtimeId) {
    setItem(runtimeKey, runtimeId);
  }
  return getItem(runtimeKey) || '';
}

// In prep for releasing new Unified SDK
// Get a better understanding of what versions are being used
export function sdkVersionCheck(version = '') {
  console.log('trying to check version');
  try {
    const existingRuntimeId = useRuntimeId();
    const runtimeDetails = sdkRuntimeDetails();
    // eslint-disable-next-line max-len
    const versionCheckUrl = `${defaultApiUrl}/v1/projects/sdk?version=imtbl-sdk-${version}&id=${existingRuntimeId}&details=${runtimeDetails}`;
    axios
      .get(versionCheckUrl)
      .then((response) => {
        const { ok, message, runtimeId } = response.data;
        if (!ok) {
          console.warn(
            `@imtbl/sdk: ${message}\n\nPlease update the SDK to the latest version.`,
          );
        }
        if (runtimeId) {
          useRuntimeId(runtimeId);
        }
      })
      .catch(() => {});
  } catch (_) {
    console.warn('@imtbl/sdk: Unable to check for latest version.');
  }
}
