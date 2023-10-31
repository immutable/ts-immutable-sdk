import { TransactionResponse } from '@ethersproject/abstract-provider';
import { IMXProvider } from '@imtbl/provider';
import {
  AnyToken,
  CancelOrderResponse,
  CreateOrderResponse,
  CreateTradeResponse,
  CreateTransferResponse,
  CreateTransferResponseV1,
  CreateWithdrawalResponse,
  GetSignableCancelOrderRequest,
  GetSignableTradeRequest,
  NftTransferDetails,
  RegisterUserResponse,
  TokenAmount,
  UnsignedExchangeTransferRequest,
  UnsignedOrderRequest,
  UnsignedTransferRequest,
} from '@imtbl/core-sdk';
import { ImmutableXClient } from '@imtbl/immutablex-client';
import { PassportImxProvider } from './passportImxProvider';
import { IMXSigners, PassportEventMap } from '../types';
import AuthManager from '../authManager';
import { ConfirmationScreen } from '../confirmation';
import { PassportConfiguration } from '../config';
import TypedEventEmitter from '../typedEventEmitter';

export interface LazyPassportImxProviderOptions {
  authManager: AuthManager;
  immutableXClient: ImmutableXClient;
  confirmationScreen: ConfirmationScreen;
  config: PassportConfiguration;
  passportEventEmitter: TypedEventEmitter<PassportEventMap>;
  signersPromise: Promise<IMXSigners>;
}

export class LazyPassportImxProvider implements IMXProvider {
  private provider: PassportImxProvider | null = null;

  private readonly options: LazyPassportImxProviderOptions;

  constructor(input: LazyPassportImxProviderOptions) {
    this.options = input;
  }

  protected async getProvider(): Promise<PassportImxProvider> {
    if (!this.provider) {
      const { signersPromise, ...providerOptions } = this.options;
      const { ethSigner, starkSigner } = await signersPromise;

      this.provider = new PassportImxProvider({
        ...providerOptions,
        ethSigner,
        starkSigner,
      });
    }
    return this.provider;
  }

  async batchNftTransfer(request: Array<NftTransferDetails>): Promise<CreateTransferResponse> {
    const provider = await this.getProvider();
    return provider.batchNftTransfer(request);
  }

  async cancelOrder(request: GetSignableCancelOrderRequest): Promise<CancelOrderResponse> {
    const provider = await this.getProvider();
    return provider.cancelOrder(request);
  }

  async completeWithdrawal(starkPublicKey: string, token: AnyToken): Promise<TransactionResponse> {
    const provider = await this.getProvider();
    return provider.completeWithdrawal(starkPublicKey, token);
  }

  async createOrder(request: UnsignedOrderRequest): Promise<CreateOrderResponse> {
    const provider = await this.getProvider();
    return provider.createOrder(request);
  }

  async createTrade(request: GetSignableTradeRequest): Promise<CreateTradeResponse> {
    const provider = await this.getProvider();
    return provider.createTrade(request);
  }

  async deposit(deposit: TokenAmount): Promise<TransactionResponse> {
    const provider = await this.getProvider();
    return provider.deposit(deposit);
  }

  async exchangeTransfer(request: UnsignedExchangeTransferRequest): Promise<CreateTransferResponseV1> {
    const provider = await this.getProvider();
    return provider.exchangeTransfer(request);
  }

  async getAddress(): Promise<string> {
    const provider = await this.getProvider();
    return provider.getAddress();
  }

  async isRegisteredOnchain(): Promise<boolean> {
    const provider = await this.getProvider();
    return provider.isRegisteredOnchain();
  }

  async prepareWithdrawal(request: TokenAmount): Promise<CreateWithdrawalResponse> {
    const provider = await this.getProvider();
    return provider.prepareWithdrawal(request);
  }

  async registerOffchain(): Promise<RegisterUserResponse> {
    const provider = await this.getProvider();
    return provider.registerOffchain();
  }

  async transfer(request: UnsignedTransferRequest): Promise<CreateTransferResponseV1> {
    const provider = await this.getProvider();
    return provider.transfer(request);
  }
}
