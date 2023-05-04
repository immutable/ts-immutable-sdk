import { BigNumber } from 'ethers';
import { ChainId, SupportedFiatCurrencies, TokenFilterTypes } from '../types';
import { getTokenAllowList, convertTokensToFiat } from './tokens';
import axios from 'axios';
import { CheckoutError, CheckoutErrorType } from '../errors';

const enum Icon {
  ETH = `data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg xmlns='http://www.w3.org/2000/svg' xml:space='preserve' width='100%25' height='100%25' version='1.1' shape-rendering='geometricPrecision' text-rendering='geometricPrecision' image-rendering='optimizeQuality' fill-rule='evenodd' clip-rule='evenodd'%0AviewBox='0 0 784.37 1277.39' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:xodm='http://www.corel.com/coreldraw/odm/2003'%3E%3Cg id='Layer_x0020_1'%3E%3Cmetadata id='CorelCorpID_0Corel-Layer'/%3E%3Cg id='_1421394342400'%3E%3Cg%3E%3Cpolygon fill='%23343434' fill-rule='nonzero' points='392.07,0 383.5,29.11 383.5,873.74 392.07,882.29 784.13,650.54 '/%3E%3Cpolygon fill='%238C8C8C' fill-rule='nonzero' points='392.07,0 -0,650.54 392.07,882.29 392.07,472.33 '/%3E%3Cpolygon fill='%233C3C3B' fill-rule='nonzero' points='392.07,956.52 387.24,962.41 387.24,1263.28 392.07,1277.38 784.37,724.89 '/%3E%3Cpolygon fill='%238C8C8C' fill-rule='nonzero' points='392.07,1277.38 392.07,956.52 -0,724.89 '/%3E%3Cpolygon fill='%23141414' fill-rule='nonzero' points='392.07,882.29 784.13,650.54 392.07,472.33 '/%3E%3Cpolygon fill='%23393939' fill-rule='nonzero' points='0,650.54 392.07,882.29 392.07,472.33 '/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A`,
  MATIC = `data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 38.4 33.5' style='enable-background:new 0 0 38.4 33.5;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%238247E5;%7D%0A%3C/style%3E%3Cg%3E%3Cpath class='st0' d='M29,10.2c-0.7-0.4-1.6-0.4-2.4,0L21,13.5l-3.8,2.1l-5.5,3.3c-0.7,0.4-1.6,0.4-2.4,0L5,16.3 c-0.7-0.4-1.2-1.2-1.2-2.1v-5c0-0.8,0.4-1.6,1.2-2.1l4.3-2.5c0.7-0.4,1.6-0.4,2.4,0L16,7.2c0.7,0.4,1.2,1.2,1.2,2.1v3.3l3.8-2.2V7 c0-0.8-0.4-1.6-1.2-2.1l-8-4.7c-0.7-0.4-1.6-0.4-2.4,0L1.2,5C0.4,5.4,0,6.2,0,7v9.4c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7 c0.7,0.4,1.6,0.4,2.4,0l5.5-3.2l3.8-2.2l5.5-3.2c0.7-0.4,1.6-0.4,2.4,0l4.3,2.5c0.7,0.4,1.2,1.2,1.2,2.1v5c0,0.8-0.4,1.6-1.2,2.1 L29,28.8c-0.7,0.4-1.6,0.4-2.4,0l-4.3-2.5c-0.7-0.4-1.2-1.2-1.2-2.1V21l-3.8,2.2v3.3c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7 c0.7,0.4,1.6,0.4,2.4,0l8.1-4.7c0.7-0.4,1.2-1.2,1.2-2.1V17c0-0.8-0.4-1.6-1.2-2.1L29,10.2z'/%3E%3C/g%3E%3C/svg%3E%0A`,
  IMX = `data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 139 113' style='enable-background:new 0 0 139 113;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bclip-path:url(%23SVGID_00000053504646934646330740000009134454895836103350_);%7D .st1%7Bfill:%2317B5CB;%7D%0A%3C/style%3E%3Cg%3E%3Cdefs%3E%3Crect id='SVGID_1_' width='139' height='113'/%3E%3C/defs%3E%3CclipPath id='SVGID_00000035518931339590433170000002358037249938198420_'%3E%3Cuse xlink:href='%23SVGID_1_' style='overflow:visible;'/%3E%3C/clipPath%3E%3Cg style='clip-path:url(%23SVGID_00000035518931339590433170000002358037249938198420_);'%3E%3Cpath class='st1' d='M124.1,0h14.6L79.5,67.6c-1.5,1.7-1.6,4.3-0.1,6.1l34.1,39.7H98.3L66.8,76.6l-1.6-2c-1.5-1.7-1.4-4.4,0.1-6.1 L124.1,0z'/%3E%3Cpath class='st1' d='M91.2,73.7c-1-1.1-1.3-2.7-1-4.1c0.3-0.8,0.8-1.6,1.4-2.2l3.9-4.3l43.5,50.3h-13.8 C125.2,113.4,99.7,83.6,91.2,73.7z'/%3E%3Cpath class='st1' d='M15.2,113.4H0l46.6-53.9c1.5-1.7,1.5-4.3,0-6L0.4,0H15l46.5,53.9c1.2,1.6,1.4,3.9,0.1,5.4 C49.4,73.4,15.2,113.4,15.2,113.4z'/%3E%3Cpath class='st1' d='M40.6,0h-14l43.1,49.9c0,0,0.1-0.1,4.9-5.8c1.3-1.5,1.6-3.4,0.1-4.9C65.7,30,40.6,0,40.6,0z'/%3E%3Cpath class='st1' d='M82.6,34.8L112.5,0H98.3L82.7,18.2l-4.5,5.3c-1.5,1.7-1.6,4.3-0.1,6.1C79.2,30.9,82.6,34.8,82.6,34.8z'/%3E%3Cpath class='st1' d='M56.6,78.6l-29.9,34.8h14.1l15.6-18.2l4.5-5.3c1.5-1.7,1.6-4.3,0.1-6.1C59.9,82.5,56.6,78.6,56.6,78.6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A`,
}

const ethTokenInfo = {
  name: 'Ethereum',
  symbol: 'ETH',
  decimals: 18,
  icon: Icon.ETH,
};

jest.mock('axios', () => ({
  get: jest.fn(),
}));

describe('token related functions', () => {
  describe('getTokenAllowList', () => {
    const testcases = [
      {
        text: 'Eth chain with no filters (ALL type)',
        type: TokenFilterTypes.ALL,
        chainId: ChainId.ETHEREUM,
        exclude: [],
        result: [
          ethTokenInfo,
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
      },
      {
        text: 'Goerli chain with Bridge feature',
        type: TokenFilterTypes.BRIDGE,
        chainId: ChainId.GOERLI,
        exclude: [],
        result: [
          ethTokenInfo,
          {
            name: 'Immutable X',
            symbol: 'IMX',
            address: '0x1facdd0165489f373255a90304650e15481b2c85',
            decimals: 18,
            icon: Icon.IMX,
          },
          {
            name: 'Bridge Coin',
            symbol: 'BDC',
            address: '0x123456789',
            decimals: 18,
          },
        ],
      },
      {
        text: 'Goerli chain with swap feature (no exclude list)',
        type: TokenFilterTypes.SWAP,
        chainId: ChainId.GOERLI,
        exclude: [],
        result: [
          ethTokenInfo,
          {
            name: 'Immutable X',
            symbol: 'IMX',
            address: '0x1facdd0165489f373255a90304650e15481b2c85',
            decimals: 18,
            icon: Icon.IMX,
          },
          {
            name: 'Swap Coin',
            symbol: 'SWC',
            address: '0x123456789',
            decimals: 18,
          },
        ],
      },
      {
        text: 'exclude list on Goerli chain with swap feature',
        type: TokenFilterTypes.SWAP,
        chainId: ChainId.GOERLI,
        exclude: [
          { address: '' },
          { address: '0x1facdd0165489f373255a90304650e15481b2c85' },
        ],
        result: [
          {
            name: 'Swap Coin',
            symbol: 'SWC',
            address: '0x123456789',
            decimals: 18,
          },
        ],
      },
      {
        text: 'Unsupported chain',
        type: TokenFilterTypes.SWAP,
        chainId: 23,
        exclude: [],
        result: [],
      },
    ];

    testcases.forEach((testcase) => {
      it(`should return the filtered list of allowed tokens for a given ${testcase.text}`, async () => {
        await expect(
          await getTokenAllowList({
            type: testcase.type,
            chainId: testcase.chainId,
            exclude: testcase.exclude,
          })
        ).toEqual({
          tokens: testcase.result,
        });
      });
    });
  });

  describe('convertTokensToFiat', () => {
    it('should convert a given amount of token to a given fiat currency', async () => {
      (axios.get as unknown as jest.Mock)
        .mockResolvedValueOnce({
          data: [
            {
              id: 'ethereum',
              symbol: 'eth',
            },
          ],
        })
        .mockResolvedValueOnce({
          data: {
            ethereum: {
              usd: 1000.0,
              last_updated_at: 12345,
            },
          },
        });

      const amount = BigNumber.from('1000000000000000000');
      const res = await convertTokensToFiat({
        amounts: {
          ETH: {
            amount,
            token: ethTokenInfo,
          },
        },
        fiatSymbol: SupportedFiatCurrencies.USD,
      });

      expect(res).toEqual({
        ETH: {
          token: ethTokenInfo,
          fiatSymbol: SupportedFiatCurrencies.USD,
          quotedAt: 12345,
          quote: 1000.0,
          amount: amount,
          convertedAmount: 1000.0,
        },
      });
    });

    it('should not return a conversion if the token cant be found on the exchange', async () => {
      (axios.get as unknown as jest.Mock)
        .mockResolvedValueOnce({
          data: [],
        })
        .mockResolvedValueOnce({
          data: {
            prices: [
              [12345, 1000.0],
              [12344, 500.0],
            ],
          },
        });

      const amount = BigNumber.from('1000000000000000000');

      const res = await convertTokensToFiat({
        amounts: {
          ETH: {
            amount,
            token: ethTokenInfo,
          },
        },
        fiatSymbol: SupportedFiatCurrencies.USD,
      });

      expect(res).toEqual({});
    });

    it('should throw a checkout error if the token isnt supported by immutable', async () => {
      (axios.get as unknown as jest.Mock)
        .mockResolvedValueOnce({
          data: [],
        })
        .mockResolvedValueOnce({
          data: {
            prices: [
              [12345, 1000.0],
              [12344, 500.0],
            ],
          },
        });

      const amount = BigNumber.from('1000000000000000000');

      await expect(
        convertTokensToFiat({
          amounts: {
            WTF: {
              amount,
              token: {
                symbol: 'WTF',
                name: 'wtf',
                icon: '',
                decimals: 18,
                address: 'abc123',
              },
            },
          },
          fiatSymbol: SupportedFiatCurrencies.USD,
        })
      ).rejects.toThrow(
        new CheckoutError(
          'Token is not supported',
          CheckoutErrorType.FIAT_CONVERSION_ERROR
        )
      );
    });

    it('should throw a checkout error if the fiat currency isnt supported by immutable', async () => {
      (axios.get as unknown as jest.Mock)
        .mockResolvedValueOnce({
          data: [],
        })
        .mockResolvedValueOnce({
          data: {
            prices: [
              [12345, 1000.0],
              [12344, 500.0],
            ],
          },
        });

      const amount = BigNumber.from('1000000000000000000');

      await expect(
        convertTokensToFiat({
          amounts: {
            ETH: {
              amount,
              token: ethTokenInfo,
            },
          },
          fiatSymbol: 'EUR' as SupportedFiatCurrencies,
        })
      ).rejects.toThrow(
        new CheckoutError(
          'Fiat currency is not supported',
          CheckoutErrorType.FIAT_CONVERSION_ERROR
        )
      );
    });
  });
});
