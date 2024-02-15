import { errorBoundary } from './utils/errorBoundary';
import { Detail } from './utils/constants';
import { storeDetail } from './utils/state';
import { getGlobalisedValue } from './utils/globalise';

const setEnvironmentFn = (env: 'sandbox' | 'production') => {
  storeDetail(Detail.ENVIRONMENT, env);
};
export const setEnvironment = errorBoundary(
  getGlobalisedValue('setEnvironment', setEnvironmentFn),
);

const setPassportClientIdFn = (passportClientId: string) => {
  storeDetail(Detail.PASSPORT_CLIENT_ID, passportClientId);
};
export const setPassportClientId = errorBoundary(
  getGlobalisedValue('setPassportClientId', setPassportClientIdFn),
);

const setPublishableApiKeyFn = (publishableApiKey: string) => {
  storeDetail(Detail.PUBLISHABLE_API_KEY, publishableApiKey);
};
export const setPublishableApiKey = errorBoundary(
  getGlobalisedValue('setPublishableApiKey', setPublishableApiKeyFn),
);
