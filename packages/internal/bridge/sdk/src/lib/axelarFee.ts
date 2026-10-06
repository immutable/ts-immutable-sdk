import axios from 'axios';
import { FeeData } from 'ethers';
import { BridgeError, BridgeErrorType } from '../errors';
import { AxelarChainDetails, BridgeFeeSource } from '../types';
import { getGasPriceInWei } from './gas';

/**
 * Request timeout for the Axelar GMP fee API. A blocked request (e.g. a CORS failure) fails fast,
 * but a stalled one would otherwise hold the fee estimate until the browser gives up.
 */
export const AXELAR_FEE_API_TIMEOUT_MS = 5000;

/**
 * Request timeout for the price API used by the fallback estimate.
 */
export const PRICE_API_TIMEOUT_MS = 5000;

/**
 * Minimum destination gas price used when estimating the Axelar fee, matching the `minGasPrice`
 * sent to the Axelar API.
 */
export const AXELAR_MIN_GAS_PRICE = BigInt(1000000000); // 1 gwei

/**
 * Destination-chain gas covered by Axelar's base fee, on top of the execution gas limit.
 * The base fee pays relayers to approve the message on the destination gateway and scales with the
 * destination gas price: Ethereum-bound quotes taken on 2026-10-07 at 1.21 gwei and 0.93 gwei both
 * imply ~185k gas. The constant carries headroom above that.
 */
export const FALLBACK_BASE_FEE_DESTINATION_GAS = BigInt(250000);

/**
 * Fixed part of Axelar's base fee (confirmation on the Axelar network), in USD cents.
 * Observed at ~1.3 cents in both directions on 2026-10-07; the constant carries headroom above that.
 */
export const FALLBACK_BASE_FEE_USD_CENTS = BigInt(5);

/**
 * Minimum multiplier applied to destination gas in the fallback estimate. A numeric `gasMultiplier` from
 * the caller applies when larger. Axelar's own multiplier was 1.15-1.32 on 2026-10-07. A larger buffer is
 * used because the fallback cannot see Axelar's pricing, and Axelar refunds unused gas to the sender after
 * execution, while an underpaid message waits for a gas top-up.
 */
export const FALLBACK_GAS_MULTIPLIER = 2;

/**
 * CoinGecko ids, as served by the checkout price API, for the native token symbols in `axelarChains`.
 */
export const coingeckoIds: Record<string, string> = {
  ETH: 'ethereum',
  IMX: 'immutable-x',
};

const LOG_PREFIX = '[imtbl-bridge]';

// Prices are carried as integers scaled by 1e8, and multipliers scaled by 100, so the fee arithmetic
// stays in bigint.
const PRICE_SCALE = 1e8;
const MULTIPLIER_SCALE = 100;
const WEI_PER_TOKEN = BigInt(10) ** BigInt(18);

export type AxelarFeeEstimate = {
  fee: bigint;
  source: BridgeFeeSource;
};

export type AxelarFeeParams = {
  axelarAPIEndpoint: string;
  priceAPIEndpoint: string;
  sourceAxelar: AxelarChainDetails;
  destinationAxelar: AxelarChainDetails;
  destinationChainGasLimit: number;
  gasMultiplier: number | string;
  getDestinationFeeData: () => Promise<FeeData>;
};

/**
 * Error raised when the Axelar API could not be reached or did not answer: no response (including a
 * CORS rejection), a timeout, HTTP 403 (Cloudflare challenge), HTTP 429 or HTTP 5xx. These fall back to
 * the local estimate. `reason` is a short description for logs.
 */
class AxelarFeeAPIError extends Error {
  public readonly reason: string;

  constructor(reason: string) {
    super(reason);
    this.reason = reason;
  }
}

const isUnavailableStatus = (status: number) => status === 403 || status === 429 || status >= 500;

const axelarRejection = (reason: string) => new BridgeError(
  `Estimating Axelar Gas failed with the reason: ${reason}`,
  BridgeErrorType.AXELAR_GAS_ESTIMATE_FAILED,
);

/**
 * Queries the Axelar GMP API for the fee to pay on the source chain, in the source chain's native token.
 * Throws `AxelarFeeAPIError` when the API is unavailable, and a `BridgeError` of type
 * AXELAR_GAS_ESTIMATE_FAILED when the API answers with an error or an unparseable fee.
 */
export async function fetchAxelarFee(params: AxelarFeeParams): Promise<bigint> {
  const estimateGasReq = {
    method: 'estimateGasFee',
    sourceChain: params.sourceAxelar.id,
    destinationChain: params.destinationAxelar.id,
    symbol: params.sourceAxelar.symbol,
    gasLimit: params.destinationChainGasLimit,
    gasMultiplier: params.gasMultiplier,
    minGasPrice: Number(AXELAR_MIN_GAS_PRICE),
  };

  let data: any;
  try {
    const response = await axios.post(params.axelarAPIEndpoint, estimateGasReq, {
      timeout: AXELAR_FEE_API_TIMEOUT_MS,
    });
    data = response.data;
  } catch (err: any) {
    const status: number | undefined = err?.response?.status;
    if (err?.code === 'ECONNABORTED' || err?.code === 'ETIMEDOUT') {
      throw new AxelarFeeAPIError('timeout');
    }
    if (!status) {
      // A browser reports a CORS rejection as a network error with no response.
      throw new AxelarFeeAPIError(`network error, possibly CORS (${err?.message ?? 'unknown'})`);
    }
    if (isUnavailableStatus(status)) {
      throw new AxelarFeeAPIError(`HTTP ${status}`);
    }
    throw axelarRejection(err.response.data?.error ? err.response.data.message : `HTTP ${status}`);
  }

  if (data?.error) {
    throw axelarRejection(data.message);
  }

  // A successful response body is the fee as a bare integer string.
  if (!/^\d+$/.test(`${data}`.trim())) {
    throw axelarRejection(`unexpected response body ${JSON.stringify(data)?.slice(0, 100)}`);
  }
  return BigInt(`${data}`.trim());
}

const toScaledPrice = (value: unknown, symbol: string): bigint => {
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`no USD price for ${symbol}`);
  }
  return BigInt(Math.round(price * PRICE_SCALE));
};

/**
 * Fetches USD prices for the source and destination native tokens from the checkout price API.
 * The request carries no custom headers, so the browser sends it without a CORS preflight.
 */
export async function fetchUSDPrices(
  priceAPIEndpoint: string,
  sourceSymbol: string,
  destinationSymbol: string,
): Promise<{ sourcePrice: bigint, destinationPrice: bigint }> {
  const sourceId = coingeckoIds[sourceSymbol];
  const destinationId = coingeckoIds[destinationSymbol];
  if (!sourceId || !destinationId) {
    throw new Error(`no price id for ${sourceId ? destinationSymbol : sourceSymbol}`);
  }

  const response = await axios.get(
    `${priceAPIEndpoint}/v1/fiat/conversion?ids=${sourceId},${destinationId}&currencies=usd`,
    { timeout: PRICE_API_TIMEOUT_MS },
  );

  return {
    sourcePrice: toScaledPrice(response.data?.[sourceId]?.usd, sourceSymbol),
    destinationPrice: toScaledPrice(response.data?.[destinationId]?.usd, destinationSymbol),
  };
}

/**
 * Returns the fallback multiplier scaled by MULTIPLIER_SCALE: the caller's numeric `gasMultiplier` when it
 * exceeds FALLBACK_GAS_MULTIPLIER, otherwise FALLBACK_GAS_MULTIPLIER. 'auto' resolves to the minimum.
 */
const resolveFallbackMultiplier = (gasMultiplier: number | string): bigint => {
  const requested = Number(gasMultiplier);
  const multiplier = Number.isFinite(requested) && requested > FALLBACK_GAS_MULTIPLIER
    ? requested
    : FALLBACK_GAS_MULTIPLIER;
  return BigInt(Math.ceil(multiplier * MULTIPLIER_SCALE));
};

/**
 * Estimates the Axelar fee without the Axelar API, in the source chain's native token (wei).
 *
 *   multiplier      = max(numeric gasMultiplier, 2)
 *   destination gas = (execution gas limit + base fee gas) × max(destination gas price, 1 gwei) × multiplier
 *   fee             = destination gas converted to the source token at USD prices + fixed base fee in USD
 *
 * Both native tokens (ETH, IMX) have 18 decimals, so the conversion is a ratio of USD prices.
 */
export async function estimateFallbackAxelarFee(params: AxelarFeeParams): Promise<bigint> {
  const [feeData, { sourcePrice, destinationPrice }] = await Promise.all([
    params.getDestinationFeeData(),
    fetchUSDPrices(params.priceAPIEndpoint, params.sourceAxelar.symbol, params.destinationAxelar.symbol),
  ]);

  const reportedGasPrice = getGasPriceInWei(feeData);
  if (reportedGasPrice === null) {
    throw new Error('destination chain returned no gas price');
  }
  const gasPrice = reportedGasPrice > AXELAR_MIN_GAS_PRICE ? reportedGasPrice : AXELAR_MIN_GAS_PRICE;

  const destinationGas = BigInt(params.destinationChainGasLimit) + FALLBACK_BASE_FEE_DESTINATION_GAS;
  const destinationCost = (destinationGas * gasPrice * resolveFallbackMultiplier(params.gasMultiplier))
    / BigInt(MULTIPLIER_SCALE);
  const destinationCostInSource = (destinationCost * destinationPrice) / sourcePrice;

  // cents × 1e18 × PRICE_SCALE / (100 × scaled price) = wei of the source token
  const fixedBaseFeeInSource = (FALLBACK_BASE_FEE_USD_CENTS * WEI_PER_TOKEN * BigInt(PRICE_SCALE))
    / (BigInt(100) * sourcePrice);

  return destinationCostInSource + fixedBaseFeeInSource;
}

/**
 * Returns the Axelar fee from the Axelar API, or from `estimateFallbackAxelarFee` when the API is
 * unavailable (see `AxelarFeeAPIError`). An error answer from the API is thrown as
 * AXELAR_GAS_ESTIMATE_FAILED without falling back.
 * The API is tried on every call, so estimates return to the Axelar API as soon as it responds again.
 * Each fallback logs a console warning prefixed with `[imtbl-bridge]`.
 */
export async function getAxelarFeeWithFallback(params: AxelarFeeParams): Promise<AxelarFeeEstimate> {
  let reason: string;
  try {
    return { fee: await fetchAxelarFee(params), source: 'axelar' };
  } catch (err: any) {
    if (!(err instanceof AxelarFeeAPIError)) throw err;
    reason = err.reason;
  }

  let fee: bigint;
  try {
    fee = await estimateFallbackAxelarFee(params);
  } catch (err: any) {
    throw new BridgeError(
      `Estimating Axelar Gas failed. Axelar API: ${reason}. Fallback estimate: ${err?.message ?? err}`,
      BridgeErrorType.AXELAR_GAS_ESTIMATE_FAILED,
    );
  }

  // eslint-disable-next-line no-console
  console.warn(`${LOG_PREFIX} Axelar fee API unavailable, using fallback estimate`, {
    reason,
    sourceChain: params.sourceAxelar.id,
    destinationChain: params.destinationAxelar.id,
    destinationChainGasLimit: params.destinationChainGasLimit,
    fee: fee.toString(),
  });

  return { fee, source: 'fallback' };
}
