import { TransactionResponse } from '@ethersproject/abstract-provider';
import { AnyToken, CancelOrderResponse, CreateOrderResponse, CreateTradeResponse, CreateTransferResponse, CreateTransferResponseV1, CreateWithdrawalResponse, GetSignableCancelOrderRequest, GetSignableTradeRequest, NftTransferDetails, RegisterUserResponse, StarkSigner, TokenAmount, UnsignedExchangeTransferRequest, UnsignedOrderRequest, UnsignedTransferRequest } from '@imtbl/core-sdk';
import { User } from '../types';
import { IMXProvider } from '../../provider';
export type JWT = Pick<User, 'accessToken' | 'refreshToken'>;
export default class PassportImxProvider implements IMXProvider {
    private jwt;
    private starkSigner;
    constructor(jwt: JWT, starkSigner: StarkSigner);
    transfer(request: UnsignedTransferRequest): Promise<CreateTransferResponseV1>;
    registerOffchain(): Promise<RegisterUserResponse>;
    isRegisteredOnchain(): Promise<boolean>;
    createOrder(request: UnsignedOrderRequest): Promise<CreateOrderResponse>;
    cancelOrder(request: GetSignableCancelOrderRequest): Promise<CancelOrderResponse>;
    createTrade(request: GetSignableTradeRequest): Promise<CreateTradeResponse>;
    batchNftTransfer(request: NftTransferDetails[]): Promise<CreateTransferResponse>;
    exchangeTransfer(request: UnsignedExchangeTransferRequest): Promise<CreateTransferResponseV1>;
    deposit(deposit: TokenAmount): Promise<TransactionResponse>;
    prepareWithdrawal(request: TokenAmount): Promise<CreateWithdrawalResponse>;
    completeWithdrawal(starkPublicKey: string, token: AnyToken): Promise<TransactionResponse>;
    getAddress(): Promise<string>;
}
