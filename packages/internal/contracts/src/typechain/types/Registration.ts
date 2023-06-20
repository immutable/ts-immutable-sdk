/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";

export interface RegistrationInterface extends utils.Interface {
  functions: {
    "imx()": FunctionFragment;
    "isRegistered(uint256)": FunctionFragment;
    "registerAndDepositNft(address,uint256,bytes,uint256,uint256,uint256)": FunctionFragment;
    "registerAndWithdraw(address,uint256,bytes,uint256)": FunctionFragment;
    "registerAndWithdrawNft(address,uint256,bytes,uint256,uint256)": FunctionFragment;
    "registerAndWithdrawNftTo(address,uint256,bytes,uint256,uint256,address)": FunctionFragment;
    "registerAndWithdrawTo(address,uint256,bytes,uint256,address)": FunctionFragment;
    "regsiterAndWithdrawAndMint(address,uint256,bytes,uint256,bytes)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "imx"
      | "isRegistered"
      | "registerAndDepositNft"
      | "registerAndWithdraw"
      | "registerAndWithdrawNft"
      | "registerAndWithdrawNftTo"
      | "registerAndWithdrawTo"
      | "regsiterAndWithdrawAndMint"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "imx", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "isRegistered",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "registerAndDepositNft",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "registerAndWithdraw",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "registerAndWithdrawNft",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "registerAndWithdrawNftTo",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "registerAndWithdrawTo",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "regsiterAndWithdrawAndMint",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;

  decodeFunctionResult(functionFragment: "imx", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "isRegistered",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerAndDepositNft",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerAndWithdraw",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerAndWithdrawNft",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerAndWithdrawNftTo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerAndWithdrawTo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "regsiterAndWithdrawAndMint",
    data: BytesLike
  ): Result;

  events: {};
}

export interface Registration extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: RegistrationInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    imx(overrides?: CallOverrides): Promise<[string]>;

    isRegistered(
      starkKey: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    registerAndDepositNft(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      vaultId: PromiseOrValue<BigNumberish>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    registerAndWithdraw(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    registerAndWithdrawNft(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    registerAndWithdrawNftTo(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      tokenId: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    registerAndWithdrawTo(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    regsiterAndWithdrawAndMint(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      mintingBlob: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  imx(overrides?: CallOverrides): Promise<string>;

  isRegistered(
    starkKey: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  registerAndDepositNft(
    ethKey: PromiseOrValue<string>,
    starkKey: PromiseOrValue<BigNumberish>,
    signature: PromiseOrValue<BytesLike>,
    assetType: PromiseOrValue<BigNumberish>,
    vaultId: PromiseOrValue<BigNumberish>,
    tokenId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  registerAndWithdraw(
    ethKey: PromiseOrValue<string>,
    starkKey: PromiseOrValue<BigNumberish>,
    signature: PromiseOrValue<BytesLike>,
    assetType: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  registerAndWithdrawNft(
    ethKey: PromiseOrValue<string>,
    starkKey: PromiseOrValue<BigNumberish>,
    signature: PromiseOrValue<BytesLike>,
    assetType: PromiseOrValue<BigNumberish>,
    tokenId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  registerAndWithdrawNftTo(
    ethKey: PromiseOrValue<string>,
    starkKey: PromiseOrValue<BigNumberish>,
    signature: PromiseOrValue<BytesLike>,
    assetType: PromiseOrValue<BigNumberish>,
    tokenId: PromiseOrValue<BigNumberish>,
    recipient: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  registerAndWithdrawTo(
    ethKey: PromiseOrValue<string>,
    starkKey: PromiseOrValue<BigNumberish>,
    signature: PromiseOrValue<BytesLike>,
    assetType: PromiseOrValue<BigNumberish>,
    recipient: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  regsiterAndWithdrawAndMint(
    ethKey: PromiseOrValue<string>,
    starkKey: PromiseOrValue<BigNumberish>,
    signature: PromiseOrValue<BytesLike>,
    assetType: PromiseOrValue<BigNumberish>,
    mintingBlob: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    imx(overrides?: CallOverrides): Promise<string>;

    isRegistered(
      starkKey: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    registerAndDepositNft(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      vaultId: PromiseOrValue<BigNumberish>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    registerAndWithdraw(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    registerAndWithdrawNft(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    registerAndWithdrawNftTo(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      tokenId: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    registerAndWithdrawTo(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    regsiterAndWithdrawAndMint(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      mintingBlob: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    imx(overrides?: CallOverrides): Promise<BigNumber>;

    isRegistered(
      starkKey: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    registerAndDepositNft(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      vaultId: PromiseOrValue<BigNumberish>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    registerAndWithdraw(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    registerAndWithdrawNft(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    registerAndWithdrawNftTo(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      tokenId: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    registerAndWithdrawTo(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    regsiterAndWithdrawAndMint(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      mintingBlob: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    imx(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    isRegistered(
      starkKey: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    registerAndDepositNft(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      vaultId: PromiseOrValue<BigNumberish>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    registerAndWithdraw(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    registerAndWithdrawNft(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    registerAndWithdrawNftTo(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      tokenId: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    registerAndWithdrawTo(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    regsiterAndWithdrawAndMint(
      ethKey: PromiseOrValue<string>,
      starkKey: PromiseOrValue<BigNumberish>,
      signature: PromiseOrValue<BytesLike>,
      assetType: PromiseOrValue<BigNumberish>,
      mintingBlob: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
