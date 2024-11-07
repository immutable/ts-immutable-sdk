import { imx } from '@imtbl/generated-clients';
import {
  AnyToken,
  UnsignedOrderRequest,
  UnsignedExchangeTransferRequest,
  GetSignableCancelOrderRequest,
  GetSignableTradeRequest,
  CreateTradeResponse,
  NftTransferDetails,
  TokenAmount,
  UnsignedTransferRequest,
} from '@imtbl/x-client';
import { TransactionResponse } from 'ethers';

export interface IMXProvider {
  /**
   * Get the Signer address
   *
   * @return {Promise<string>} Returns a promise that resolves with the signer's address
   */
  getAddress(): Promise<string>;
  /**
   * Register a User to Immutable X if they are not already registered
   *
   * @return {Promise<imx.RegisterUserResponse>} Returns a promise that resolves with the user registration response
   */
  registerOffchain(): Promise<imx.RegisterUserResponse>;
  /**
   *  Checks if a User is registered off-chain
   *
   *  @return {Promise<boolean>} Returns a promise that resolves with true if the User is registered with IMX, false otherwise
   */
  isRegisteredOffchain(): Promise<boolean>;
  /**
   * Checks if a User is registered on-chain
   *
   * @return {Promise<boolean>} Returns a promise that resolves with true if the User is registered, false otherwise
   */
  isRegisteredOnchain(): Promise<boolean>;
  /**
   * Create an Order
   *
   * @param {UnsignedOrderRequest} request The unsigned order request to create an order
   * @return {Promise<CreateOrderResponse>} Returns a promise that resolves with the created Order
   */
  createOrder(request: UnsignedOrderRequest): Promise<imx.CreateOrderResponse>;
  /**
   * Cancel an Order
   *
   * @param {GetSignableCancelOrderRequest} request The signable cancel order request
   * @return {Promise<CancelOrderResponse>} Returns a promise that resolves with the cancelled Order
   */
  cancelOrder(
    request: GetSignableCancelOrderRequest
  ): Promise<imx.CancelOrderResponse>;
  /**
   * Create a Trade
   *
   * @param {GetSignableTradeRequest} request The signable trade request
   * @return {Promise<CreateTradeResponse>} Returns a promise that resolves with the created Trade
   */
  createTrade(request: GetSignableTradeRequest): Promise<CreateTradeResponse>;
  /**
   * Create a new Transfer request
   *
   * @param {UnsignedTransferRequest} request The unsigned transfer request
   * @return {Promise<imx.CreateTransferResponseV1>} Returns a promise that resolves with the created Transfer
   */
  transfer(request: UnsignedTransferRequest): Promise<imx.CreateTransferResponseV1>;
  /**
   * Create a batch of NFT transfer requests
   *
   * @param {Array<NftTransferDetails>} request An array of NFT transfer details
   * @return {Promise<CreateTransferResponse>} Resolves a promise that resolves with the list of Transfer IDs
   */
  batchNftTransfer(
    request: Array<NftTransferDetails>
  ): Promise<imx.CreateTransferResponse>;
  /**
   * Create a new Exchange transaction
   *
   * @param {UnsignedExchangeTransferRequest} request The unsigned exchange transfer request
   * @return {Promise<imx.CreateTransferResponseV1>} Returns a promise that resolves with the created Exchange Transaction
   */
  exchangeTransfer(
    request: UnsignedExchangeTransferRequest
  ): Promise<imx.CreateTransferResponseV1>;
  /**
   * Deposit either ETH, ERC20 or ERC721 tokens
   *
   * @param {TokenAmount} request The token type amount in its corresponding unit
   * @return {Promise<TransactionResponse>} Returns a promise that resolves with the transaction
   */
  deposit(deposit: TokenAmount): Promise<TransactionResponse>;
  /**
   * Create a Withdrawal
   *
   * @param {TokenAmount} request The token type amount in its corresponding unit
   * @return {Promise<CreateWithdrawalResponse>} Returns a promise that resolves with the created Withdrawal
   */
  prepareWithdrawal(request: TokenAmount): Promise<imx.CreateWithdrawalResponse>;
  /**
   * Completes a Withdrawal
   *
   * @param {string} starkPublicKey The stark public key
   * @param {AnyToken} token The token to withdraw
   * @return {Promise<TransactionResponse>} Returns a promise that resolves with the transaction
   */
  completeWithdrawal(
    starkPublicKey: string,
    token: AnyToken
  ): Promise<TransactionResponse>;
}
