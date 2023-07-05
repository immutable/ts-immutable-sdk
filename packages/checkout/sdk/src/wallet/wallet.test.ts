import { WalletFilterTypes, WalletProviderName } from '../types';
import { getWalletAllowList } from './wallet';

describe('getWalletAllowList', () => {
  const testcases = [
    {
      text: 'no filters applied',
      type: WalletFilterTypes.ALL,
      exclude: [],
      result: [
        {
          walletProvider: WalletProviderName.METAMASK,
          name: WalletProviderName.METAMASK,
        },
      ],
    },
  ];
  testcases.forEach((testcase) => {
    it(`should return the allowed wallets list with ${testcase.text}`, async () => {
      await expect(
        await getWalletAllowList({
          type: testcase.type,
          exclude: testcase.exclude,
        }),
      ).toEqual({
        wallets: testcase.result,
      });
    });
  });
});
