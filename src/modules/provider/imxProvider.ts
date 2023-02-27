import { RegisterUserResponse } from "src/types";
import {
    AnyToken,
    CancelOrderResponse,
    CreateOrderResponse,
    CreateTradeResponse,
    CreateTransferResponse,
    CreateTransferResponseV1, CreateWithdrawalResponse,
    GetSignableCancelOrderRequest,
    GetSignableTradeRequest,
    NftTransferDetails,
    TokenAmount,
    UnsignedExchangeTransferRequest,
    UnsignedOrderRequest,
    UnsignedTransferRequest
} from "@imtbl/core-sdk";
import { TransactionResponse } from '@ethersproject/providers';

export interface IMXProvider {
    registerOffchain():Promise<RegisterUserResponse>;
    isRegisteredOnchain():Promise<boolean>;
    //mint(request: UnsignedMintRequest): Promise<MintTokensResponse>;
    createOrder(request: UnsignedOrderRequest): Promise<CreateOrderResponse>;
    cancelOrder(request: GetSignableCancelOrderRequest): Promise<CancelOrderResponse>;
    createTrade(request: GetSignableTradeRequest): Promise<CreateTradeResponse>;
    transfer(request: UnsignedTransferRequest): Promise<CreateTransferResponseV1>;
    batchNftTransfer(request: Array<NftTransferDetails>): Promise<CreateTransferResponse>;
    exchangeTransfer(request: UnsignedExchangeTransferRequest): Promise<CreateTransferResponseV1>;
    deposit(deposit: TokenAmount): Promise<TransactionResponse>;
    prepareWithdrawal(request: TokenAmount): Promise<CreateWithdrawalResponse>;
    completeWithdrawal(starkPublicKey: string, token: AnyToken): Promise<TransactionResponse>;
}
