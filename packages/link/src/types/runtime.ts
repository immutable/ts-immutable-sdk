/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable @typescript-eslint/no-redeclare */
/* eslint-disable @typescript-eslint/naming-convention */
import { isAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as t from 'io-ts';

export interface EthAddressBrand {
  readonly EthAddress: unique symbol;
}

export const EthAddress = t.brand(
  t.string,
  (s: any): s is t.Branded<string, EthAddressBrand> => isAddress(s),
  'EthAddress',
);

export type EthAddress = t.TypeOf<typeof EthAddress>;

export enum BurnAddress {
  BurnEthAddress = '0x0000000000000000000000000000000000000000',
}

export interface NumberStringBrand {
  readonly NumberString: unique symbol;
}

export const NumberString = t.brand(
  t.string,
  (s: any): s is t.Branded<string, NumberStringBrand> =>
    s !== '' && !Number.isNaN(s),
  'NumberString',
);
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type NumberString = t.TypeOf<typeof NumberString>;

export interface HexadecimalStringBrand {
  readonly HexadecimalString: unique symbol;
}

export const HexadecimalString = t.brand(
  t.string,
  (s: any): s is t.Branded<string, HexadecimalStringBrand> =>
    typeof s === 'string' && s.substring(0, 2) === '0x',
  'HexadecimalString',
);

export type HexadecimalString = t.TypeOf<typeof HexadecimalString>;

export interface IntegerStringBrand {
  readonly IntegerString: unique symbol;
}

export const IntegerString = t.brand(
  NumberString,
  (s: any): s is t.Branded<NumberString, IntegerStringBrand> =>
    Number.isInteger(parseFloat(s)),
  'IntegerString',
);

export interface PositiveIntegerStringBrand {
  readonly PositiveIntegerString: unique symbol;
}

export const PositiveIntegerStringC = t.brand(
  NumberString,
  (s: any): s is t.Branded<NumberString, PositiveIntegerStringBrand> =>
    Number.isInteger(parseFloat(s)) && parseFloat(s) > 0,
  'PositiveIntegerString',
);

export type PositiveIntegerString = t.TypeOf<typeof PositiveIntegerStringC>;

export interface PositiveNumberStringBrand {
  readonly PositiveNumberString: unique symbol;
}

export const PositiveNumberStringC = t.brand(
  NumberString,
  (s: any): s is t.Branded<NumberString, PositiveNumberStringBrand> =>
    parseFloat(s) > 0,
  'PositiveNumberString',
);

export type PositiveNumberString = t.TypeOf<typeof PositiveNumberStringC>;

export interface PositiveIntegerBrand {
  readonly PositiveInteger: unique symbol;
}

export type PositiveIntegerT = number & PositiveIntegerBrand;

export const PositiveIntegerC = t.brand(
  t.number,
  (n): n is t.Branded<number, PositiveIntegerT> => Number.isInteger(n) && n > 0,
  'PositiveInteger',
);

export type PositiveInteger = t.TypeOf<typeof PositiveIntegerC>;

export function fromEnum<EnumType>(
  enumName: string,
  theEnum: Record<string, string | number>,
): t.Type<EnumType> {
  const isEnumValue = (input: unknown): input is EnumType =>
    Object.values<unknown>(theEnum).includes(input);

  return new t.Type<EnumType>(
    enumName,
    isEnumValue,
    // eslint-disable-next-line no-confusing-arrow
    (input, context) =>
      isEnumValue(input) ? t.success(input) : t.failure(input, context),
    t.identity,
  );
}

export const FeeCodec = t.interface({
  /** Asset originator (AO) address to pay out fees to */
  recipient: EthAddress,

  /**
   * Percentage truncated to 2 d.p.
   *
   * 10.24 = 10.24%
   */
  percentage: t.number,
});

export type FeeType = t.TypeOf<typeof FeeCodec>;

/**
 * Token(s)
 */

export enum ETHTokenType {
  ETH = 'ETH',
}

export const ETHTokenTypeT = fromEnum<ETHTokenType>(
  'ETHTokenType',
  ETHTokenType,
);

export const ETHTokenCodec = t.interface({
  type: ETHTokenTypeT,
  data: t.interface({
    decimals: t.number,
  }),
});

export type ETHToken = t.TypeOf<typeof ETHTokenCodec>;

export enum ERC20TokenType {
  ERC20 = 'ERC20',
}

export const ERC20TokenTypeT = fromEnum<ERC20TokenType>(
  'ERC20TokenType',
  ERC20TokenType,
);

export const ERC20TokenCodec = t.interface({
  type: ERC20TokenTypeT,
  data: t.interface({
    symbol: t.string,
    decimals: t.number,
    tokenAddress: EthAddress,
  }),
});

export type ERC20Token = t.TypeOf<typeof ERC20TokenCodec>;

export enum ERC721TokenType {
  ERC721 = 'ERC721',
}

export const ERC721TokenTypeT = fromEnum<ERC721TokenType>(
  'ERC721TokenType',
  ERC721TokenType,
);

export const ERC721TokenCodec = t.interface({
  type: ERC721TokenTypeT,
  data: t.interface({
    tokenId: t.string,
    tokenAddress: EthAddress,
  }),
});

export type ERC721Token = t.TypeOf<typeof ERC721TokenCodec>;

export enum MintableERC20TokenType {
  MINTABLE_ERC20 = 'MINTABLE_ERC20',
}

export const MintableERC20TokenTypeT = fromEnum<MintableERC20TokenType>(
  'MintableERC20TokenType',
  MintableERC20TokenType,
);

export const MintableERC20TokenCodec = t.interface({
  type: MintableERC20TokenTypeT,
  data: t.interface({
    id: t.string,
    blueprint: t.string,
    tokenAddress: t.union([t.string, EthAddress]),
  }),
});

export type MintableERC20Token = t.TypeOf<typeof MintableERC20TokenCodec>;

export const MintFeeCodec = t.interface({
  recipient: EthAddress, // asset originator (AO) address to pay out royalty fees to
  percentage: t.number,
});

export enum MintableERC721TokenType {
  MINTABLE_ERC721 = 'MINTABLE_ERC721',
}

export const MintableERC721TokenTypeT = fromEnum<MintableERC721TokenType>(
  'MintableERC721TokenType',
  MintableERC721TokenType,
);

export const MintableERC721TokenDataCodec = t.intersection([
  t.interface({
    id: t.string,
    blueprint: t.string,
  }),
  t.partial({
    royalties: t.array(MintFeeCodec), // token-level overridable fees (optional)
  }),
]);

export type MintableERC721TokenData = t.TypeOf<
  typeof MintableERC721TokenDataCodec
>;

export const MintableERC721TokenCodec = t.interface({
  type: MintableERC721TokenTypeT,
  data: t.intersection([
    t.interface({
      id: t.string,
      blueprint: t.string,
      tokenAddress: t.union([t.string, EthAddress]),
    }),
    t.partial({
      royalties: t.array(MintFeeCodec), // token-level overridable fees (optional)
    }),
  ]),
});

export type MintableERC721Token = t.TypeOf<typeof MintableERC721TokenCodec>;

export const TokenTypeCodec = t.union([
  ERC721TokenTypeT,
  ERC20TokenTypeT,
  ETHTokenTypeT,
  MintableERC20TokenTypeT,
  MintableERC721TokenTypeT,
]);

export const TokenCodec = t.union([
  ETHTokenCodec,
  ERC20TokenCodec,
  ERC721TokenCodec,
  MintableERC20TokenCodec,
  MintableERC721TokenCodec,
]);

export type Token = t.TypeOf<typeof TokenCodec>;
export type TokenTS = t.OutputOf<typeof TokenCodec>;

export const MintBodyCodec = t.interface({
  etherKey: EthAddress,
  tokens: t.array(MintableERC721TokenCodec),
  nonce: PositiveIntegerStringC,
  authSignature: t.string,
});

export type MintBody = t.TypeOf<typeof MintBodyCodec>;

export const MintUserCodec = t.interface({
  etherKey: EthAddress,
  tokens: t.array(MintableERC721TokenDataCodec),
});

// TODO: remove V2 label when V1 is deprecated
export const MintV2BodyCodec = t.intersection([
  t.interface({
    users: t.array(MintUserCodec),
    contractAddress: EthAddress,
  }),
  t.partial({ royalties: t.array(MintFeeCodec) }), // contract-level (optional)
]);

export type MintV2Body = t.TypeOf<typeof MintV2BodyCodec>;

export const BigNumberCodec = t.type({
  vaultId: t.Int,
  token: TokenCodec,
  quantity: t.bigint,
});

export const BigNumberT = new t.Type<BigNumber, BigNumber>(
  'BigNumberT',
  (u): u is BigNumber => u instanceof BigNumber,
  (u, c) =>
    pipe(
      E.tryCatch(
        () => BigNumber.from(u),
        // eslint-disable-next-line arrow-parens
        e => e as Error,
      ),
      E.fold(() => t.failure(u, c), t.success),
    ),
  t.identity,
);
export type BigNumberT = t.TypeOf<typeof BigNumberT>;

export interface PositiveBigNumberBrand {
  readonly PositiveBigNumber: unique symbol;
}

export const PositiveBigNumber = t.brand(
  BigNumberT,
  (s): s is t.Branded<BigNumberT, PositiveBigNumberBrand> =>
    s > BigNumber.from(0),
  'PositiveBigNumber',
);

export type PositiveBigNumber = t.TypeOf<typeof PositiveBigNumber>;

export interface NonNegativeBigNumberBrand {
  readonly NonNegativeBigNumber: unique symbol;
}

export const NonNegativeBigNumber = t.brand(
  BigNumberT,
  (s): s is t.Branded<BigNumberT, NonNegativeBigNumberBrand> =>
    s >= BigNumber.from(0),
  'NonNegativeBigNumber',
);

export type NonNegativeBigNumber = t.TypeOf<typeof NonNegativeBigNumber>;

/**
 * Transfer / Order Params
 */
export const TransferParamsCodec = t.interface({
  starkPublicKey: HexadecimalString,
  vaultId: t.Int,
});

export type TransferParams = t.TypeOf<typeof TransferParamsCodec>;

export const OrderParamsCodec = t.interface({
  vaultId: t.Int,
  token: TokenCodec,
  quantity: PositiveBigNumber,
});

export type OrderParams = t.TypeOf<typeof OrderParamsCodec>;

export const FeeParamsCodec = t.interface({
  feeToken: t.string,
  feeVaultId: t.Int,
  feeLimit: PositiveBigNumber,
});

export type FeeParams = t.TypeOf<typeof FeeParamsCodec>;
