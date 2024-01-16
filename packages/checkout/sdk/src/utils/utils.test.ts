import { isMatchingAddress } from './utils';

describe('utils', () => {
  it('should return true if addresses are the same', () => {
    const address = isMatchingAddress('0x123', '0x123');
    expect(address).toBeTruthy();
  });

  it('should return true if addresses are the same with different casing', () => {
    const address = isMatchingAddress('0xABC123', '0xabc123');
    expect(address).toBeTruthy();
  });

  it('should return false if addresses do not match', () => {
    const address = isMatchingAddress('0x123', '0x1234');
    expect(address).toBeFalsy();
  });
});
