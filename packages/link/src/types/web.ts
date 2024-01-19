/* eslint-disable operator-linebreak */
/* eslint-disable @typescript-eslint/naming-convention */
import * as t from 'io-ts';
import { NonEmptyString } from 'io-ts-types';

import {
  ERC20TokenTypeT,
  ERC721TokenTypeT,
  EthAddress,
  ETHTokenTypeT,
  FeeCodec,
  HexadecimalString,
  PositiveIntegerStringC,
  PositiveNumberStringC,
} from './runtime';

const FlatETHTokenCodec = t.interface({
  type: ETHTokenTypeT,
});

const FlatETHTokenWithAmountCodec = t.intersection([
  FlatETHTokenCodec,
  t.interface({ amount: PositiveNumberStringC }),
]);

export type FlatETHToken = t.TypeOf<typeof FlatETHTokenCodec>;

const FlatERC721TokenCodec = t.interface({
  type: ERC721TokenTypeT,
  tokenId: t.string,
  tokenAddress: EthAddress,
});

export type FlatERC721Token = t.TypeOf<typeof FlatERC721TokenCodec>;

const FlatERC20TokenCodec = t.interface({
  type: ERC20TokenTypeT,
  tokenAddress: EthAddress,
  symbol: t.string,
});

export type FlatERC20Token = t.TypeOf<typeof FlatERC20TokenCodec>;

const FlatERC20TokenWithAmountCodec = t.intersection([
  FlatERC20TokenCodec,
  t.interface({ amount: PositiveNumberStringC }),
]);

export const FlatTokenCodec = t.union([
  FlatETHTokenCodec,
  FlatERC721TokenCodec,
  FlatERC20TokenCodec,
]);
export type FlatToken = t.TypeOf<typeof FlatTokenCodec>;
export type FlatTokenTS = t.OutputOf<typeof FlatTokenCodec>;

export const FlatTokenWithAmountCodec = t.union([
  FlatETHTokenWithAmountCodec,
  FlatERC721TokenCodec,
  FlatERC20TokenWithAmountCodec,
]);
export type FlatTokenWithAmount = t.TypeOf<typeof FlatTokenWithAmountCodec>;
export type FlatTokenWithAmountTS = t.OutputOf<typeof FlatTokenWithAmountCodec>;

const TransferParamsCodec = t.intersection([
  FlatTokenWithAmountCodec,
  t.interface({
    to: EthAddress,
  }),
]);

export const FlatTokenWithAmountAndToAddressCodec = t.intersection([
  FlatTokenWithAmountCodec,
  t.type({
    toAddress: EthAddress,
  }),
]);
export type FlatTokenWithAmountAndToAddress = t.TypeOf<
  typeof FlatTokenWithAmountAndToAddressCodec
>;
export type FlatTokenWithAmountAndToAddressTS = t.OutputOf<
  typeof FlatTokenWithAmountAndToAddressCodec
>;

const TransferV2ParamsCodec = t.array(FlatTokenWithAmountAndToAddressCodec);
export type TransferV2ParamsCodecTS = t.OutputOf<typeof TransferV2ParamsCodec>;

const BuyParamsCodec = t.interface({
  orderId: PositiveNumberStringC,
});

const BuyV2ParamsCodec = t.intersection([
  t.type({
    orderIds: t.array(PositiveNumberStringC),
  }),
  t.partial({
    /**
     * List of taker fees applied to the trades.
     *
     * Link.buildUrl() needs to be updated if this field changes.
     */
    fees: t.array(FeeCodec),
  }),
]);

const MakeOfferParamsCodec = t.intersection([
  t.type({
    tokenId: t.string,
    tokenAddress: EthAddress,
    amount: PositiveNumberStringC,
  }),
  t.partial({
    currencyAddress: EthAddress,
    expirationTimestamp: PositiveIntegerStringC,
    fees: t.array(FeeCodec),
  }),
]);

const CancelOfferParamsCodec = t.type({
  orderId: PositiveNumberStringC,
});

const AcceptOfferParamsCodec = t.intersection([
  t.type({
    orderId: PositiveNumberStringC,
  }),
  t.partial({
    /**
     * List of taker fees applied to the trades.
     *
     * Link.buildUrl() needs to be updated if this field changes.
     */
    fees: t.array(FeeCodec),
  }),
]);

const SellParamsCodec = t.intersection([
  t.type({
    tokenId: t.string,
    tokenAddress: EthAddress,
  }),
  t.partial({
    amount: PositiveNumberStringC,
    currencyAddress: EthAddress,
    expirationTimestamp: PositiveIntegerStringC,

    /**
     * List of maker fees applied to the order.
     *
     * Link.buildUrl() needs to be updated if this field changes.
     */
    fees: t.array(FeeCodec),
  }),
]);

const CancelParamsCodec = t.intersection([
  t.type({
    orderId: PositiveNumberStringC,
  }),
  t.partial({
    /**
     * Supplied so the cancel amount can match the price listed in the marketplace.
     *
     * Link.buildUrl() needs to be updated if this field changes.
     */
    fees: t.array(FeeCodec),
  }),
]);

export enum BaseExchangeCurrency {
  USD = 'usd',
}

const OnrampParamsCodec = t.partial({
  cryptoCurrencies: t.array(t.string),
  provider: t.string,
});

const OfframpParamsCodec = t.partial({
  cryptoCurrencies: t.array(t.string),
  amount: PositiveNumberStringC,
  provider: t.string,
});

/**
 * @deprecated
 * Exchange API v3 uses on 'Onramp' instead of 'FiatToCrypto'
 */
const FiatToCryptoParamsCodec = t.partial({
  cryptoCurrencies: t.array(t.string),
});

/**
 * @deprecated
 * Exchange API v3 uses on 'Offramp' instead of 'CryptoToFiat'
 */
const CryptoToFiatParamsCodec = t.partial({
  cryptoCurrencies: t.array(t.string),
  amount: PositiveNumberStringC,
});

const NFTCheckoutPrimaryParamsCodec = t.type({
  contractAddress: EthAddress,
  offerId: t.string,
  provider: t.string,
});

const NFTCheckoutSecondaryParamsCodec = t.type({
  provider: t.string,
  orderId: t.string,
  userWalletAddress: EthAddress,
});

export enum ProviderPreference {
  GAMESTOP = 'gamestop',
  METAMASK = 'metamask',
  MAGIC_LINK = 'magic_link',
  NONE = 'none',

  // Game Wallet Providers
  // When adding a Game wallet provider make sure to add it to isGameWalletProvider
  // and the SetupParamsCodec below
  CROSS_THE_AGES = 'cross_the_ages',
  KYO = 'kyo',
  NEW_GANYMEDE = 'new_ganymede',
}

export function isGameWalletProvider(providerPreference: ProviderPreference) {
  // example return providerPreference === ProviderPreference.GameOption
  return (
    providerPreference === ProviderPreference.CROSS_THE_AGES ||
    providerPreference === ProviderPreference.KYO ||
    providerPreference === ProviderPreference.NEW_GANYMEDE
  );
}

const SetupParamsCodec = t.partial({
  providerPreference: t.union([
    t.literal(ProviderPreference.METAMASK),
    t.literal(ProviderPreference.MAGIC_LINK),
    t.literal(ProviderPreference.GAMESTOP),
    t.literal(ProviderPreference.NONE),
    t.literal(ProviderPreference.CROSS_THE_AGES),
    t.literal(ProviderPreference.KYO),
    t.literal(ProviderPreference.NEW_GANYMEDE),
  ]),
});

export const FlexibleDepositCodec = t.union([
  t.union([FlatETHTokenCodec, FlatERC20TokenCodec]),
  t.interface({ amount: PositiveNumberStringC }),
  t.undefined,
]);

const SignParamsCodec = t.type({
  message: NonEmptyString,
  description: NonEmptyString,
});

export namespace LinkParamsCodecs {
  export const Setup = SetupParamsCodec;
  export const History = t.interface({});
  export const Buy = BuyParamsCodec;
  export const BuyV2 = BuyV2ParamsCodec;
  export const CompleteWithdrawal = FlatTokenCodec;
  export const Deposit = FlatTokenWithAmountCodec;
  export const FlexibleDeposit = t.union([Deposit, FlexibleDepositCodec]);
  export const PrepareWithdrawal = FlatTokenWithAmountCodec;
  export const Sell = SellParamsCodec;
  export const Transfer = TransferParamsCodec;
  export const TransferV2 = TransferV2ParamsCodec;
  export const BatchNftTransfer = TransferV2ParamsCodec;
  export const Cancel = CancelParamsCodec;
  export const Claim = t.interface({});
  export const Onramp = OnrampParamsCodec;
  export const Offramp = OfframpParamsCodec;
  /**
   * @deprecated
   * Exchange API v3 uses on 'Onramp' instead of 'FiatToCrypto'
   */
  export const FiatToCrypto = FiatToCryptoParamsCodec;
  /**
   * @deprecated
   * Exchange API v3 uses on 'Offramp' instead of 'CryptoToFiat'
   */
  export const CryptoToFiat = CryptoToFiatParamsCodec;
  export const NFTCheckoutPrimary = NFTCheckoutPrimaryParamsCodec;
  export const NFTCheckoutSecondary = NFTCheckoutSecondaryParamsCodec;
  export const Sign = SignParamsCodec;
  export const GetPublicKey = t.interface({});
  export const MakeOffer = MakeOfferParamsCodec;
  export const CancelOffer = CancelOfferParamsCodec;
  export const AcceptOffer = AcceptOfferParamsCodec;
}

export namespace LinkParamsF {
  export type Setup = t.TypeOf<typeof LinkParamsCodecs.Setup>;
  export type History = t.TypeOf<typeof LinkParamsCodecs.History>;
  export type Buy = t.TypeOf<typeof LinkParamsCodecs.Buy>;
  export type BuyV2 = t.TypeOf<typeof LinkParamsCodecs.BuyV2>;
  export type CompleteWithdrawal = t.TypeOf<
    typeof LinkParamsCodecs.CompleteWithdrawal
  >;
  export type Deposit = t.TypeOf<typeof LinkParamsCodecs.Deposit>;
  export type FlexibleDeposit = t.TypeOf<
    typeof LinkParamsCodecs.FlexibleDeposit
  >;
  export type PrepareWithdrawal = t.TypeOf<
    typeof LinkParamsCodecs.PrepareWithdrawal
  >;
  export type Sell = t.TypeOf<typeof LinkParamsCodecs.Sell>;
  export type Transfer = t.TypeOf<typeof LinkParamsCodecs.Transfer>;
  export type TransferV2 = t.TypeOf<typeof LinkParamsCodecs.TransferV2>;
  export type Cancel = t.TypeOf<typeof LinkParamsCodecs.Cancel>;
  export type Claim = t.TypeOf<typeof LinkParamsCodecs.Claim>;
  export type FiatToCrypto = t.TypeOf<typeof LinkParamsCodecs.FiatToCrypto>;
  export type CryptoToFiat = t.TypeOf<typeof LinkParamsCodecs.CryptoToFiat>;
  export type MakeOffer = t.TypeOf<typeof LinkParamsCodecs.MakeOffer>;
  export type CancelOffer = t.TypeOf<typeof LinkParamsCodecs.CancelOffer>;
  export type AcceptOffer = t.TypeOf<typeof LinkParamsCodecs.AcceptOffer>;
}

export namespace LinkParams {
  export type Setup = t.OutputOf<typeof LinkParamsCodecs.Setup>;
  export type History = t.OutputOf<typeof LinkParamsCodecs.History>;
  export type Buy = t.OutputOf<typeof LinkParamsCodecs.Buy>;
  export type BuyV2 = t.OutputOf<typeof LinkParamsCodecs.BuyV2>;
  export type CompleteWithdrawal = t.OutputOf<
    typeof LinkParamsCodecs.CompleteWithdrawal
  >;
  export type Deposit = t.OutputOf<typeof LinkParamsCodecs.Deposit>;
  export type FlexibleDeposit = t.OutputOf<
    typeof LinkParamsCodecs.FlexibleDeposit
  >;
  export type PrepareWithdrawal = t.OutputOf<
    typeof LinkParamsCodecs.PrepareWithdrawal
  >;
  export type Sell = t.OutputOf<typeof LinkParamsCodecs.Sell>;
  export type Transfer = t.OutputOf<typeof LinkParamsCodecs.Transfer>;
  export type TransferV2 = t.OutputOf<typeof LinkParamsCodecs.TransferV2>;
  export type BatchNftTransfer = t.OutputOf<
    typeof LinkParamsCodecs.BatchNftTransfer
  >;
  export type Cancel = t.OutputOf<typeof LinkParamsCodecs.Cancel>;
  export type Claim = t.OutputOf<typeof LinkParamsCodecs.Claim>;
  export type Onramp = t.OutputOf<typeof LinkParamsCodecs.Onramp>;
  export type Offramp = t.OutputOf<typeof LinkParamsCodecs.Offramp>;
  /**
   * @deprecated
   * Exchange API v3 uses on 'Onramp' instead of 'FiatToCrypto'
   */
  export type FiatToCrypto = t.OutputOf<typeof LinkParamsCodecs.FiatToCrypto>;
  /**
   * @deprecated
   * Exchange API v3 uses on 'Offramp' instead of 'CryptoToFiat'
   */
  export type CryptoToFiat = t.OutputOf<typeof LinkParamsCodecs.CryptoToFiat>;
  export type NFTCheckoutPrimary = t.OutputOf<
    typeof LinkParamsCodecs.NFTCheckoutPrimary
  >;
  export type NFTCheckoutSecondary = t.OutputOf<
    typeof LinkParamsCodecs.NFTCheckoutSecondary
  >;
  export type Sign = t.OutputOf<typeof LinkParamsCodecs.Sign>;
  export type GetPublicKey = t.OutputOf<typeof LinkParamsCodecs.GetPublicKey>;
  export type MakeOffer = t.OutputOf<typeof LinkParamsCodecs.MakeOffer>;
  export type CancelOffer = t.OutputOf<typeof LinkParamsCodecs.CancelOffer>;
  export type AcceptOffer = t.OutputOf<typeof LinkParamsCodecs.AcceptOffer>;
}

const SetupResultsCodec = t.intersection([
  t.type({
    address: EthAddress,
    starkPublicKey: HexadecimalString,
    ethNetwork: t.string,
    providerPreference: t.string,
  }),
  t.partial({
    email: t.string,
  }),
]);

const SuccessCodec = t.literal('success');
const ErrorCodec = t.literal('error');

const BuyV2ResultsCodec = t.interface({
  result: t.record(
    PositiveNumberStringC,
    t.union([
      t.type({ status: SuccessCodec }),
      t.type({ status: ErrorCodec, message: t.string }),
    ]),
  ),
});

const TransferV2TokenWithResult = t.intersection([
  FlatTokenWithAmountAndToAddressCodec,
  t.union([
    t.type({ status: SuccessCodec, txId: t.Int }),
    t.type({ status: ErrorCodec, message: t.string }),
  ]),
]);

const TransferV2ResultsCodec = t.interface({
  result: t.array(TransferV2TokenWithResult),
});

const PrepareWithdrawalCodec = t.interface({
  withdrawalId: t.Int,
});

const CompleteWithdrawalCodec = t.interface({
  transactionId: t.string,
});

const SignResultsCodec = t.interface({
  result: NonEmptyString,
});

const GetPublicKeyResultsCodec = t.interface({
  result: NonEmptyString,
});

const OnrampResultsCodec = t.interface({
  exchangeId: NonEmptyString,
});

const OfframpResultsCodec = t.interface({
  exchangeId: NonEmptyString,
});

/**
 * @deprecated
 * Exchange API v3 uses on 'Onramp' instead of 'FiatToCrypto'
 */
const FiatToCryptoResultsCodec = t.interface({
  exchangeId: NonEmptyString,
});

/**
 * @deprecated
 * Exchange API v3 uses on 'Offramp' instead of 'CryptoToFiat'
 */
const CryptoToFiatResultsCodec = t.interface({
  exchangeId: NonEmptyString,
});

const NFTCheckoutPrimaryResultsCodec = t.interface({
  transactionId: t.string,
});

const NFTCheckoutSecondaryResultsCodec = t.interface({
  transactionId: t.string,
});

const MakeOfferResultsCodec = t.interface({
  orderId: PositiveNumberStringC,
  status: t.string,
});

export namespace LinkResultsCodecs {
  export const Setup = SetupResultsCodec;
  export const BuyV2 = BuyV2ResultsCodec;
  export const TransferV2 = TransferV2ResultsCodec;
  export const BatchNftTransfer = TransferV2ResultsCodec;
  export const PrepareWithdrawal = PrepareWithdrawalCodec;
  export const CompleteWithdrawal = CompleteWithdrawalCodec;
  export const Sign = SignResultsCodec;
  export const GetPublicKey = GetPublicKeyResultsCodec;
  export const Onramp = OnrampResultsCodec;
  export const Offramp = OfframpResultsCodec;

  /**
   * @deprecated
   * Exchange API v3 uses on 'Onramp' instead of 'FiatToCrypto'
   */
  export const FiatToCrypto = FiatToCryptoResultsCodec;

  /**
   * @deprecated
   * Exchange API v3 uses on 'Offramp' instead of 'CryptoToFiat'
   */
  export const CryptoToFiat = CryptoToFiatResultsCodec;

  export const NFTCheckoutPrimary = NFTCheckoutPrimaryResultsCodec;
  export const NFTCheckoutSecondary = NFTCheckoutSecondaryResultsCodec;
  export const MakeOffer = MakeOfferResultsCodec;
}

export namespace LinkResultsF {
  export type Setup = t.TypeOf<typeof LinkResultsCodecs.Setup>;
  export type BuyV2 = t.TypeOf<typeof LinkResultsCodecs.BuyV2>;
  export type TransferV2 = t.TypeOf<typeof LinkResultsCodecs.TransferV2>;
  export type PrepareWithdrawal = t.TypeOf<
    typeof LinkResultsCodecs.PrepareWithdrawal
  >;
  export type CompleteWithdrawal = t.TypeOf<
    typeof LinkResultsCodecs.CompleteWithdrawal
  >;
}

export namespace LinkResults {
  export type Setup = t.OutputOf<typeof LinkResultsCodecs.Setup>;
  export type BuyV2 = t.OutputOf<typeof LinkResultsCodecs.BuyV2>;
  export type TransferV2 = t.OutputOf<typeof LinkResultsCodecs.TransferV2>;
  export type BatchNftTransfer = t.OutputOf<
    typeof LinkResultsCodecs.BatchNftTransfer
  >;
  export type PrepareWithdrawal = t.OutputOf<
    typeof LinkResultsCodecs.PrepareWithdrawal
  >;
  export type CompleteWithdrawal = t.OutputOf<
    typeof LinkResultsCodecs.CompleteWithdrawal
  >;
  export type Sign = t.OutputOf<typeof LinkResultsCodecs.Sign>;
  export type GetPublicKey = t.OutputOf<typeof LinkResultsCodecs.GetPublicKey>;
  export type Onramp = t.OutputOf<typeof LinkResultsCodecs.Onramp>;
  export type Offramp = t.OutputOf<typeof LinkResultsCodecs.Offramp>;
  /**
   * @deprecated
   * Exchange API v3 uses on 'Onramp' instead of 'FiatToCrypto'
   */
  export type FiatToCrypto = t.OutputOf<typeof LinkResultsCodecs.FiatToCrypto>;

  /**
   * @deprecated
   * Exchange API v3 uses on 'Offramp' instead of 'CryptoToFiat'
   */
  export type CryptoToFiat = t.OutputOf<typeof LinkResultsCodecs.CryptoToFiat>;

  export type NFTCheckoutPrimary = t.OutputOf<
    typeof LinkResultsCodecs.NFTCheckoutPrimary
  >;
  export type NFTCheckoutSecondary = t.OutputOf<
    typeof LinkResultsCodecs.NFTCheckoutSecondary
  >;
  export type MakeOffer = t.OutputOf<typeof LinkResultsCodecs.MakeOffer>;
}
