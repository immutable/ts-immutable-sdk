import { TransactionResponse } from '@ethersproject/abstract-provider';
import { AnyToken, CancelOrderResponse, CreateOrderResponse, CreateTradeResponse, CreateTransferResponse, CreateTransferResponseV1, CreateWithdrawalResponse, GetSignableCancelOrderRequest, GetSignableTradeRequest, NftTransferDetails, RegisterUserResponse, StarkSigner, TokenAmount, UnsignedExchangeTransferRequest, UnsignedOrderRequest, UnsignedTransferRequest } from '@imtbl/core-sdk';
import { UserWithEtherKey } from '../types';
import { IMXProvider } from '../../provider/imxProvider';
import { ImxApiConfiguration } from '../config';
export type PassportImxProviderInput = {
    user: UserWithEtherKey;
    starkSigner: StarkSigner;
    apiConfig: ImxApiConfiguration;
};
export default class PassportImxProvider implements IMXProvider {
    private user;
    private starkSigner;
    private transfersApi;
    constructor({ user, starkSigner, apiConfig, }: PassportImxProviderInput);
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
