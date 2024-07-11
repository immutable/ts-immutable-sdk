// Exporting utils
import * as localStorage from './utils/localStorage';
import { useLocalStorage } from './utils/state';

export { track } from './track';
export { trackDuration } from './performance';
export { Flow, trackFlow } from './flow';
export { trackError } from './error';
export { identify } from './identify';
export {
  setEnvironment,
  setPassportClientId,
  setPublishableApiKey,
  getDetail,
  Detail,
} from './details';
export const utils = {
  localStorage,
  useLocalStorage,
};
