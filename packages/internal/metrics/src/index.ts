import { track } from './track';

export { identify } from './identify';
export {
  setEnvironment,
  setPassportClientId,
  setPublishableApiKey,
} from './details';

track('metrics', 'sdk_version', {
  version: '__SDK_VERSION__',
});

export { track };
