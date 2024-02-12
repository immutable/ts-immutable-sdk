import { isNode } from './utils/browser';
import { Detail } from './utils/constants';
import { post } from './utils/request';
import { flattenProperties, getDetail, storeDetail } from './utils/state';

// WARNING: DO NOT CHANGE THE STRING BELOW. IT GETS REPLACED AT BUILD TIME.
const SDK_VERSION = '__SDK_VERSION__';

const getReferrer = () => {
  if (isNode()) {
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
  if (isNode()) {
    return '';
  }
  if (window.opener || window.parent !== window) {
    return getReferrer();
  }
  return new URL(window.location.href).hostname;
};

type RuntimeDetails = {
  sdkVersion: string;
  browser: string;
  domain?: string;
  tz?: string;
  screen?: string;
};

const getRuntimeDetails = (): RuntimeDetails => {
  storeDetail(Detail.SDK_VERSION, SDK_VERSION);

  if (isNode()) {
    return { browser: 'nodejs', sdkVersion: SDK_VERSION };
  }

  const domain = runtimeHost();
  if (domain) {
    storeDetail(Detail.DOMAIN, domain);
  }

  return {
    sdkVersion: SDK_VERSION,
    browser: window.navigator.userAgent,
    domain,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${window.screen.width}x${window.screen.height}`,
  };
};

type InitialiseResponse = {
  runtimeId: string;
};

let initialised = false;
export const isInitialised = () => initialised;

export const initialise = async () => {
  initialised = true;
  try {
    const runtimeDetails = flattenProperties(getRuntimeDetails());
    const existingRuntimeId = getDetail(Detail.RUNTIME_ID);

    const body = {
      version: 1,
      data: {
        runtimeDetails,
        runtimeId: existingRuntimeId,
      },
    };
    const response = await post<InitialiseResponse>('/v1/sdk/initialise', body);

    // Get runtimeId and store it
    const { runtimeId } = response;
    storeDetail(Detail.RUNTIME_ID, runtimeId);
  } catch (error) {
    initialised = false;
  }
};
