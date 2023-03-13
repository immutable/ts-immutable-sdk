import { TransactionResponse } from '@ethersproject/abstract-provider';
import {
  AnyToken,
  CancelOrderResponse,
  Configuration,
  CreateOrderResponse,
  CreateTradeResponse,
  CreateTransferResponse,
  CreateTransferResponseV1,
  CreateWithdrawalResponse,
  EthSigner,
  GetSignableCancelOrderRequest,
  GetSignableTradeRequest,
  NftTransferDetails,
  RegisterUserResponse,
  StarkSigner,
  TokenAmount,
  UnsignedExchangeTransferRequest,
  UnsignedOrderRequest,
  UnsignedTransferRequest,
} from '@imtbl/core-sdk';
import { User } from '../types';
import { IMXProvider } from '../../provider';
import Workflows from '../workflows/workflows';
import { PassportConfiguration } from '../config';

export type JWT = Pick<User, 'accessToken' | 'refreshToken'>;

export default class PassportImxProvider implements IMXProvider {
  private jwt: JWT;
  private starkSigner: StarkSigner;
  private ethSigner: EthSigner;
  private workflows: Workflows;

  constructor(jwt: JWT, starkSigner: StarkSigner, ethSigner: EthSigner, config: PassportConfiguration) {
    this.jwt = jwt;
    this.starkSigner = starkSigner;
    this.ethSigner = ethSigner;
    this.workflows = new Workflows(new Configuration({ basePath: config.imxAPIConfiguration.basePath }));
  }

  transfer(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request: UnsignedTransferRequest
  ): Promise<CreateTransferResponseV1> {
    throw new Error('Method not implemented.');
  }

  async registerOffchain(): Promise<RegisterUserResponse> {
    await this.workflows.registerPassport({
      starkSigner: this.starkSigner,
      ethSigner: this.ethSigner
    }, this.jwt.accessToken);
    return {
      tx_hash: "",
    };
  }

  isRegisteredOnchain(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createOrder(request: UnsignedOrderRequest): Promise<CreateOrderResponse> {
    throw new Error('Method not implemented.');
  }

  cancelOrder(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request: GetSignableCancelOrderRequest
  ): Promise<CancelOrderResponse> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createTrade(request: GetSignableTradeRequest): Promise<CreateTradeResponse> {
    throw new Error('Method not implemented.');
  }

  batchNftTransfer(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request: NftTransferDetails[]
  ): Promise<CreateTransferResponse> {
    throw new Error('Method not implemented.');
  }

  exchangeTransfer(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request: UnsignedExchangeTransferRequest
  ): Promise<CreateTransferResponseV1> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  deposit(deposit: TokenAmount): Promise<TransactionResponse> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  prepareWithdrawal(request: TokenAmount): Promise<CreateWithdrawalResponse> {
    throw new Error('Method not implemented.');
  }
  completeWithdrawal(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    starkPublicKey: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: AnyToken
  ): Promise<TransactionResponse> {
    throw new Error('Method not implemented.');
  }

  getAddress(): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
