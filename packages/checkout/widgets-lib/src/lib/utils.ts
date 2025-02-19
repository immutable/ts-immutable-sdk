import {
  ChainId, CheckoutConfiguration, GetBalanceResult, NetworkInfo, WidgetTheme,
  WrappedBrowserProvider,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { Contract } from 'ethers';
import { getL1ChainId, getL2ChainId } from './networkUtils';
import {
  CHECKOUT_CDN_BASE_URL,
  DEFAULT_GT_ONE_TOKEN_FORMATTING_DECIMALS,
  DEFAULT_TOKEN_FORMATTING_DECIMALS,
  NATIVE,
} from './constants';
import { SignedTransaction } from './primary-sales';

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

  if (a.balance < b.balance) {
    return 1;
  }

  if (a.balance > b.balance) {
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
  if (Number(a.chainId) === getL2ChainId(config)) {
    return -1;
  }
  if (Number(a.chainId) === getL1ChainId(config)) {
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

export function getRemoteVideo(environment: Environment | undefined, path: string) {
  return `${CHECKOUT_CDN_BASE_URL[environment ?? Environment.PRODUCTION]}/v1/blob/video${path}`;
}

export function getRemoteRive(environment: Environment | undefined, path: string) {
  return `${CHECKOUT_CDN_BASE_URL[environment ?? Environment.PRODUCTION]}/v1/blob/rive${path}`;
}

export function getChainImage(environment: Environment | undefined, chainId: ChainId) {
  return getRemoteImage(environment, `/chains/${chainId}.png`);
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

export function compareStr(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export function removeSpace(str: string): string {
  return str.replace(/\s/g, '');
}

export const filterAllowedTransactions = async (
  transactions: SignedTransaction[],
  provider: WrappedBrowserProvider,
): Promise<SignedTransaction[]> => {
  try {
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    const approveTxn = transactions.find((txn) => txn.methodCall.startsWith('approve'));

    if (!approveTxn || !signer || !signerAddress) {
      return transactions;
    }

    const contract = new Contract(
      approveTxn.tokenAddress,
      ['function allowance(address,address) view returns (uint256)'],
      signer,
    );

    const allowance = await signer?.call({
      to: approveTxn.tokenAddress,
      data: contract.interface.encodeFunctionData('allowance', [
        signerAddress,
        approveTxn.params.spender,
      ]),
    });

    const currentAmount = BigInt(allowance);
    const desiredAmount = approveTxn.params.amount ? BigInt(approveTxn.params.amount) : BigInt(0);

    const isAllowed = currentAmount >= BigInt('0') && currentAmount >= desiredAmount;

    if (isAllowed) {
      return transactions.filter((txn) => txn.methodCall !== approveTxn.methodCall);
    }
  } catch {
    /* Ignoring errors, as we don't need block wallet from
     * sending the approve when it's not possible to check the allowance
     */
  }

  return transactions;
};

export const hexToText = (value: string): string => {
  if (!value) return '';
  let hex = value.trim().toLowerCase();

  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }

  if (!/^[0-9a-f]+$/i.test(hex)) {
    throw new Error('Invalid hexadecimal input');
  }

  let text = '';
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.substr(i, 2), 16);
    text += String.fromCharCode(byte);
  }

  return text;
};
