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
          walletProviderName: WalletProviderName.PASSPORT,
        },
        {
          walletProviderName: WalletProviderName.METAMASK,
        },
        {
          walletProviderName: WalletProviderName.WALLETCONNECT,
        },
      ],
    },
    {
      text: 'filters applied',
      type: WalletFilterTypes.ALL,
      exclude: [
        {
          walletProviderName: WalletProviderName.METAMASK,
        },
        {
          walletProviderName: WalletProviderName.WALLETCONNECT,
        },
      ],
      result: [
        {
          walletProviderName: WalletProviderName.PASSPORT,
        },
      ],
    },
    {
      text: 'exclude undefined',
      type: WalletFilterTypes.ALL,
      result: [
        {
          walletProviderName: WalletProviderName.PASSPORT,
        },
        {
          walletProviderName: WalletProviderName.METAMASK,
        },
        {
          walletProviderName: WalletProviderName.WALLETCONNECT,
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
