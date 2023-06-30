import {
  AllowedNetworkConfig,
  ChainId,
  DexConfig,
  GasEstimateTokenConfig,
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
  cryptoFiatOverrides?: {
    coins?: any[],
    conversion?: any[],
  },
}) => {
  const checkoutApi = 'https://checkout-api.dev.immutable.com/v1';
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
        rpcURL: 'https://zkevm-rpc.dev.x.immutable.com/',
        commonRoutingTokens: [
          {
            chainId: 11155111,
            address: '0x741185AEFC3E539c1F42c1d6eeE8bFf1c89D70FE',
            decimals: 18,
            symbol: 'FUN',
          },
        ],
        exchangeContracts: {
          multicall: '0x8AC26EfCbf5D700b37A27aA00E6934e6904e7B8e',
        },
        nativeToken: {
          chainId: ChainId.IMTBL_ZKEVM_DEVNET,
          address: '',
          decimals: 18,
        },
      },
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
  cy.intercept(
    `${checkoutApi}/fiat/coins/*`,
    overrides?.cryptoFiatOverrides?.coins || [],
  );
  cy.intercept(
    `${checkoutApi}/fiat/conversion*`,
    overrides?.cryptoFiatOverrides?.conversion || [],
  );
  cy.intercept(`${checkoutApi}/rpc/eth-sepolia`, {});
  cy.intercept('https://zkevm-rpc.dev.x.immutable.com/', {});
};
