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

export interface GameBridgeVersionCheckParams {
  gameBridgeTag?: string;
  gameBridgeSha?: string;
  engine?: string;
  engineVersion?: string;
  platform?: string;
  platformVersion?: string;
}

export const gameBridgeVersionCheck = (params: GameBridgeVersionCheckParams) => {
  try {
    let versionCheckUrl = `${imtblApi}${versionApi}`;

    const versionParams: string[] = [];
    if (params.gameBridgeTag) {
      versionParams.push(`imtbl-sdk-gamebridge-${params.gameBridgeTag}`);
    }
    if (params.gameBridgeSha) {
      versionParams.push(`imtbl-sdk-gamebridge-sha-${params.gameBridgeSha}`);
    }
    if (params.engine && params.engineVersion) {
      versionParams.push(`engine-${params.engine}-${params.engineVersion}`);
    }
    if (params.platform && params.platformVersion) {
      versionParams.push(`platform-${params.platform}-${params.platformVersion}`);
    }
    // use engine and platform versions if they exist
    if (versionParams.length > 0) {
      versionCheckUrl += `?version=${versionParams.join(',')}`;
    } else {
      // otherwise just fallback to the sdk version
      versionCheckUrl += `?version=imtbl-sdk-${sdkVersion}`;
    }

    const existingRuntimeId = useRuntimeId();
    if (existingRuntimeId) {
      versionCheckUrl += `&id=${existingRuntimeId}`;
    }

    const runtimeDetails = sdkRuntimeDetails();
    if (runtimeDetails) {
      versionCheckUrl += `&details=${runtimeDetails}`;
    }

    // eslint-disable-next-line no-console
    console.log('Game Bridge Version Check:', encodeURI(versionCheckUrl).replaceAll('+', '%2B'));

    axios
      .get(encodeURI(versionCheckUrl).replaceAll('+', '%2B'))
      .then((response) => {
        const { ok, message, runtimeId } = response.data;
        if (!ok) {
          // eslint-disable-next-line no-console
          console.warn(
            `Immutable SDK: ${message}\n\nPlease update the SDK to the latest version.`,
          );
        }
        if (runtimeId) {
          // !! Does this work on in-game browser?
          useRuntimeId(runtimeId);
        }
      })
      .catch(() => {});
  } catch (_) {
    // eslint-disable-next-line no-console
    console.warn('Immutable SDK: Unable to check for latest version.');
  }
};

// https://api.x.immutable.com/v1/check?version=imtbl-sdk-gamebridge-0.22.0,imtbl-sdk-gamebridge-sha-1234567890,engine-unreal-5.2.1-26001984%2B%2B%2BUE5%2BRelease-5.2,platform-Mac-13.5.2&details=
// https://api.x.immutable.com/v1/check?version=imtbl-sdk-gamebridge-0.22.0,imtbl-sdk-gamebridge-sha-1234567890,engine-unreal-5.2.1-26001984+++UE5+Release-5.2,platform-Mac-13.5.2&details=
