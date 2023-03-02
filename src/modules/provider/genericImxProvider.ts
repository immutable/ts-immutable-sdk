import { IMXProvider } from "./imxProvider";
import { Signers } from "./signable-actions/types";
import { EthSigner } from "@imtbl/core-sdk";
import { Configuration } from "../../config";
import {
  AnyToken,
  RegisterUserResponse,
  CancelOrderResponse,
  CreateOrderResponse,
  CreateTradeResponse,
  CreateTransferResponse,
  CreateTransferResponseV1,
  CreateWithdrawalResponse,
  GetSignableCancelOrderRequest,
  GetSignableTradeRequest,
  NftTransferDetails,
  StarkSigner,
  TokenAmount,
  UnsignedExchangeTransferRequest,
  UnsignedOrderRequest,
  UnsignedTransferRequest
} from "src/types";
import { batchTransfers, transfers } from "./signable-actions/transfer";
import { cancelOrder, createOrder } from "./signable-actions/orders";
import { isRegisteredOnChain, registerOffchain } from "./signable-actions/registration";
import { completeWithdrawal, prepareWithdrawal } from "./signable-actions/withdrawal";
import { TransactionResponse } from "@ethersproject/providers";
import { createTrade } from "./signable-actions/trades";
import { deposit } from "./signable-actions/deposit";
import { exchangeTransfers } from "./signable-actions/exchangeTransfers";

export class GenericIMXProvider implements IMXProvider {
  private readonly config: Configuration;
  private readonly signers: Signers;

  constructor(config: Configuration, ethSigner: EthSigner, starkExSigner: StarkSigner) {
    this.config = config;
    this.signers = { ethSigner, starkExSigner };
  }

  async getAddress(): Promise<string> {
    return await this.signers.ethSigner.getAddress()
  }

  registerOffchain(): Promise<RegisterUserResponse> {
    return registerOffchain(this.signers, this.config)
  }

  batchNftTransfer(request: Array<NftTransferDetails>): Promise<CreateTransferResponse> {
    return batchTransfers({
      signers: this.signers,
      request,
      config: this.config});
  }

  cancelOrder(request: GetSignableCancelOrderRequest): Promise<CancelOrderResponse> {
    return cancelOrder({
      signers: this.signers,
      request,
      config: this.config
    });
  }

  completeWithdrawal(starkPublicKey: string, token: AnyToken): Promise<TransactionResponse> {
    return completeWithdrawal({
      config: this.config,
      signers: this.signers,
      token,
      starkPublicKey
    });
  }

  createOrder(request: UnsignedOrderRequest): Promise<CreateOrderResponse> {
    return createOrder({
      signers: this.signers,
      request,
      config: this.config
    });
  }

  createTrade(request: GetSignableTradeRequest): Promise<CreateTradeResponse> {
    return createTrade({
      signers: this.signers,
      request,
      config: this.config
    });
  }

  deposit(tokenAmount: TokenAmount): Promise<TransactionResponse> {
    return deposit(this.signers, tokenAmount, this.config);
  }

  exchangeTransfer(request: UnsignedExchangeTransferRequest): Promise<CreateTransferResponseV1> {
    return exchangeTransfers({
      signers: this.signers,
      request,
      config: this.config
    })
  }

  async isRegisteredOnchain(): Promise<boolean> {
    const starkPublicKey = await this.signers.starkExSigner.getAddress();
    return isRegisteredOnChain(starkPublicKey, this.signers.ethSigner, this.config);
  }

  prepareWithdrawal(request: TokenAmount): Promise<CreateWithdrawalResponse> {
    return prepareWithdrawal({
      signers: this.signers,
      withdrawal: request,
      config: this.config
    })
  }

  transfer(request: UnsignedTransferRequest): Promise<CreateTransferResponseV1> {
    return transfers({
      signers: this.signers,
      request,
      config: this.config
    })
  }
}
