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
          walletProvider: 'metamask',
          icon: 'some-icon-url',
          name: 'MetaMask',
          description: 'complete web3 wallet solution',
        },
        {
          walletProvider: 'passport',
          icon: 'pp-icon',
          name: 'Passport',
          description: 'Web3 with your email!',
        },
        {
          walletProvider: 'gamestop',
          icon: 'gme-icon',
          name: 'GameStop',
          description: 'Never stopping the game!',
        },
      ],
    },
    {
      text: 'exclusion of MetaMask wallet applied',
      type: WalletFilterTypes.ALL,
      exclude: [{ walletProvider: WalletProviderName.METAMASK }],
      result: [
        {
          walletProvider: 'passport',
          icon: 'pp-icon',
          name: 'Passport',
          description: 'Web3 with your email!',
        },
        {
          walletProvider: 'gamestop',
          icon: 'gme-icon',
          name: 'GameStop',
          description: 'Never stopping the game!',
        },
      ],
    },
    {
      text: 'mobile platform only',
      type: WalletFilterTypes.MOBILE,
      exclude: [],
      result: [
        {
          walletProvider: 'passport',
          icon: 'pp-icon',
          name: 'Passport',
          description: 'Web3 with your email!',
        },
        {
          walletProvider: 'gamestop',
          icon: 'gme-icon',
          name: 'GameStop',
          description: 'Never stopping the game!',
        },
      ],
    },
    {
      text: 'desktop platform only',
      type: WalletFilterTypes.DESKTOP,
      exclude: [],
      result: [
        {
          walletProvider: 'metamask',
          icon: 'some-icon-url',
          name: 'MetaMask',
          description: 'complete web3 wallet solution',
        },
        {
          walletProvider: 'passport',
          icon: 'pp-icon',
          name: 'Passport',
          description: 'Web3 with your email!',
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
