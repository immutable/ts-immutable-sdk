import type { EventContext } from '@imtbl/audience-core';
import { collectContext as coreCollectContext } from '@imtbl/audience-core';
import { LIBRARY_NAME, LIBRARY_VERSION } from './config';

export function collectContext(): EventContext {
  return coreCollectContext(LIBRARY_NAME, LIBRARY_VERSION);
}
