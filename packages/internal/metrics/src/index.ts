// Exporting utils
import * as localStorage from './utils/localStorage';

export { track } from './track';
export { trackDuration } from './performance';
export { type Flow, trackFlow } from './flow';
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
};
