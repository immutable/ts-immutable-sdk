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
        {
          walletProvider: WalletProviderName.PASSPORT,
          name: WalletProviderName.PASSPORT,
        },
      ],
    },
    {
      text: 'filters applied',
      type: WalletFilterTypes.ALL,
      exclude: [
        {
          walletProvider: WalletProviderName.METAMASK,
        },
      ],
      result: [
        {
          walletProvider: WalletProviderName.PASSPORT,
          name: WalletProviderName.PASSPORT,
        },
      ],
    },
    {
      text: 'exclude undefined',
      type: WalletFilterTypes.ALL,
      result: [
        {
          walletProvider: WalletProviderName.METAMASK,
          name: WalletProviderName.METAMASK,
        },
        {
          walletProvider: WalletProviderName.PASSPORT,
          name: WalletProviderName.PASSPORT,
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
