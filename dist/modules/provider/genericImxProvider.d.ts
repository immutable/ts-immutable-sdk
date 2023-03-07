import { IMXProvider } from './imxProvider';
import { Configuration } from '../../config';
import { AnyToken, RegisterUserResponse, CancelOrderResponse, CreateOrderResponse, CreateTradeResponse, CreateTransferResponse, CreateTransferResponseV1, CreateWithdrawalResponse, GetSignableCancelOrderRequest, GetSignableTradeRequest, NftTransferDetails, StarkSigner, TokenAmount, UnsignedExchangeTransferRequest, UnsignedOrderRequest, UnsignedTransferRequest, EthSigner } from 'types';
import { TransactionResponse } from '@ethersproject/providers';
export declare class GenericIMXProvider implements IMXProvider {
    private readonly config;
    private readonly signers;
    constructor(config: Configuration, ethSigner: EthSigner, starkExSigner: StarkSigner);
    getAddress(): Promise<string>;
    registerOffchain(): Promise<RegisterUserResponse>;
    batchNftTransfer(request: Array<NftTransferDetails>): Promise<CreateTransferResponse>;
    cancelOrder(request: GetSignableCancelOrderRequest): Promise<CancelOrderResponse>;
    completeWithdrawal(starkPublicKey: string, token: AnyToken): Promise<TransactionResponse>;
    createOrder(request: UnsignedOrderRequest): Promise<CreateOrderResponse>;
    createTrade(request: GetSignableTradeRequest): Promise<CreateTradeResponse>;
    deposit(tokenAmount: TokenAmount): Promise<TransactionResponse>;
    exchangeTransfer(request: UnsignedExchangeTransferRequest): Promise<CreateTransferResponseV1>;
    isRegisteredOnchain(): Promise<boolean>;
    prepareWithdrawal(request: TokenAmount): Promise<CreateWithdrawalResponse>;
    transfer(request: UnsignedTransferRequest): Promise<CreateTransferResponseV1>;
}
