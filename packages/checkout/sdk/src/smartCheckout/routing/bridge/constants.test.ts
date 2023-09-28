import { getImxL1Representation } from './constants';
import { ChainId } from '../../../types';

describe('constants', () => {
  it('should return the IMX address matching the chainId', async () => {
    const config = {
      remote: {
        getConfig: jest.fn().mockResolvedValue({
          [ChainId.SEPOLIA]: '0x123',
        }),
      },
    } as any;

    const result = await getImxL1Representation(ChainId.SEPOLIA, config);
    expect(result).toBe('0x123');
  });

  it('should return empty when no matching chainId', async () => {
    const config = {
      remote: {
        getConfig: jest.fn().mockResolvedValue({}),
      },
    } as any;

    const result = await getImxL1Representation(ChainId.SEPOLIA, config);
    expect(result).toBe('');
  });
});
