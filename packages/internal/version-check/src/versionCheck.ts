import axios from 'axios';
import { getItem, setItem } from './localStorage';

export const imtblApi = process.env.IMTBL_API || 'https://api.x.immutable.com';
export const versionApi = process.env.VERSION_API || '/v1/check';
export const sdkVersion = '__SDK_VERSION__';

const getReferrer = () => {
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
};

const runtimeHost = () => {
  if (typeof window === 'undefined') {
    return '';
  }
  if (window.opener || window.parent !== window) {
    return getReferrer();
  }
  return new URL(window.location.href).hostname;
};

const sdkRuntimeDetails = () => {
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
};

const useRuntimeId = (runtimeId?: string) => {
  // only run on browser
  if (typeof window === 'undefined') {
    return '';
  }
  const runtimeKey = 'runtimeid';
  if (runtimeId) {
    setItem(runtimeKey, runtimeId);
  }
  return getItem(runtimeKey) || '';
};

export const sdkVersionCheck = (appName?: string, appVersion?: string) => {
  try {
    const existingRuntimeId = useRuntimeId();
    const runtimeDetails = sdkRuntimeDetails();
    const versionParam = appName && appVersion
      ? `version=imtbl-sdk-${sdkVersion},${appName}-${appVersion}`
      : `version=imtbl-sdk-${sdkVersion}`;
    const detailsParam = `details=${runtimeDetails}`;

    let versionCheckUrl = encodeURI(`${imtblApi}${versionApi}?${versionParam}&${detailsParam}`).replaceAll('+', '%2B');
    if (existingRuntimeId) {
      versionCheckUrl += `&id=${existingRuntimeId}`;
    }

    axios
      .get(versionCheckUrl)
      .then((response) => {
        const { ok, message, runtimeId } = response.data;
        if (!ok) {
          // eslint-disable-next-line no-console
          console.warn(
            `Immutable SDK: ${message}\n\nPlease update the SDK to the latest version.`,
          );
        }
        if (runtimeId) {
          useRuntimeId(runtimeId);
        }
      })
      .catch(() => {});
  } catch (_) {
    // eslint-disable-next-line no-console
    console.warn('Immutable SDK: Unable to check for latest version.');
  }
};
