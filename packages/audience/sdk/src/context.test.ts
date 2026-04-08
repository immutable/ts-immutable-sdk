import { collectContext } from './context';
import { LIBRARY_NAME, LIBRARY_VERSION } from './config';

describe('collectContext', () => {
  it('should return context with SDK library name and version', () => {
    const ctx = collectContext();

    expect(ctx.library).toBe(LIBRARY_NAME);
    expect(ctx.libraryVersion).toBe(LIBRARY_VERSION);
  });
});
