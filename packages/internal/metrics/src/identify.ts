import { storeDetail } from './utils/state';
import { track } from './track';
import { Detail } from './utils/constants';
import { errorBoundary } from './utils/errorBoundary';

type Identity = {
  passportId?: string;
  ethAddress?: string;
  traits?: Record<string, string | number>;
};

const parseIdentity = (params: Identity) => {
  if (params.passportId) {
    const key = `passport:${params.passportId.toLowerCase()}`;
    return key;
  }

  if (params.ethAddress) {
    const key = `ethAddress:${params.ethAddress.toLowerCase()}`;
    return key;
  }

  throw new Error('invalid_identity');
};

const identifyFn = (params: Identity) => {
  const identity = parseIdentity(params);
  if (!identity) {
    return;
  }
  storeDetail(Detail.IDENTITY, identity);
  track('metrics', 'identify', params.traits);
};
export const identify = errorBoundary(identifyFn);
