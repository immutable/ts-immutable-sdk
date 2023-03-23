import { getTokenAllowList, icons } from './tokens';

describe('tokens', () => {
  it('should return the alphabetically sorted tokens allowlist', () => {
    expect(getTokenAllowList()).toEqual({
      tokens: [
        {
          "name": "Ethereum",
          "ticker": "ETH",
          "contractAddress": "",
          "decimal": 18,
          "icon": icons.ETHEREUM,
        },
        {
          "name": "Matic",
          "ticker": "MATIC",
          "contractAddress": "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
          "decimal": 18,
          "icon": icons.MATIC,
          },
        {
          "name": "ImmutableX",
          "ticker": "IMX",
          "contractAddress": "0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF",
          "decimal": 18,
          "icon": icons.IMX,
        },
      ],
    });
  });
});
