import { track } from '@imtbl/metrics';

const moduleName = 'minting_backend_sdk';

export const trackInitializePersistencePG = () => {
  try {
    track(moduleName, 'initializePersistencePG');
  } catch {
    // ignore
  }
};

export const trackInitializePersistencePrismaSqlite = () => {
  try {
    track(moduleName, 'initializePersistencePrismaSqlite');
  } catch {
    // ignore
  }
};

export const trackSubmitMintingRequests = () => {
  try {
    track(moduleName, 'submitMintingRequests');
  } catch {
    // ignore
  }
};

export const trackProcessMint = () => {
  try {
    track(moduleName, 'processMint');
  } catch {
    // ignore
  }
};

export const trackRecordMint = () => {
  try {
    track(moduleName, 'recordMint');
  } catch {
    // ignore
  }
};
