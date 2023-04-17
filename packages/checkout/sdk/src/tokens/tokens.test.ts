import { ChainId, TokenFilterTypes } from '../types';
import { getTokenAllowList, Icon } from './tokens';

describe('tokens', () => {
  it('should return the alphabetically sorted tokens allowlist', async () => {
    await expect(
      await getTokenAllowList({
        type: TokenFilterTypes.ALL,
        chainId: ChainId.ETHEREUM
      })
    ).toEqual({
      tokens: [
        {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
          icon: Icon.ETH,
        },
        {
          name: 'Immutable X',
          symbol: 'IMX',
          address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
          decimals: 18,
          icon: Icon.IMX,
        },
        {
          name: 'Matic',
          symbol: 'MATIC',
          address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
          decimals: 18,
          icon: Icon.MATIC,
        },
      ],
    });
  });
});
