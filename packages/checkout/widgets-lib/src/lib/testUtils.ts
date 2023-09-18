import {
  AllowedNetworkConfig,
  ChainId,
  DexConfig,
  GasEstimateTokenConfig,
  TokenInfo,
} from '@imtbl/checkout-sdk';
import { cy } from 'local-cypress';

export const cyGetByTestId = (
  testId: string,
  options?: {
    domElement?: string;
  },
) => cy.get(
  `${options?.domElement ? options.domElement : ''}[data-testid="${testId}"]`,
);

export const cySmartGet = (selector: string) => (selector.includes('@') || selector.includes(' ')
  ? cy.get(selector)
  : cyGetByTestId(selector));

export const cyIntercept = (overrides?: {
  configOverrides?: {
    allowedNetworks?: AllowedNetworkConfig[],
    gasEstimateTokens?: GasEstimateTokenConfig | undefined,
    dex?: DexConfig,
  },
  tokenConfigOverrides?: Record<string, { allowed: TokenInfo[] }>,
  cryptoFiatOverrides?: {
    coins?: any[],
    overrides?: Record<string, string>,
    conversion?: Record<string, Record<string, number>>,
  },
}) => {
  const checkoutApi = 'https://checkout-api.sandbox.immutable.com/v1';
  const imtblZkEvmRpcUrl = 'https://rpc.testnet.immutable.com';
  const defaultConfig = {
    allowedNetworks: [
      {
        chainId: ChainId.SEPOLIA,
      },
      {
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      },
    ],
    gasEstimateTokens: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      [ChainId.SEPOLIA]: {
        bridgeToL2Addresses: {
          gasTokenAddress: 'NATIVE',
          fromAddress: '0xd1da7e9b2Ce1a4024DaD52b3D37F4c5c91a525C1',
        },
        swapAddresses: {
          inAddress: '0x741185AEFC3E539c1F42c1d6eeE8bFf1c89D70FE',
          outAddress: '0xaC953a0d7B67Fae17c87abf79f09D0f818AC66A2',
        },
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      [ChainId.IMTBL_ZKEVM_TESTNET]: {
        swapAddresses: {
          inAddress: '0xFEa9FF93DC0C6DC73F8Be009Fe7a22Bb9dcE8A2d',
          outAddress: '0x8AC26EfCbf5D700b37A27aA00E6934e6904e7B8e',
        },
      },
    },
    dex: {
      overrides: {
        rpcURL: imtblZkEvmRpcUrl,
        commonRoutingTokens: [
          {
            chainId: ChainId.SEPOLIA,
            address: '0x741185AEFC3E539c1F42c1d6eeE8bFf1c89D70FE',
            decimals: 18,
            symbol: 'FUN',
          },
        ],
        exchangeContracts: {
          multicall: '0x8AC26EfCbf5D700b37A27aA00E6934e6904e7B8e',
        },
        nativeToken: {
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          address: '',
          decimals: 18,
        },
      },
    },
    onramp: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      201811419111: {
        tokens: [
          {
            address: 0x0000000000000000000000000000000000001010,
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
          {
            address: '0x65AA7a21B0f3ce9B478aAC3408fE75b423939b1F',
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
        ],
        fees: {
          minPercentage: '3.5',
          maxPercentage: '5.5',
        },
      },
    },
  };
  const defaultTokensConfig = {
    [ChainId.IMTBL_ZKEVM_TESTNET]: {
      allowed: [
        {
          name: 'Immutable Token',
          symbol: 'IMX',
          decimals: 18,
        },
        {
          address: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
          decimals: 18,
          symbol: 'zkONE',
          name: 'Monolithic Token',
        },
        {
          address: '0xaC953a0d7B67Fae17c87abf79f09D0f818AC66A2',
          decimals: 18,
          symbol: 'zkTKN',
          name: 'Zero Knowledge Token',
        },
      ],
    },
    [ChainId.SEPOLIA]: {
      allowed: [
        {
          name: 'Sepolia Eth',
          symbol: 'ETH',
          decimals: 18,
        },
        {
          name: 'Immutable Test Token',
          address: '0x5b26a75eE4a4B68a8fe8f94E4b729Ff1b8a31051',
          symbol: 'tIMX',
          decimals: 18,
        },
      ],
    },
  };

  cy.intercept(
    `${checkoutApi}/config`,
    {
      ...defaultConfig,
      ...overrides?.configOverrides?.allowedNetworks && {
        allowedNetworks: overrides.configOverrides.allowedNetworks,
      },
      ...overrides?.configOverrides?.gasEstimateTokens && {
        gasEstimateTokens: overrides.configOverrides.gasEstimateTokens,
      },
      ...overrides?.configOverrides?.dex && {
        dex: overrides.configOverrides.dex,
      },
    },
  );
  cy.intercept(`${checkoutApi}/config/tokens`, {
    ...defaultTokensConfig,
    ...overrides?.tokenConfigOverrides && overrides.tokenConfigOverrides,
  });
  cy.intercept('https://cdn.segment.com/v1/projects/b69BcXnFXdaiFC6MqRQiHvjcPrTxftZl/settings', {
    writeKey: 'segment-mock-write-key',
  });
  cy.intercept('https://cdn.segment.com/v1/projects//settings', {
    writeKey: 'segment-mock-write-key',
  });
  cy.intercept(
    `${checkoutApi}/fiat/coins/all*`,
    overrides?.cryptoFiatOverrides?.coins || [
      { id: 'eth', symbol: 'eth', name: 'ethereum' },
      { id: 'imx', symbol: 'imx', name: 'immutable-x' },
      { id: 'usdc', symbol: 'usdc', name: 'usd-coin' },
    ],
  );
  cy.intercept(
    `${checkoutApi}/fiat/coins/overrides*`,
    overrides?.cryptoFiatOverrides?.overrides || {
      eth: 'ethereum',
      imx: 'immutable-x',
      usdc: 'usd-coin',
    },
  );
  cy.intercept(
    `${checkoutApi}/fiat/conversion*`,
    overrides?.cryptoFiatOverrides?.conversion || {
      ethereum: { usd: 2000.0 },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'usd-coin': { usd: 1.0 },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'immutable-x': { usd: 1.5 },
    },
  );
  cy.intercept(`${checkoutApi}/rpc/eth-sepolia`, {});
  cy.intercept(imtblZkEvmRpcUrl, {});
  cy.intercept('https://image-resizer-cache.dev.immutable.com/*', {});

  cy.wait(10); // This delay ensures the intercepts are set before the test runs
};
