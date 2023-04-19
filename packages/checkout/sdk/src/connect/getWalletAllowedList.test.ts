import { ConnectionProviders, WalletFilterTypes } from '../types';
import { getWalletAllowList } from './connect';

describe('getWalletAllowList', () => {
  const testcases = [
    {
      text: 'no filters applied',
      type: WalletFilterTypes.ALL,
      exclude: [],
      result: [
        {
          connectionProvider: 'metamask',
          icon: 'some-icon-url',
          name: 'MetaMask',
          description: 'complete web3 wallet solution',
        },
        {
          connectionProvider: 'passport',
          icon: 'pp-icon',
          name: 'Passport',
          description: 'Web3 with your email!',
        },
        {
          connectionProvider: 'gamestop',
          icon: 'gme-icon',
          name: 'GameStop',
          description: 'Never stopping the game!',
        },
      ],
    },
    {
      text: 'exclusion of Gamestop wallet applied',
      type: WalletFilterTypes.ALL,
      exclude: [{ connectionProvider: ConnectionProviders.METAMASK }],
      result: [
        {
          connectionProvider: 'passport',
          icon: 'pp-icon',
          name: 'Passport',
          description: 'Web3 with your email!',
        },
        {
          connectionProvider: 'gamestop',
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
          connectionProvider: 'metamask',
          icon: 'some-icon-url',
          name: 'MetaMask',
          description: 'complete web3 wallet solution',
        },
        {
          connectionProvider: 'passport',
          icon: 'pp-icon',
          name: 'Passport',
          description: 'Web3 with your email!',
        },
      ],
    },
    {
      text: 'desktop platform only',
      type: WalletFilterTypes.DESKTOP,
      exclude: [],
      result: [
        {
          connectionProvider: 'metamask',
          icon: 'some-icon-url',
          name: 'MetaMask',
          description: 'complete web3 wallet solution',
        },
        {
          connectionProvider: 'gamestop',
          icon: 'gme-icon',
          name: 'GameStop',
          description: 'Never stopping the game!',
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
        })
      ).toEqual({
        allowedWallets: testcase.result,
      });
    });
  });
});
