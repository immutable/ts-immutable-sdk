import {
  ChainId, CheckoutConfiguration, GetBalanceResult, NetworkInfo, WidgetTheme,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { getL1ChainId, getL2ChainId } from './networkUtils';
import {
  CHECKOUT_CDN_BASE_URL,
  DEFAULT_GT_ONE_TOKEN_FORMATTING_DECIMALS,
  DEFAULT_TOKEN_FORMATTING_DECIMALS,
  NATIVE,
} from './constants';

export const tokenSymbolNameOverrides = {
  timx: 'imx',
};

export const sortTokensByAmount = (
  config: CheckoutConfiguration,
  tokens: GetBalanceResult[],
  chainId: ChainId,
) => tokens.sort((a, b) => {
  // make sure IMX is at the top of the list
  if (
    chainId === getL2ChainId(config)
    && a.token.symbol.toLowerCase() === 'imx'
    && b.token.symbol.toLowerCase() !== 'imx'
  ) {
    return -1;
  }

  if (
    chainId === getL2ChainId(config)
    && b.token.symbol.toLowerCase() === 'imx'
    && a.token.symbol.toLowerCase() !== 'imx'
  ) {
    return 1;
  }

  if (a.balance.lt(b.balance)) {
    return 1;
  }

  if (a.balance.gt(b.balance)) {
    return -1;
  }

  return 0;
});

export const sortNetworksCompareFn = (
  a: NetworkInfo,
  b: NetworkInfo,
  config: CheckoutConfiguration,
) => {
  // make sure zkEVM at start of the list then L1
  if (a.chainId === getL2ChainId(config)) {
    return -1;
  }
  if (a.chainId === getL1ChainId(config)) {
    return 0;
  }
  return 1;
};

export const formatFiatString = (amount: number, decimals: number = 2): string => {
  const factor = 10 ** decimals;
  return (Math.round(amount * factor) / factor).toFixed(decimals);
};

export const calculateCryptoToFiat = (
  amount: string,
  symbol: string,
  conversions: Map<string, number>,
  zeroString: string = '0.00',
  maxDecimals: number = 2,
): string => {
  if (!amount) return zeroString;

  const name = tokenSymbolNameOverrides[symbol.toLowerCase()] || symbol.toLowerCase();
  const conversion = conversions.get(name);
  if (!conversion) return zeroString;

  const parsedAmount = parseFloat(amount);
  console.log('🚀 ~ amount:', amount, parsedAmount, parsedAmount * conversion);
  if (parseFloat(amount) === 0 || Number.isNaN(parsedAmount)) return zeroString;
  return formatFiatString(parsedAmount * conversion, maxDecimals);
};

export const formatZeroAmount = (
  amount: string,
  allowZeros: boolean = false,
) => {
  const fallback = '-.--';
  if (!amount) return fallback;
  if (amount === '0.00' && !allowZeros) return fallback;
  return amount;
};

const tokenValueFormatDecimals = (s: string, numDecimals: number): string => {
  const pointIndex = s.indexOf('.');
  return parseFloat(s.substring(0, pointIndex + numDecimals + 1)).toFixed(numDecimals);
};

export const tokenValueFormat = (
  s: Number | string,
  maxDecimals: number = DEFAULT_TOKEN_FORMATTING_DECIMALS,
): string => {
  const asString = s.toString();

  // Only float numbers will be handled by this function
  const pointIndex = asString.indexOf('.');
  if (pointIndex === -1) return asString;

  // If the first decimal is zero, this can happen if:
  // 1. The number provided starts with "." (e.g. ".012")
  // 2. The number starts with 0 (e.g. "0.234")
  if (asString[0] === '.' || parseInt(asString[0], 10) === 0) {
    let formattedDecimals = Math.min(maxDecimals, DEFAULT_TOKEN_FORMATTING_DECIMALS);
    let formattedValue = tokenValueFormatDecimals(asString, formattedDecimals);
    if (parseFloat(formattedValue) === 0) {
      // Ensure we return a value greater than 0
      while ((formattedValue[formattedValue.length - 1] || '') === '0' && formattedDecimals < maxDecimals) {
        formattedDecimals += 1;
        formattedValue = tokenValueFormatDecimals(asString, formattedDecimals);
        if ((formattedValue[formattedValue.length - 1] || '') !== '0') {
          break;
        }
      }
    }
    return formattedValue;
  }

  // In case the number is greater than 1 then the formatting will look slightly different.
  // "12312.1231" => "12312.12"
  let formatted = tokenValueFormatDecimals(asString, DEFAULT_GT_ONE_TOKEN_FORMATTING_DECIMALS);

  // Truncate the .00 if the number is greater than 1
  if (formatted.endsWith('.00')) formatted = tokenValueFormatDecimals(formatted, 0);

  return formatted;
};

export const isZkEvmChainId = (chainId: ChainId) => chainId === ChainId.IMTBL_ZKEVM_DEVNET
  || chainId === ChainId.IMTBL_ZKEVM_TESTNET
  || chainId === ChainId.IMTBL_ZKEVM_MAINNET;

export const isL1EthChainId = (chainId: ChainId) => chainId === ChainId.SEPOLIA
  || chainId === ChainId.ETHEREUM;

export const isNativeToken = (
  address: string | undefined,
): boolean => !address || address.toLocaleLowerCase() === NATIVE;

export function getRemoteImage(environment: Environment | undefined, path: string) {
  return `${CHECKOUT_CDN_BASE_URL[environment ?? Environment.PRODUCTION]}/v1/blob/img${path}`;
}

export function getEthTokenImage(environment: Environment | undefined) {
  return getRemoteImage(environment, '/tokens/eth.svg');
}

export function getImxTokenImage(environment: Environment | undefined) {
  return getRemoteImage(environment, '/tokens/imx.svg');
}

export function getTokenImageByAddress(environment: Environment | undefined, address: string) {
  return getRemoteImage(environment, `/tokens/${address.toLowerCase()}.svg`);
}

export function getDefaultTokenImage(
  environment: Environment | undefined,
  theme: WidgetTheme,
) {
  return theme === WidgetTheme.LIGHT
    ? getRemoteImage(environment, '/tokens/defaultonlight.svg')
    : getRemoteImage(environment, '/tokens/defaultondark.svg');
}

export function abbreviateWalletAddress(address: string, separator = '.....', firstChars = 5, lastChars = 4): string {
  // first 5 characters, ellipses, and the last 4 characters
  // e.g. 0x1234567890abcdef => 0x123.....cdef
  const firstPart = address.slice(0, firstChars);
  const lastPart = address.slice(-lastChars);
  return `${firstPart}${separator}${lastPart}`;
}
