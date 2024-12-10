import { imx } from '@imtbl/generated-clients';
import {
  AnyToken,
  EthSigner,
  UnsignedOrderRequest,
  UnsignedExchangeTransferRequest,
  GetSignableCancelOrderRequest,
  GetSignableTradeRequest,
  CreateTradeResponse,
  NftTransferDetails,
  StarkSigner,
  TokenAmount,
  UnsignedTransferRequest,
} from '@imtbl/x-client';
import { TransactionResponse } from 'ethers';
import { ProviderConfiguration } from './config';
import { IMXProvider } from './imxProvider';
import { Signers } from './signable-actions/types';
import { batchTransfer, transfer } from './signable-actions/transfer';
import { cancelOrder, createOrder } from './signable-actions/orders';
import {
  isRegisteredOffchain,
  isRegisteredOnChain,
  registerOffchain,
} from './signable-actions/registration';
import {
  completeWithdrawal,
  prepareWithdrawal,
} from './signable-actions/withdrawal';
import { createTrade } from './signable-actions/trades';
import { deposit } from './signable-actions/deposit';
import { exchangeTransfer } from './signable-actions/exchanges';

export class GenericIMXProvider implements IMXProvider {
  private readonly config: ProviderConfiguration;

  private readonly signers: Signers;

  constructor(
    config: ProviderConfiguration,
    ethSigner: EthSigner,
    starkSigner: StarkSigner,
  ) {
    this.config = config;
    this.signers = { ethSigner, starkSigner };
  }

  async getAddress(): Promise<string> {
    return this.signers.ethSigner.getAddress();
  }

  async isRegisteredOffchain(): Promise<boolean> {
    const ethAddress = await this.getAddress();
    return isRegisteredOffchain(
      ethAddress,
      this.config,
    );
  }

  registerOffchain(): Promise<imx.RegisterUserResponse> {
    return registerOffchain(this.signers, this.config);
  }

  batchNftTransfer(
    request: Array<NftTransferDetails>,
  ): Promise<imx.CreateTransferResponse> {
    return batchTransfer({
      signers: this.signers,
      request,
      config: this.config,
    });
  }

  cancelOrder(
    request: GetSignableCancelOrderRequest,
  ): Promise<imx.CancelOrderResponse> {
    return cancelOrder({
      signers: this.signers,
      request,
      config: this.config,
    });
  }

  completeWithdrawal(
    starkPublicKey: string,
    token: AnyToken,
  ): Promise<TransactionResponse> {
    return completeWithdrawal({
      config: this.config,
      signers: this.signers,
      token,
      starkPublicKey,
    });
  }

  createOrder(request: UnsignedOrderRequest): Promise<imx.CreateOrderResponse> {
    return createOrder({
      signers: this.signers,
      request,
      config: this.config,
    });
  }

  createTrade(request: GetSignableTradeRequest): Promise<CreateTradeResponse> {
    return createTrade({
      signers: this.signers,
      request,
      config: this.config,
    });
  }

  deposit(tokenAmount: TokenAmount): Promise<TransactionResponse> {
    return deposit({
      signers: this.signers,
      deposit: tokenAmount,
      config: this.config,
    });
  }

  exchangeTransfer(
    request: UnsignedExchangeTransferRequest,
  ): Promise<imx.CreateTransferResponseV1> {
    return exchangeTransfer({
      signers: this.signers,
      request,
      config: this.config,
    });
  }

  async isRegisteredOnchain(): Promise<boolean> {
    const starkPublicKey = await this.signers.starkSigner.getAddress();
    return isRegisteredOnChain(
      starkPublicKey,
      this.signers.ethSigner,
      this.config,
    );
  }

  prepareWithdrawal(request: TokenAmount): Promise<imx.CreateWithdrawalResponse> {
    return prepareWithdrawal({
      signers: this.signers,
      withdrawal: request,
      config: this.config,
    });
  }

  transfer(
    request: UnsignedTransferRequest,
  ): Promise<imx.CreateTransferResponseV1> {
    return transfer({
      signers: this.signers,
      request,
      config: this.config,
    });
  }
}
