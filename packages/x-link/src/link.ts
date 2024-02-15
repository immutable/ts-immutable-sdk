
import { IMXProvider } from '@imtbl/x-provider';
import { 
  Link as OldLink,
  ConfigurableIframeOptions,
  FlatTokenWithAmountTS,
  ETHTokenType,
  ERC20TokenType,
  ERC721TokenType,
  FlatTokenTS,
  ImmutableXClient,
} from '@imtbl/imx-sdk';
import { Provider } from '@ethersproject/providers';

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
  TokenAmount,
  UnsignedExchangeTransferRequest,
  UnsignedOrderRequest,
  UnsignedTransferRequest,
  ERC721Token,
  ERC20Amount,
  ETHAmount,
  FeeEntry,
} from '@imtbl/core-sdk';

import { TransactionResponse } from '@ethersproject/providers';
import { SetupOptions, SetupResult } from 'types';

export class Link implements IMXProvider {

    private link: OldLink;

    constructor(
      private client: ImmutableXClient,
      private staticProvider: Provider,
      webUrl: string,
      opts: ConfigurableIframeOptions
    ) {
      this.link = new OldLink(webUrl, opts);
    }

    public async getAddress(): Promise<string> {
      const result = await this.link.getPublicKey({});
      return result.result;
    }

    public async isRegisteredOffchain(): Promise<boolean> {
      return false;
    }

    public async isRegisteredOnchain(): Promise<boolean> {
      return false;
    }

    public async createOrder(request: UnsignedOrderRequest): Promise<CreateOrderResponse> {
      // Link has different methods for offers vs. selling NFTs
      // IMXProvider only has one 'createOrder' to cover both

      // If the order is an offer on an NFT
      if (request.buy.type == 'ERC721') {
        return this.makeOffer(request);
      }
      // Otherwise, the order is selling an NFT
      return this.sell(request);
    }

    private async makeOffer(request: UnsignedOrderRequest): Promise<CreateOrderResponse> {
      const buyToken = request.buy as ERC721Token;
      const sellToken = request.sell as ERC20Amount | ETHAmount;
      const params = {
        tokenId: buyToken.tokenId,
        tokenAddress: buyToken.tokenAddress,
        amount: sellToken.amount,
        currencyAddress: request.sell.type == 'ERC20' ? request.sell.tokenAddress : undefined,
        expirationTimestamp: request.expiration_timestamp?.toString(),
        fees: this.convertFees(request.fees)
      }
      const response = await this.link.makeOffer(params);
      return {
        order_id: Number(response.orderId),
        status: response.status,
        request_id: '', // TODO
        time: 0, // TODO
      }
    }

    private async sell(request: UnsignedOrderRequest): Promise<CreateOrderResponse> {
      const sellToken = request.sell as ERC721Token;
      const buyToken = request.buy as ERC20Amount | ETHAmount;

      const params = {
        tokenId: sellToken.tokenId,
        tokenAddress: sellToken.tokenAddress,
        amount: buyToken.amount,
        currencyAddress: request.buy.type == 'ERC20' ? request.buy.tokenAddress : undefined,
        expirationTimestamp: request.expiration_timestamp?.toString(),
        fees: this.convertFees(request.fees)
      }
      const response = await this.link.sell(params);
      return {
        order_id: 0, // TODO:
        status: '', // TODO: 
        request_id: '', // TODO:
        time: 0, // TODO:
      }
    }

    // TODO: the interface method doesn't provide fees, which Link wants?
    // TODO: why doesn't Link fetch them from the backend?
    public async cancelOrder(
      request: GetSignableCancelOrderRequest
    ): Promise<CancelOrderResponse> {
      const linkRequest = {
        orderId: request.order_id.toString(),
      }
      await this.link.cancel(linkRequest);
      return {
        order_id: request.order_id,
        status: ''
      }
    }

    public async createTrade(request: GetSignableTradeRequest): Promise<CreateTradeResponse> {
      // Link has different methods for accepting offers vs. buying NFTs
      // IMXProvider only has one 'createTrade' to cover both

      const order = await this.client.getOrderV3({ orderId: request.order_id, include_fees: true})

      // If the user is accepting an offer
      if (order.sell.type == ERC721TokenType.ERC721) {
        return this.acceptOffer(request);
      }
      // Otherwise, the order is selling an NFT
      return this.buy(request)
    }

    // TODO: IMXProvider only supports one at a time
    private async buy(request: GetSignableTradeRequest): Promise<CreateTradeResponse> {
      const params = {
        orderIds: [request.order_id.toString()],
        fees: this.convertFees(request.fees)
      }
      const response = await this.link.buy(params);
      return {
        status: '', // TODO: 
        request_id: '', // TODO:
        trade_id: 0, // TODO: 
      }
    }

    private async acceptOffer(request: GetSignableTradeRequest): Promise<CreateTradeResponse> {
      const params = {
        orderId: request.order_id.toString(),
        fees: this.convertFees(request.fees)
      }
      const response = await this.link.acceptOffer(params);
      return {
        status: '', // TODO: 
        request_id: '', // TODO:
        trade_id: 0, // TODO: 
      }
    }
      

    public async transfer(request: UnsignedTransferRequest): Promise<CreateTransferResponseV1> {
      const linkRequest = [{
        ...this.convertTokenAmount(request),
        toAddress: request.receiver
      }]
      const response = await this.link.transfer(linkRequest);
      const result = response.result[0];
      if (result.status == 'success') {
        return {
          transfer_id: result.txId,
          sent_signature: '', // TODO: undefined
          status: result.status,
          time: 0, // TODO: undefined
        }
      } else {
        return {
          transfer_id: 0, // TODO: not optional?
          sent_signature: '', // TODO: undefined
          status: result.status,
          time: 0, // TODO: undefined
        }
      }
    }

    public async batchNftTransfer(
      request: Array<NftTransferDetails>
    ): Promise<CreateTransferResponse> {
      const params = request.map(transfer => {
        return {
          type: ERC721TokenType.ERC721,
          toAddress: transfer.receiver,
          tokenId: transfer.tokenId,
          tokenAddress: transfer.tokenAddress
        }
      })
      const response = await this.link.batchNftTransfer(params);

      const successfulTransferIDs = response.result.map(r => {
        return r.status == 'success' ? r.txId : 0;
      })

      return {
        transfer_ids: successfulTransferIDs,
      }
    }
    /**
     * Create a new Exchange transaction
     *
     * @param {UnsignedExchangeTransferRequest} request The unsigned exchange transfer request
     * @return {Promise<CreateTransferResponseV1>} Returns a promise that resolves with the created Exchange Transaction
     */
    public async exchangeTransfer(
      request: UnsignedExchangeTransferRequest
    ): Promise<CreateTransferResponseV1> {
      return {
        transfer_id: 0, // TODO: unimplemented
        sent_signature: '', // TODO: unimplemented
        status: '', // TODO: unimplemented
        time: 0, // TODO: unimplemented
      }
    }

    public async deposit(request: TokenAmount): Promise<TransactionResponse> {
      const params = this.convertToken(request);
      const response = await this.link.deposit(params);
      const hash = ''; // TODO: 
      return this.staticProvider.getTransaction(hash);
    }

    public async prepareWithdrawal(request: TokenAmount): Promise<CreateWithdrawalResponse> {
      const params = this.convertTokenAmount(request);
      const response = await this.link.prepareWithdrawal(params);
      return {
        status: '', // TODO: set
        time: 0, // TODO: set
        withdrawal_id: response.withdrawalId
      }
    }

    public async completeWithdrawal(
      starkPublicKey: string,
      token: AnyToken
    ): Promise<TransactionResponse> {
      const params = this.convertToken(token);
      const response = await this.link.completeWithdrawal(params);
      const hash = response.transactionId;
      return this.staticProvider.getTransaction(hash);
    }

    // Link-specific functions

    public async setup(opts: SetupOptions): Promise<SetupResult> {
      const response = await this.link.setup({
        providerPreference: opts.providerPreference
      });
      return response;
    }

    public async history() {
      return this.link.history({});
    }

    // Utility functions

    // Convert from IMXProvider format to Link format
    private convertTokenAmount(token: TokenAmount): FlatTokenWithAmountTS {
      switch (token.type) {
        case 'ETH':
          return {
            type: ETHTokenType.ETH,
            amount: token.amount
          }
        case 'ERC20':
          return {
            type: ERC20TokenType.ERC20,
            amount: token.amount,
            tokenAddress: token.tokenAddress,
            symbol: '' // TODO: why is this necessary?
          }
        case 'ERC721':
          return {
            type: ERC721TokenType.ERC721,
            tokenId: token.tokenId,
            tokenAddress: token.tokenAddress,
          }
      }
    }

    private convertToken(token: AnyToken): FlatTokenTS {
      switch (token.type) {
        case 'ETH':
          return {
            type: ETHTokenType.ETH
          }
        case 'ERC20':
          return {
            type: ERC20TokenType.ERC20,
            tokenAddress: token.tokenAddress,
            symbol: '' // TODO: why is this necessary?
          }
        case 'ERC721':
          return {
            type: ERC721TokenType.ERC721,
            tokenId: token.tokenId,
            tokenAddress: token.tokenAddress,
          }
      }
    }

    private convertFees(fees?: Array<FeeEntry>): Array<{ percentage: number, recipient: string}> | undefined {
      if (!fees) {
        return undefined;
      }
      return fees.map(fee => {
        return {
          percentage: fee.fee_percentage!,
          recipient: fee.address!,
        }
      })
    }

}