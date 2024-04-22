// import { ERC721TokenType, ETHTokenType, ERC20TokenType } from '@imtbl/imx-sdk';
import { ERC721TokenType, ETHTokenType, ERC20TokenType } from './sdk-types';

export interface Fee {
  recipient: string;
  /**
   * Percentage truncated to 2 d.p.
   * 10.24 = 10.24%
   */
  percentage: number;
}

export interface ETHToken {
  type: ETHTokenType.ETH;
}

export interface ERC20Token {
  type: ERC20TokenType.ERC20;
  tokenAddress: string;
  symbol: string;
}

export interface ERC721Token {
  type: ERC721TokenType.ERC721;
  tokenId: string;
  tokenAddress: string;
}

type TokenWithAmount = ETHToken & { amount: string } | ERC20Token & { amount: string } | ERC721Token;

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

export namespace Params {

  export interface Setup {
    providerPreference?: ProviderPreference;
  }

  export interface Sell {
    tokenId: string;
    tokenAddress: string;
    amount?: string;
    currencyAddress?: string;
    expirationTimestamp?: string;
    fees?: Array<Fee>;
  }

  export interface Buy {
    orderId: string;
  }

  export interface BuyV2 {
    orderIds: Array<string>;
    fees?: Array<Fee>;
  }

  export interface MakeOffer {
    tokenId: string;
    tokenAddress: string;
    amount: string;
    currencyAddress?: string;
    expirationTimestamp?: string;
    fees?: Array<Fee>;
  }

  export interface CancelOffer {
    orderId: string;
  }
  export interface AcceptOffer {
    orderId: string;
    fees?: Array<Fee>;
  }

  export interface Onramp {
    cryptoCurrencies?: Array<string>;
    provider?: string;
  }

  export interface Offramp {
    cryptoCurrencies?: Array<string>;
    amount: string;
    provider?: string;
  }

  export interface NFTCheckoutPrimary {
    contractAddress: string;
    offerId: string;
    provider: string;
  }

  export interface NFTCheckoutSecondary {
    provider: string;
    orderId: string;
    userWalletAddress: string;
  }

  export type FlexibleDeposit = (ETHToken | ERC20Token) | { amount: string } | undefined | Deposit;

  export interface Sign {
    message: string;
    description: string;
  }

  export type TransferV2 = Array<TokenWithAmount & { toAddress: string }>;

  export interface Cancel {
    orderId: string;
  }

  export type GetPublicKey = {};
  export type Deposit = TokenWithAmount;
  export type PrepareWithdrawal = TokenWithAmount;
  export type BatchNftTransfer = TransferV2;
  export type CompleteWithdrawal = TokenWithAmount;
  export type History = {};
  export type Claim = {};

  /**
     * @deprecated
     * Exchange API v3 uses on 'Onramp' instead of 'FiatToCrypto'
     */
  export interface FiatToCrypto {
    cryptoCurrencies?: Array<string>
  }
  /**
     * @deprecated
     * Exchange API v3 uses on 'Offramp' instead of 'CryptoToFiat'
     */
  export interface CryptoToFiat {
    cryptoCurrencies?: Array<string>;
    amount?: string;
  }

}

export namespace Results {

  export interface BuyV2 {
    result: Record<string, { status: 'success' } | { status: 'error', message: string }>;
  }

  export interface Sign {
    result: string;
  }

  export interface GetPublicKey {
    result: string;
  }

  export interface Onramp {
    exchangeId: string;
  }

  export interface Offramp {
    exchangeId: string;
  }

  export interface Setup {
    address: string;
    starkPublicKey: string;
    ethNetwork: string;
    providerPreference: string;
    email?: string;
  }

  export interface NFTCheckoutPrimary {
    transactionId: string;
  }

  export interface NFTCheckoutSecondary {
    transactionId: string;
  }

  export interface MakeOffer {
    orderId: string;
    status: string;
  }

  export interface PrepareWithdrawal {
    withdrawalId: number; // t.Int
  }

  export interface CompleteWithdrawal {
    transactionId: string;
  }

    type TransferStatus = { status: 'success', txId: number } | { status: 'error', message: string };

    export interface TransferV2 {
      result: Array<TokenWithAmount & { toAddress: string } & TransferStatus>;
    }

    export type BatchNftTransfer = TransferV2;

    /**
     * @deprecated
     * Exchange API v3 uses on 'Onramp' instead of 'FiatToCrypto'
     */
    export interface FiatToCrypto {
      exchangeId: string;
    }

    /**
     * @deprecated
     * Exchange API v3 uses on 'Offramp' instead of 'CryptoToFiat'
     */
    export interface CryptoToFiat {
      exchangeId: string;
    }

}
