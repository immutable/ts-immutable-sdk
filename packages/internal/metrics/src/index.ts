// Exporting utils
import * as localStorage from './utils/localStorage';

export { track } from './track';
export { trackDuration } from './performance';
export { trackFlow } from './flow';
export type { Flow } from './flow';
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

export const bla = 'qwerqwer';
