/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
import axios, { AxiosResponse } from 'axios';
import { ethers } from 'ethers';
import {
  concat, defaultAbiCoder, hexValue, hexlify, keccak256, zeroPad,
} from 'ethers/lib/utils';
import { ROOT_AXELAR_ADAPTOR } from './contracts/ABIs/RootAxelarBridgeAdaptor';
import {
  checkReceiver, validateBridgeReqArgs, validateChainConfiguration, validateChainIds,
  validateGetFee,
} from './lib/validation';
import {
  getAxelarEndpoint, getAxelarGateway, getChildAdaptor, getChildchain, getRootAdaptor,
  isValidDeposit,
  isValidWithdraw,
  isWithdrawNativeIMX,
  isNativeTokenBridgeFeeRequest,
  isWithdrawWrappedIMX,
  isWrappedIMX,
  shouldBeDepositOrFinaliseWithdraw,
} from './lib/utils';
import { TenderlySimulation } from './types/tenderly';
import { calculateGasFee } from './lib/gas';
import { createContract } from './contracts/createContract';
import { getWithdrawRootToken, genAxelarWithdrawPayload, genUniqueAxelarCommandId } from './lib/axelarUtils';
import { submitTenderlySimulations } from './lib/tenderly';
import {
  NATIVE,
  ETHEREUM_NATIVE_TOKEN_ADDRESS,
  ZKEVM_DEVNET_CHAIN_ID,
  ZKEVM_MAINNET_CHAIN_ID,
  ZKEVM_TESTNET_CHAIN_ID,
  axelarChains,
  bridgeMethods,
  SLOT_PREFIX_CONTRACT_CALL_APPROVED,
  SLOT_POS_CONTRACT_CALL_APPROVED,
} from './constants/bridges';
import { ROOT_ERC20_BRIDGE_FLOW_RATE } from './contracts/ABIs/RootERC20BridgeFlowRate';
import { ERC20 } from './contracts/ABIs/ERC20';
import { BridgeError, BridgeErrorType, withBridgeError } from './errors';
import { CHILD_ERC20_BRIDGE } from './contracts/ABIs/ChildERC20Bridge';
import { BridgeConfiguration } from './config';
import {
  BridgeFeeRequest,
  BridgeFeeResponse,
  BridgeMethodsGasLimit,
  BridgeTxRequest,
  BridgeFeeActions,
  ApproveBridgeRequest,
  ApproveBridgeResponse,
  BridgeTxResponse,
  AxelarChainDetails,
  TokenMappingRequest,
  TokenMappingResponse,
  TxStatusRequest,
  TxStatusResponse,
  StatusResponse,
  FlowRateInfoResponse,
  PendingWithdrawalsRequest,
  PendingWithdrawalsResponse,
  FlowRateWithdrawRequest,
  FlowRateWithdrawResponse,
  FlowRateInfoRequest,
  RootBridgePendingWithdrawal,
  TxStatusResponseItem,
  PendingWithdrawal,
  FungibleToken,
  FlowRateInfoItem,
  TxStatusRequestItem,
  BridgeBundledTxRequest,
  BridgeBundledTxResponse,
  DynamicGasEstimatesResponse,
  BridgeDirection,
} from './types';
import {
  GMPStatus, GMPStatusResponse, GasPaidStatus,
} from './types/axelar';
import { queryTransactionStatus } from './lib/gmpRecovery';

/**
 * Represents a token bridge, which manages asset transfers between two chains.
 */
export class TokenBridge {
  /**
   * @property {BridgeConfiguration} config - The bridge configuration object.
   */
  private config: BridgeConfiguration;

  /**
   * @property {boolean} initialised - Flag to indicate whether this token bridge has been initialised.
   */
  private initialised: boolean;

  /**
   * Constructs a TokenBridge instance.
   *
   * @param {BridgeConfiguration} config - The bridge configuration object.
   */
  constructor(config: BridgeConfiguration) {
    this.config = config;
    this.initialised = false;
  }

  /**
   * Initialise the TokenBridge instance.
   */
  public async initialise(): Promise<void> {
    if (!this.initialised) {
      await validateChainConfiguration(this.config);
      this.initialised = true;
    }
  }

  /**
   * Retrieves the bridge fee for a specific token.
   *
   * @param {BridgeFeeRequest} req - The fee request object containing the token address for which the fee is required.
   * @returns {Promise<BridgeFeeResponse>} - A promise that resolves to an object containing the bridge fee for the specified
   * token and a flag indicating if the token is bridgeable.
   * @throws {BridgeError} - If an error occurs during the fee retrieval, a BridgeError will be thrown with a specific error type.
   *
   * Possible BridgeError types include:
   * - INVALID_ADDRESS: The token address provided in the request is invalid.
   *
   * @example
   * const feeRequest = {
   *   action: 'WITHDRAW', // BridgeFeeActions
   *   gasMultiplier: 1.2, // Buffer to add to the gas estimate, 1.2 = 20% buffer
   *   sourceChainId: '13371', // Immutable zkEVM
   *   destinationChainId: '1' // Ethereum
   * };
   *
   * @example
   * const feeRequest = {
   *   action: 'DEPOSIT', // BridgeFeeActions
   *   gasMultiplier: 1.2, // Buffer to add to the gas estimate, 1.2 = 20% buffer
   *   sourceChainId: '1', // Ethereum
   *   destinationChainId: '13371', // Immutable zkEVM
   * };
   *
   * bridgeSdk.getFee(feeRequest)
   *   .then((feeResponse) => {
   *     console.log('Source chain gas fee:', feeResponse.sourceChainFee);
   *     console.log('Destination chain gas fee:', feeResponse.destinationChainFee);
   *     console.log('Axelar bridge fee (includes destination execution):', feeResponse.bridgeFee);
   *     console.log('Immutable fee:', feeResponse.networkFee);
   *     console.log('Total Fees (sourceChainFee + bridgeFee + networkFee):', feeResponse.totalFee);
   *   })
   *   .catch((error) => {
   *     console.error('Error:', error.message);
   *   });
   */
  public async getFee(req: BridgeFeeRequest): Promise<BridgeFeeResponse> {
    const [, , res] = await Promise.all([
      this.initialise(),
      async () => {
        if (req.action !== BridgeFeeActions.FINALISE_WITHDRAWAL) {
          await validateChainIds(req.sourceChainId, req.destinationChainId, this.config);
        }
      },
      this.getFeePrivate(req),
    ]);
    return res;
  }

  private async getFinaliseWithdrawFee(): Promise<ethers.BigNumber> {
    const feeData = await this.config.rootProvider.getFeeData();
    const sourceChainFee = calculateGasFee(feeData, BridgeMethodsGasLimit.FINALISE_WITHDRAWAL);
    return sourceChainFee;
  }

  private async getDepositOrWithdrawFee(req: BridgeFeeRequest):
    Promise<{ sourceChainFee: ethers.BigNumber, approvalFee: ethers.BigNumber, bridgeFee: ethers.BigNumber }> {
    let feeData;
    if (req.sourceChainId === this.config.bridgeInstance.rootChainID) {
      feeData = await this.config.rootProvider.getFeeData();
    } else {
      feeData = await this.config.childProvider.getFeeData();
    }

    let sourceChainFee: ethers.BigNumber = ethers.BigNumber.from(0);
    let approvalFee: ethers.BigNumber = ethers.BigNumber.from(0);
    let bridgeFee: ethers.BigNumber = ethers.BigNumber.from(0);

    let direction: BridgeDirection;
    if (req.action === BridgeFeeActions.DEPOSIT) {
      direction = {
        sourceChainId: req.sourceChainId,
        destinationChainId: req.destinationChainId,
        action: BridgeFeeActions.DEPOSIT,
      };
    } else if (req.action === BridgeFeeActions.WITHDRAW) {
      direction = {
        sourceChainId: req.sourceChainId,
        destinationChainId: req.destinationChainId,
        action: BridgeFeeActions.WITHDRAW,
      };
    } else {
      // Throws if you call this function when action is FINALISE_WITHDRAW
      throw new BridgeError('Invalid action', BridgeErrorType.INTERNAL_ERROR);
    }

    if (
      !(isValidDeposit(direction, this.config.bridgeInstance) || isValidWithdraw(direction, this.config.bridgeInstance))
    ) {
      throw new BridgeError('Invalid direction', BridgeErrorType.INTERNAL_ERROR);
    }

    // Get approval fee
    if (!isNativeTokenBridgeFeeRequest(req)) {
      if (isValidDeposit(direction, this.config.bridgeInstance)) {
        approvalFee = calculateGasFee(feeData, BridgeMethodsGasLimit.APPROVE_TOKEN);
      } else if (isWithdrawWrappedIMX(req.token, direction, this.config.bridgeInstance)) {
        // On child chain, only WIMX requires approval.
        approvalFee = calculateGasFee(feeData, BridgeMethodsGasLimit.APPROVE_TOKEN);
      }
    }

    // Get source fee & bridge fee
    let axelarGasLimit;
    if (req.action === BridgeFeeActions.DEPOSIT) {
      sourceChainFee = calculateGasFee(feeData, BridgeMethodsGasLimit.DEPOSIT_SOURCE);
      axelarGasLimit = BridgeMethodsGasLimit.DEPOSIT_DESTINATION;
    } else {
      sourceChainFee = calculateGasFee(feeData, BridgeMethodsGasLimit.WITHDRAW_SOURCE);
      axelarGasLimit = BridgeMethodsGasLimit.WITHDRAW_DESTINATION;
    }
    // Get bridge fee
    bridgeFee = await this.getAxelarFee(
      req.sourceChainId,
      req.destinationChainId,
      axelarGasLimit,
      req.gasMultiplier,
    );
    return { sourceChainFee, approvalFee, bridgeFee };
  }

  private async getFeePrivate(req: BridgeFeeRequest): Promise<BridgeFeeResponse> {
    validateGetFee(req, this.config);

    let sourceChainFee: ethers.BigNumber = ethers.BigNumber.from(0);
    let approvalFee: ethers.BigNumber = ethers.BigNumber.from(0);
    let bridgeFee: ethers.BigNumber = ethers.BigNumber.from(0);

    if (req.action === BridgeFeeActions.FINALISE_WITHDRAWAL) {
      sourceChainFee = await this.getFinaliseWithdrawFee();
    } else {
      const fees = await this.getDepositOrWithdrawFee(req);
      sourceChainFee = fees.sourceChainFee;
      approvalFee = fees.approvalFee;
      bridgeFee = fees.bridgeFee;
    }

    const totalFees: ethers.BigNumber = sourceChainFee.add(approvalFee).add(bridgeFee);

    const imtblFee = ethers.BigNumber.from('0'); // This currently only exists for interface compatibility

    return {
      sourceChainGas: sourceChainFee,
      approvalFee,
      bridgeFee,
      imtblFee,
      totalFees,
    };
  }

  /**
   * Retrieves the unsigned approval transaction for deposit or withdrawal.
   * Approval is required before depositing or withdrawing tokens to the bridge using
   *
   * @param {ApproveBridgeRequest} req - The approve bridge request object.
   * @returns {Promise<ApproveBridgeResponse>} - A promise that resolves to an object containing the unsigned
   * approval transaction or null if no approaval is required.
   * @throws {BridgeError} - If an error occurs during the transaction creation, a BridgeError will be thrown with a specific error type.
   *
   * Possible BridgeError types include:
   * - UNSUPPORTED_ERROR: The operation is not supported. Currently thrown when attempting to deposit native tokens.
   * - INVALID_ADDRESS: An Ethereum address provided in the request is invalid.
   * - INVALID_AMOUNT: The deposit amount provided in the request is invalid (less than or equal to 0).
   * - INTERNAL_ERROR: An unexpected error occurred during the execution, likely due to the bridge SDK implementation.
   * - PROVIDER_ERROR: An error occurred while interacting with the Ethereum provider. This includes issues calling the ERC20 smart contract
   *
   * @example
   * const approveDepositRequest = {
   *   senderAddress: '0x123456...', // Senders address
   *   token: '0xabcdef...', // ERC20 token address
   *   amount: ethers.utils.parseUnits('100', 18), // amount being bridged in token's smallest unit (e.g., wei for Ether)
   *   sourceChainId: '1', // Ethereum
   *   destinationChainId: '13371', // Immutable zkEVM
   * };
   *
   * @example
   * const approveWithdrawalRequest = {
   *   senderAddress: '0x123456...', // Senders address
   *   token: '0xabcdef...', // ERC20 token address
   *   amount: ethers.utils.parseUnits('100', 18), // amount being bridged in token's smallest unit (e.g., wei for Ether)
   *   sourceChainId: '13371', // Immutable zkEVM
   *   destinationChainId: '1', // Ethereum
   * };
   *
   * bridgeSdk.getUnsignedApproveBridgeTx(approveDepositRequest)
   *   .then((approveResponse) => {
   *     if (approveResponse.unsignedTx !== null) {
   *       // Send the unsigned approval transaction to the depositor to sign and send
   *     } else {
   *      // No approval is required
   *     }
   *   })
   *   .catch((error) => {
   *     console.error('Error:', error.message);
   *   });
   */
  public async getUnsignedApproveBridgeTx(
    req: ApproveBridgeRequest,
  ): Promise<ApproveBridgeResponse> {
    const res = await this.getUnsignedBridgeBundledTx({
      senderAddress: req.senderAddress,
      recipientAddress: req.senderAddress,
      token: req.token,
      amount: req.amount,
      sourceChainId: req.sourceChainId,
      destinationChainId: req.destinationChainId,
      gasMultiplier: 1.1,
    });
    return {
      contractToApprove: res.contractToApprove,
      unsignedTx: res.unsignedApprovalTx,
    };
  }

  /**
   * Get the smart contract function names depending on whether the request is a deposit or withdrawal.
   */
  private async getBridgeMethods(direction: BridgeDirection) {
    let contractMethods: Record<string, string>;
    if (isValidDeposit(direction, this.config.bridgeInstance)) {
      contractMethods = bridgeMethods.deposit;
    } else {
      contractMethods = bridgeMethods.withdraw;
    }

    return contractMethods;
  }

  /**
   * Get the bridge contract which will be interacted with. Root bridge if deposit, child bridge if withdrawal.
   */
  private async getBridgeContract(direction: BridgeDirection) {
    if (isValidDeposit(direction, this.config.bridgeInstance)) {
      const rootBridgeAddress = this.config.bridgeContracts.rootERC20BridgeFlowRate;
      return await createContract(rootBridgeAddress, ROOT_ERC20_BRIDGE_FLOW_RATE, this.config.rootProvider);
    }
    const childBridgeAddress = this.config.bridgeContracts.childERC20Bridge;
    return await createContract(childBridgeAddress, CHILD_ERC20_BRIDGE, this.config.childProvider);
  }

  /**
   * Get the transaction data for a bridge transaction.
   * This will either be a deposit or withdraw, with either the native token or an ERC20 token,
   * and either to the sender or to a different address.
   * This means there are 8 possible transactions:
   *     - Deposit native token
   *     - Deposit native token TO
   *     - Deposit ERC20 token
   *     - Deposit ERC20 token TO
   *     - Withdraw native token
   *     - Withdraw native token TO
   *     - Withdraw ERC20 token
   *     - Withdraw ERC20 token TO
   * @param sender Bridge depositer/withdrawer
   * @param recipient Deposit or withdrawal recipient
   * @param amount Amount to deposit or withdraw
   * @param token Token to deposit or withdraw. NATIVE if native asset on the source chain.
   * @param sourceChainId Chain ID of the source chain
   * @returns calldata for the requested bridge transaction (i.e. tx.data)
   */
  private async getTxData(
    sender: string,
    recipient: string,
    amount: ethers.BigNumber,
    token: string,
    direction: BridgeDirection,
  ) {
    const currentBridgeMethods = await this.getBridgeMethods(direction);
    const bridgeContract = await this.getBridgeContract(direction);

    let functionName: string;
    let parameters: any[];
    /**
     * Handle bridge transaction for native token
     */
    if (token.toUpperCase() === NATIVE) {
      if (sender === recipient) {
        // Deposit or withdraw native token
        functionName = currentBridgeMethods.native;
        parameters = [amount];
      } else {
        // Deposit or withdraw native token TO
        functionName = currentBridgeMethods.nativeTo;
        parameters = [recipient, amount];
      }
    } else {
      /**
       * Handle bridge transaction for ERC20
       */
      const erc20Token = ethers.utils.getAddress(token);
      if (sender === recipient) {
        // Deposit or withdraw ERC20
        functionName = currentBridgeMethods.token;
        parameters = [erc20Token, amount];
      } else {
        // Deposit or withdraw ERC20 TO.
        functionName = currentBridgeMethods.tokenTo;
        parameters = [erc20Token, recipient, amount];
      }
    }

    return await withBridgeError<string>(async () => bridgeContract.interface.encodeFunctionData(
      functionName,
      parameters,
    ), BridgeErrorType.INTERNAL_ERROR);
  }

  /**
   * Generates an unsigned deposit or withdrawal transaction for a user to sign and submit to the bridge.
   * Must be called after bridgeSdk.getUnsignedApproveBridgeTx to ensure user has approved sufficient tokens for deposit.
   *
   * @param {BridgeTxRequest} req - The tx request object containing the required data for depositing or withdrawing tokens.
   * @returns {Promise<BridgeTxResponse>} - A promise that resolves to an object containing the fee data and unsigned transaction data.
   * @throws {BridgeError} - If an error occurs during the generation of the unsigned transaction, a BridgeError
   * will be thrown with a specific error type.
   *
   * Possible BridgeError types include:
   * - UNSUPPORTED_ERROR: The operation is not supported. Currently thrown when attempting to deposit native tokens.
   * - INVALID_ADDRESS: An Ethereum address provided in the request is invalid. This could be the depositor's,
   * recipient's or the token's address.
   * - INVALID_AMOUNT: The deposit amount provided in the request is invalid (less than or equal to 0).
   * - INTERNAL_ERROR: An unexpected error occurred during the execution, likely due to the bridge SDK implementation.
   *
   * @example
   * const depositERC20Request = {
   *   senderAddress: '0x123456...', // Senders address
   *   recipientAddress: '0x123456...', // Recipient address
   *   token: '0x123456...', // ERC20 token address
   *   amount: ethers.utils.parseUnits('100', 18), // Bridge amount in wei
   *   sourceChainId: '1', // Ethereum
   *   destinationChainId: '13371', // Immutable zkEVM
   *   gasMultiplier: 1.2, // Buffer to add to the gas estimate, 1.2 = 20% buffer
   * };
   *
   * @example
   * const depositEtherTokenRequest = {
   *   senderAddress: '0x123456...', // Senders address
   *   recipientAddress: '0x123456...', // Recipient address
   *   token: 'NATIVE', // The chain's native token
   *   amount: ethers.utils.parseUnits('100', 18), // Bridge amount in wei
   *   sourceChainId: '1', // Ethereum
   *   destinationChainId: '13371', // Immutable zkEVM
   *   gasMultiplier: 1.2, // Buffer to add to the gas estimate, 1.2 = 20% buffer
   * };
   *
   * @example
   * const withdrawERC20Request = {
   *   senderAddress: '0x123456...', // Senders address
   *   recipientAddress: '0x123456...', // Recipient address
   *   token: '0x123456...', // ERC20 token address
   *   amount: ethers.utils.parseUnits('100', 18), // Bridge amount in wei
   *   sourceChainId: '13371', // Immutable zkEVM
   *   destinationChainId: '1', // Ethereum
   *   gasMultiplier: 1.2, // Buffer to add to the gas estimate, 1.2 = 20% buffer
   * };
   *
   * @example
   * const withdrawIMXTokenRequest = {
   *   senderAddress: '0x123456...', // Senders address
   *   recipientAddress: '0x123456...', // Recipient address
   *   token: 'NATIVE', // The chain's native token
   *   amount: ethers.utils.parseUnits('100', 18), // Bridge amount in wei
   *   sourceChainId: '13371', // Immutable zkEVM
   *   destinationChainId: '1', // Ethereum
   *   gasMultiplier: 1.2, // Buffer to add to the gas estimate, 1.2 = 20% buffer
   * };
   *
   * bridgeSdk.getUnsignedBridgeTx(depositERC20Request)
   *   .then((depositResponse) => {
   *     console.log('Fee Data', depositResponse.feeData);
   *     console.log('Unsigned Tx', depositResponse.unsignedTx);
   *   })
   *   .catch((error) => {
   *     console.error('Error:', error.message);
   *   });
   */
  public async getUnsignedBridgeTx(
    req: BridgeTxRequest,
  ): Promise<BridgeTxResponse> {
    const res = await this.getUnsignedBridgeBundledTx({
      senderAddress: req.senderAddress,
      recipientAddress: req.senderAddress,
      token: req.token,
      amount: req.amount,
      sourceChainId: req.sourceChainId,
      destinationChainId: req.destinationChainId,
      gasMultiplier: req.gasMultiplier,
    });
    return {
      feeData: res.feeData,
      unsignedTx: res.unsignedBridgeTx,
    };
  }

  /**
   * Generates the optional approval transaction AND an unsigned deposit or withdrawal transaction for a user to sign
   * and submit to the bridge.
   * It is the combination of bridgeSdk.getUnsignedApproveBridgeTx and bridgeSdk.getUnsignedBridgeTx.
   *
   * @param {BridgeBundledTxRequest} req - The tx request object containing the required data for depositing or withdrawing tokens.
   * @returns {Promise<BridgeBundledTxResponse>} - A promise that resolves to an object containing the optional contract to approve,
   * optional unsigned approval transaction, fee data and unsigned transaction data.
   * @throws {BridgeError} - If an error occurs during the generation of the unsigned transaction, a BridgeError
   * will be thrown with a specific error type.
   *
   * Possible BridgeError types include:
   * - UNSUPPORTED_ERROR: The operation is not supported. Currently thrown when attempting to deposit native tokens.
   * - INVALID_ADDRESS: An Ethereum address provided in the request is invalid. This could be the depositor's,
   * recipient's or the token's address.
   * - INVALID_AMOUNT: The deposit amount provided in the request is invalid (less than or equal to 0).
   * - INTERNAL_ERROR: An unexpected error occurred during the execution, likely due to the bridge SDK implementation.
   *
   * @example
   * const depositERC20Request = {
   *   senderAddress: '0x123456...', // Senders address
   *   recipientAddress: '0x123456...', // Recipient address
   *   token: '0x123456...', // ERC20 token address
   *   amount: ethers.utils.parseUnits('100', 18), // Bridge amount in wei
   *   sourceChainId: '1', // Ethereum
   *   destinationChainId: '13371', // Immutable zkEVM
   *   gasMultiplier: 1.2, // Buffer to add to the gas estimate, 1.2 = 20% buffer
   * };
   *
   * @example
   * const depositEtherTokenRequest = {
   *   senderAddress: '0x123456...', // Senders address
   *   recipientAddress: '0x123456...', // Recipient address
   *   token: 'NATIVE', // The chain's native token
   *   amount: ethers.utils.parseUnits('100', 18), // Bridge amount in wei
   *   sourceChainId: '1', // Ethereum
   *   destinationChainId: '13371', // Immutable zkEVM
   *   gasMultiplier: 1.2, // Buffer to add to the gas estimate, 1.2 = 20% buffer
   * };
   *
   * @example
   * const withdrawERC20Request = {
   *   senderAddress: '0x123456...', // Senders address
   *   recipientAddress: '0x123456...', // Recipient address
   *   token: '0x123456...', // ERC20 token address
   *   amount: ethers.utils.parseUnits('100', 18), // Bridge amount in wei
   *   sourceChainId: '13371', // Immutable zkEVM
   *   destinationChainId: '1', // Ethereum
   *   gasMultiplier: 1.2, // Buffer to add to the gas estimate, 1.2 = 20% buffer
   * };
   *
   * @example
   * const withdrawIMXTokenRequest = {
   *   senderAddress: '0x123456...', // Senders address
   *   recipientAddress: '0x123456...', // Recipient address
   *   token: 'NATIVE', // The chain's native token
   *   amount: ethers.utils.parseUnits('100', 18), // Bridge amount in wei
   *   sourceChainId: '13371', // Immutable zkEVM
   *   destinationChainId: '1', // Ethereum
   *   gasMultiplier: 1.2, // Buffer to add to the gas estimate, 1.2 = 20% buffer
   * };
   *
   * bridgeSdk.getUnsignedBridgeBundledTx(depositERC20Request)
   *   .then((depositResponse) => {
   *     console.log('Fee Data', depositResponse.feeData);
   *     console.log('Optional contract to approve', depositResponse.contractToApprove);
   *     console.log('Optional unsigned approval Tx', depositResponse.unsignedApprovalTx);
   *     console.log('Unsigned bridge Tx', depositResponse.unsignedBridgeTx);
   *   })
   *   .catch((error) => {
   *     console.error('Error:', error.message);
   *   });
   */
  public async getUnsignedBridgeBundledTx(req: BridgeBundledTxRequest): Promise<BridgeBundledTxResponse> {
    const [, , , res] = await Promise.all([
      this.initialise(), // Initialisation will only be exeucted once
      validateBridgeReqArgs(req, this.config),
      checkReceiver(req.token, req.destinationChainId, req.recipientAddress, this.config),
      this.getUnsignedBridgeBundledTxPrivate(req),
    ]);
    return res;
  }

  private async getUnsignedBridgeBundledTxPrivate(req: BridgeBundledTxRequest): Promise<BridgeBundledTxResponse> {
    let direction: BridgeDirection;
    if (shouldBeDepositOrFinaliseWithdraw(req.sourceChainId, this.config.bridgeInstance)) {
      direction = {
        sourceChainId: req.sourceChainId,
        destinationChainId: req.destinationChainId,
        action: BridgeFeeActions.DEPOSIT,
      };
    } else {
      direction = {
        sourceChainId: req.sourceChainId,
        destinationChainId: req.destinationChainId,
        action: BridgeFeeActions.WITHDRAW,
      };
    }

    if (isValidDeposit(direction, this.config.bridgeInstance)) {
      return this.getUnsignedBridgeDepositBundledTxPrivate(
        direction,
        req.senderAddress,
        req.recipientAddress,
        req.token,
        req.amount,
        req.gasMultiplier,
      );
    }
    if (isValidWithdraw(direction, this.config.bridgeInstance)) {
      // Withdraw request
      return this.getUnsignedBridgeWithdrawBundledTxPrivate(
        direction,
        req.senderAddress,
        req.recipientAddress,
        req.token,
        req.amount,
        req.gasMultiplier,
      );
    }

    throw new BridgeError('Invalid Bridge Bundled TX', BridgeErrorType.INVALID_TRANSACTION);
  }

  private async getUnsignedBridgeDepositBundledTxPrivate(
    direction: BridgeDirection,
    sender: string,
    recipient: string,
    token: FungibleToken,
    amount: ethers.BigNumber,
    gasMultiplier: number | string,
  ): Promise<BridgeBundledTxResponse> {
    const [allowance, feeData, rootGas, axelarFee] = await Promise.all([
      this.getAllowance(direction, token, sender),
      this.config.rootProvider.getFeeData(),
      this.getDynamicDepositGas(this.config.bridgeInstance.rootChainID, sender, recipient, token, amount),
      this.getAxelarFee(
        this.config.bridgeInstance.rootChainID,
        this.config.bridgeInstance.childChainID,
        BridgeMethodsGasLimit.DEPOSIT_DESTINATION,
        gasMultiplier,
      ),
    ]);

    let contractToApprove: string | null;
    let unsignedApprovalTx: ethers.providers.TransactionRequest | null;
    let sourceChainFee: ethers.BigNumber = ethers.BigNumber.from(0);
    let approvalFee: ethers.BigNumber = ethers.BigNumber.from(0);
    const bridgeFee: ethers.BigNumber = axelarFee;
    const imtblFee: ethers.BigNumber = ethers.BigNumber.from(0);

    // Approval required for non-native tokens with insufficient allowance.
    if (token.toUpperCase() !== NATIVE && allowance.lt(amount)) {
      contractToApprove = token;
      const erc20Contract = await createContract(token, ERC20, this.config.rootProvider);
      const data: string = await withBridgeError<string>(async () => erc20Contract.interface
        .encodeFunctionData('approve', [
          this.config.bridgeContracts.rootERC20BridgeFlowRate,
          amount,
        ]), BridgeErrorType.INTERNAL_ERROR);
      unsignedApprovalTx = {
        data,
        to: token,
        value: 0,
        from: sender,
        chainId: parseInt(this.config.bridgeInstance.rootChainID, 10),
      };
      approvalFee = calculateGasFee(feeData, rootGas.approvalGas);
    } else {
      contractToApprove = null;
      unsignedApprovalTx = null;
    }

    // Deposit transaction & fees.
    const txData = await this.getTxData(
      sender,
      recipient,
      amount,
      token,
      direction,
    );
    const txValue = (token.toUpperCase() === NATIVE)
      ? amount.add(bridgeFee).toString() : bridgeFee.toString();
    const unsignedBridgeTx: ethers.providers.TransactionRequest = {
      data: txData,
      to: this.config.bridgeContracts.rootERC20BridgeFlowRate,
      value: txValue,
      from: sender,
      chainId: parseInt(this.config.bridgeInstance.rootChainID, 10),
    };
    sourceChainFee = calculateGasFee(feeData, rootGas.sourceChainGas);

    const totalFees: ethers.BigNumber = sourceChainFee.add(approvalFee).add(bridgeFee).add(imtblFee);

    return {
      feeData: {
        sourceChainGas: sourceChainFee,
        approvalFee,
        bridgeFee,
        imtblFee,
        totalFees,
      },
      contractToApprove,
      unsignedApprovalTx,
      unsignedBridgeTx,
    };
  }

  private async getUnsignedBridgeWithdrawBundledTxPrivate(
    direction: BridgeDirection,
    sender: string,
    recipient: string,
    token: FungibleToken,
    amount: ethers.BigNumber,
    gasMultiplier: number | string,
  ): Promise<BridgeBundledTxResponse> {
    const [allowance, feeData, rootGas] = await Promise.all([
      this.getAllowance(direction, token, sender),
      this.config.childProvider.getFeeData(),
      await this.getDynamicWithdrawGasRootChain(
        direction.destinationChainId,
        sender,
        recipient,
        token,
        amount,
      ),
    ]);
    // Get axelar fee
    const axelarFee = await this.getAxelarFee(
      this.config.bridgeInstance.childChainID,
      this.config.bridgeInstance.rootChainID,
      rootGas,
      gasMultiplier,
    );

    let contractToApprove: string | null;
    let unsignedApprovalTx: ethers.providers.TransactionRequest | null;
    let sourceChainFee: ethers.BigNumber = ethers.BigNumber.from(0);
    let approvalFee: ethers.BigNumber = ethers.BigNumber.from(0);
    const bridgeFee: ethers.BigNumber = axelarFee;
    const imtblFee: ethers.BigNumber = ethers.BigNumber.from(0);

    // Approval required only for WIMX tokens with insufficient allowance.
    if (isWrappedIMX(token, this.config.bridgeInstance.childChainID) && allowance.lt(amount)) {
      contractToApprove = token;
      const erc20Contract = await createContract(token, ERC20, this.config.childProvider);
      const data: string = await withBridgeError<string>(async () => erc20Contract.interface
        .encodeFunctionData('approve', [
          this.config.bridgeContracts.childERC20Bridge,
          amount,
        ]), BridgeErrorType.INTERNAL_ERROR);
      unsignedApprovalTx = {
        data,
        to: token,
        value: 0,
        from: sender,
        chainId: parseInt(this.config.bridgeInstance.childChainID, 10),
      };
      approvalFee = calculateGasFee(feeData, BridgeMethodsGasLimit.APPROVE_TOKEN);
    } else {
      contractToApprove = null;
      unsignedApprovalTx = null;
    }

    // Withdraw transaction & fees.
    const txData = await this.getTxData(
      sender,
      recipient,
      amount,
      token,
      direction,
    );
    const txValue = (token.toUpperCase() === NATIVE)
      ? amount.add(bridgeFee).toString() : bridgeFee.toString();
    const unsignedBridgeTx: ethers.providers.TransactionRequest = {
      data: txData,
      to: this.config.bridgeContracts.rootERC20BridgeFlowRate,
      value: txValue,
      from: sender,
      chainId: parseInt(this.config.bridgeInstance.rootChainID, 10),
    };
    sourceChainFee = calculateGasFee(feeData, BridgeMethodsGasLimit.WITHDRAW_SOURCE);

    const totalFees: ethers.BigNumber = sourceChainFee.add(approvalFee).add(bridgeFee).add(imtblFee);

    return {
      feeData: {
        sourceChainGas: sourceChainFee,
        approvalFee,
        bridgeFee,
        imtblFee,
        totalFees,
      },
      contractToApprove,
      unsignedApprovalTx,
      unsignedBridgeTx,
    };
  }

  private async getDynamicDepositGas(
    sourceChainId: string,
    sender: string,
    recipient: string,
    token: FungibleToken,
    amount: ethers.BigNumber,
  ): Promise<DynamicGasEstimatesResponse> {
    const simulations: Array<TenderlySimulation> = [];

    // Encode approval function for non-native tokens.
    if (token.toUpperCase() !== NATIVE) {
      // Get erc20 contract
      const erc20Contract = await createContract(token, ERC20, this.config.rootProvider);

      // Encode function data
      const txData = await withBridgeError<string>(async () => erc20Contract.interface
        .encodeFunctionData('approve', [
          this.config.bridgeContracts.rootERC20BridgeFlowRate,
          amount,
        ]), BridgeErrorType.INTERNAL_ERROR);

      simulations.push({
        from: sender,
        to: token,
        data: txData,
      });
    }

    const direction: BridgeDirection = {
      action: BridgeFeeActions.DEPOSIT,
      sourceChainId,
      destinationChainId: this.config.bridgeInstance.childChainID,
    };

    // Get tx data
    const txData = await this.getTxData(
      sender,
      recipient,
      amount,
      token,
      direction,
    );

    // tx value for simulation mocked as amount + 1 wei for a native bridge and 1 wei for token bridges
    // hexValue() is required to remove leading zeros, which tenderly does not support.
    const txValue = (token.toUpperCase() !== NATIVE) ? '0x1' : hexValue(amount.add('1').toHexString());

    simulations.push({
      from: sender,
      to: this.config.bridgeContracts.rootERC20BridgeFlowRate,
      data: txData,
      value: txValue,
    });

    // TODO this specific branch does not have tests written
    const gas = await submitTenderlySimulations(sourceChainId, simulations);
    const tenderlyGasEstimatesRes = {} as DynamicGasEstimatesResponse;
    if (gas.length === 1) {
      tenderlyGasEstimatesRes.approvalGas = 0;
      [tenderlyGasEstimatesRes.sourceChainGas] = gas;
    } else {
      [tenderlyGasEstimatesRes.approvalGas, tenderlyGasEstimatesRes.sourceChainGas] = gas;
    }
    return tenderlyGasEstimatesRes;
  }

  /**
   * Use Tenderly simulations to estimate the gas cost of the destination (root) chain transaction of a withdraw
   */
  private async getDynamicWithdrawGasRootChain(
    destinationChainId: string,
    sender: string,
    recipient: string,
    token: FungibleToken,
    amount: ethers.BigNumber,
  ): Promise<number> {
    const rootToken = await getWithdrawRootToken(token, destinationChainId, this.config.childProvider);
    const payload = genAxelarWithdrawPayload(
      rootToken,
      sender,
      recipient,
      amount.toString(),
    );
    const commandId = genUniqueAxelarCommandId(payload);
    const sourceChain = getChildchain(destinationChainId);
    const sourceAddress = ethers.utils.getAddress(getChildAdaptor(destinationChainId)).toString();
    const destinationAddress = getRootAdaptor(destinationChainId);
    const payloadHash = keccak256(payload);

    // Calculate slot key for given command ID.
    const command = defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'string', 'string', 'address', 'bytes32'],
      [SLOT_PREFIX_CONTRACT_CALL_APPROVED, commandId, sourceChain, sourceAddress, destinationAddress, payloadHash],
    );
    const commandHash = keccak256(command);
    const slot = keccak256(concat([commandHash, hexlify(zeroPad(hexlify(SLOT_POS_CONTRACT_CALL_APPROVED), 32))]));

    // Encode execute data
    const axelarAdapterContract = await createContract(
      destinationAddress,
      ROOT_AXELAR_ADAPTOR,
      this.config.rootProvider,
    );
    const executeData = await withBridgeError<string>(
      async () => axelarAdapterContract.interface
        .encodeFunctionData('execute', [commandId, sourceChain, sourceAddress, payload]),
      BridgeErrorType.INTERNAL_ERROR,
    );

    // Build simulation
    const axelarGateway = getAxelarGateway(destinationChainId);
    const simulations: Array<TenderlySimulation> = [{
      from: sender,
      to: destinationAddress,
      data: executeData,
    }];

    const gas = await submitTenderlySimulations(destinationChainId, simulations, {
      [axelarGateway]: {
        stateDiff: {
          // Override storage to approve this command.
          [slot]: '0x0000000000000000000000000000000000000000000000000000000000000001',
        },
      },
    });
    return gas[0];
  }

  private async getAllowance(direction: BridgeDirection, token: string, sender: string): Promise<ethers.BigNumber> {
    if (token.toUpperCase() === NATIVE) {
      // Return immediately for native token.
      return ethers.BigNumber.from(0);
    }
    if (isWithdrawNativeIMX(token, direction, this.config.bridgeInstance)) {
      // Return immediately for non wrapped IMX on child chain.
      return ethers.BigNumber.from(0);
    }

    let provider: ethers.providers.Provider;
    let bridgeContract: string;
    if (isValidDeposit(direction, this.config.bridgeInstance)) {
      provider = this.config.rootProvider;
      bridgeContract = this.config.bridgeContracts.rootERC20BridgeFlowRate;
    } else {
      provider = this.config.childProvider;
      bridgeContract = this.config.bridgeContracts.childERC20Bridge;
    }

    const erc20Contract: ethers.Contract = await createContract(token, ERC20, provider);

    return await withBridgeError<ethers.BigNumber>(() => erc20Contract
      .allowance(
        sender,
        bridgeContract,
      ), BridgeErrorType.PROVIDER_ERROR);
  }

  /**
 * Query the axelar fee for a transaction using axelarjs-sdk.
 * @param {*} sourceChainId - The source chainId.
 * @param {*} destinationChainId - The destination chainId.
 * @param {*} destinationChainGaslimit - The gas limit for the desired operation.
 * @param {*} gasMultiplier - The gas multiplier to add buffer to the fees.
 * @returns {ethers.BigNumber} - The Axelar Gas amount in the source chain currency.
 */
  private async getAxelarFee(
    sourceChainId: string,
    destinationChainId: string,
    destinationChainGaslimit: number,
    gasMultiplier: number | string = 'auto',
  ): Promise<ethers.BigNumber> {
    const sourceAxelar: AxelarChainDetails = axelarChains[sourceChainId];
    const destinationAxelar: AxelarChainDetails = axelarChains[destinationChainId];

    if (!sourceAxelar) {
      throw new BridgeError(
        `Source chainID ${sourceChainId} can not be matched to an Axelar chain.`,
        BridgeErrorType.AXELAR_CHAIN_NOT_FOUND,
      );
    }

    if (!destinationAxelar) {
      throw new BridgeError(
        `Destination chainID ${destinationChainId} can not be matched to an Axelar chain.`,
        BridgeErrorType.AXELAR_CHAIN_NOT_FOUND,
      );
    }

    const axelarAPIEndpoint: string = getAxelarEndpoint(sourceChainId);

    const estimateGasReq = {
      method: 'estimateGasFee',
      sourceChain: sourceAxelar.id,
      destinationChain: destinationAxelar.id,
      symbol: sourceAxelar.symbol,
      gasLimit: destinationChainGaslimit,
      gasMultiplier,
    };

    let axiosResponse: AxiosResponse;

    try {
      axiosResponse = await axios.post(axelarAPIEndpoint, estimateGasReq);
    } catch (error: any) {
      axiosResponse = error.response;
    }

    if (axiosResponse.data.error) {
      throw new BridgeError(
        `Estimating Axelar Gas failed with the reason: ${axiosResponse.data.message}`,
        BridgeErrorType.AXELAR_GAS_ESTIMATE_FAILED,
      );
    }

    try {
      return ethers.BigNumber.from(`${axiosResponse.data}`);
    } catch (err) {
      throw new BridgeError(
        `Estimating Axelar Gas failed with the reason: ${err}`,
        BridgeErrorType.AXELAR_GAS_ESTIMATE_FAILED,
      );
    }
  }

  /**
 * Queries the status of a bridge transaction.
 *
 * @param {TxStatusRequest} req - The request object containing an array of transactions to query.
 * @returns {Promise<TxStatusResponse>} - A promise that resolves to an array of transaction statuses.
 * @throws {BridgeError} - If an error occurs during the query, a BridgeError will be thrown with a specific error type.
 */
  public async getTransactionStatus(req: TxStatusRequest): Promise<TxStatusResponse> {
    const txStatusResponse: TxStatusResponse = {
      transactions: [],
    };

    const txStatusItems = await this.getAxelarStatus(req.transactions, req.sourceChainId);

    const uniqueReceivers = await this.getUniqueReceivers(txStatusItems, req.sourceChainId);

    const pendingWithdrawalPromises: Array<Promise<PendingWithdrawalsResponse>> = [];

    for (const address of uniqueReceivers) {
      pendingWithdrawalPromises.push(this.getPendingWithdrawals({ recipient: address }));
    }

    let pendingWithdrawalResponses: Array<PendingWithdrawalsResponse> = [];

    try {
      pendingWithdrawalResponses = await Promise.all(pendingWithdrawalPromises);
    } catch (err) {
      throw new BridgeError(
        `Failed to fetch the pending withdrawals with: ${err}`,
        BridgeErrorType.FLOW_RATE_ERROR,
      );
    }

    txStatusResponse.transactions = txStatusItems;

    // try match a completed transaction to a pending flowRate transaction
    for (const txStatusRes of txStatusResponse.transactions) {
      if (txStatusRes.status === StatusResponse.COMPLETE) {
        (() => {
          for (const pendingWithdrawals of pendingWithdrawalResponses) {
            const flowRatedTxIndex = pendingWithdrawals.pending.findIndex((el) => (
              el.amount.toString() === txStatusRes.amount.toString()
              && el.token === txStatusRes.token
              && el.withdrawer === txStatusRes.sender
              && el.recipient === txStatusRes.recipient
            ));
            if (flowRatedTxIndex !== -1) {
              txStatusRes.status = StatusResponse.FLOW_RATE_CONTROLLED;
              txStatusRes.data = {
                canWithdraw: pendingWithdrawals.pending[flowRatedTxIndex].canWithdraw,
                timeoutStart: pendingWithdrawals.pending[flowRatedTxIndex].timeoutStart,
                timeoutEnd: pendingWithdrawals.pending[flowRatedTxIndex].timeoutEnd,
              };
              pendingWithdrawals.pending.splice(flowRatedTxIndex, 1);
              return;
            }
          }
        })();
      }
    }

    // Return the tx status response
    return txStatusResponse;
  }

  private async getUniqueReceivers(
    txStatusItems: Array<TxStatusResponseItem>,
    sourceChainId: string,
  ): Promise<Array<string>> {
    const uniqueReceivers: Array<string> = [];

    const isWithdraw = [
      ZKEVM_DEVNET_CHAIN_ID,
      ZKEVM_TESTNET_CHAIN_ID,
      ZKEVM_MAINNET_CHAIN_ID].includes(sourceChainId);

    for (let i = 0, l = txStatusItems.length; i < l; i++) {
      if (txStatusItems[i].status === StatusResponse.COMPLETE
        && isWithdraw && txStatusItems[i].recipient) {
        const receiverIndex = uniqueReceivers.findIndex((el) => el === txStatusItems[i].recipient);
        if (receiverIndex === -1) {
          uniqueReceivers.push(txStatusItems[i].recipient);
        }
      }
    }// for

    return uniqueReceivers;
  }

  private async getAxelarStatus(
    transactions: Array<TxStatusRequestItem>,
    sourceChainId: string,
  ): Promise<Array<TxStatusResponseItem>> {
    const txStatusItems: Array<TxStatusResponseItem> = [];
    const statusPromises: Array<Promise<GMPStatusResponse>> = [];
    const axelarAPIEndpoint: string = getAxelarEndpoint(sourceChainId);
    const unpaidGasStatus = [GasPaidStatus.GAS_UNPAID, GasPaidStatus.GAS_PAID_NOT_ENOUGH_GAS];
    const abiCoder = new ethers.utils.AbiCoder();

    for (const transaction of transactions) {
      statusPromises.push(queryTransactionStatus(axelarAPIEndpoint, transaction.txHash));
    }

    let statusResponses: Array<GMPStatusResponse>;
    try {
      statusResponses = await Promise.all(statusPromises);
    } catch (err) {
      throw new BridgeError(
        `Failed to fetch the Axelar Status with the reason: ${err}`,
        BridgeErrorType.AXELAR_GAS_ESTIMATE_FAILED,
      );
    }

    for (let i = 0, l = statusResponses.length; i < l; i++) {
      let metaStatus: StatusResponse;

      // consolidate axelar statuses to our own simplified metaStatus
      switch (statusResponses[i].status) {
        case GMPStatus.CANNOT_FETCH_STATUS:
          metaStatus = StatusResponse.PENDING;
          break;
        case GMPStatus.SRC_GATEWAY_CALLED:
        case GMPStatus.DEST_GATEWAY_APPROVED:
        case GMPStatus.DEST_EXECUTING:
        case GMPStatus.SRC_GATEWAY_CONFIRMED:
        case GMPStatus.APPROVING:
          metaStatus = StatusResponse.PROCESSING;
          break;
        case GMPStatus.NOT_EXECUTED:
          metaStatus = StatusResponse.RETRY;
          break;
        case GMPStatus.NOT_EXECUTED_WITHOUT_GAS_PAID:
        case GMPStatus.INSUFFICIENT_FEE:
          metaStatus = StatusResponse.NOT_ENOUGH_GAS;
          break;
        case GMPStatus.DEST_EXECUTED:
          metaStatus = StatusResponse.COMPLETE;
          break;
        default:
          metaStatus = StatusResponse.ERROR;
      }

      if (statusResponses[i].gasPaidInfo) {
        if (unpaidGasStatus.includes(statusResponses[i].gasPaidInfo!.status)) {
          metaStatus = StatusResponse.NOT_ENOUGH_GAS;
        }
      }

      let txItem = {
        txHash: transactions[i].txHash,
        status: metaStatus,
        data: {
          gmpResponse: statusResponses[i].status,
        },
      } as TxStatusResponseItem;

      let decodedData;
      if (statusResponses[i]?.callTx?.returnValues?.payload) {
        decodedData = abiCoder.decode(
          ['bytes32', 'address', 'address', 'address', 'uint256'],
          statusResponses[i].callTx.returnValues.payload,
        );
        txItem = {
          ...txItem,
          token: decodedData[1],
          sender: decodedData[2],
          recipient: decodedData[3],
          amount: decodedData[4],
        };
      }
      txStatusItems.push(txItem);
    }// for

    return txStatusItems;
  }

  /**
 * Queries for the information about which tokens are flowrated and how long the delay is.
 *
 * @param {void} - no params required.
 * @returns {Promise<FlowRateInfoResponse>} - A promise that resolves to an object containing the flow rate information.
 * @throws {BridgeError} - If an error occurs during the query, a BridgeError will be thrown with a specific error type.
 * @dev this SDK method is currently stubbed
 */
  public async getFlowRateInfo(req: FlowRateInfoRequest): Promise<FlowRateInfoResponse> {
    if (!req.tokens || req.tokens.length === 0) {
      throw new BridgeError(
        `invalid tokens array ${req.tokens}`,
        BridgeErrorType.INVALID_TOKEN,
      );
    }

    const rootBridgeAddress = this.config.bridgeContracts.rootERC20BridgeFlowRate;
    const rootBridge = await createContract(rootBridgeAddress, ROOT_ERC20_BRIDGE_FLOW_RATE, this.config.rootProvider);

    const contractPromises: Array<Promise<any>> = [];
    contractPromises.push(rootBridge.withdrawalQueueActivated());
    contractPromises.push(rootBridge.withdrawalDelay());

    for (let token of req.tokens) {
      if (token.toUpperCase() === NATIVE) {
        token = ETHEREUM_NATIVE_TOKEN_ADDRESS;
      }
      contractPromises.push(rootBridge.flowRateBuckets(token));
      contractPromises.push(rootBridge.largeTransferThresholds(token));
    }
    let contractPromisesRes: Array<any>;
    try {
      contractPromisesRes = await Promise.all(contractPromises);
    } catch (err) {
      throw new BridgeError(
        'unable to query contract for flowrate info',
        BridgeErrorType.INTERNAL_ERROR,
      );
    }

    const tokensRes: Record<FungibleToken, FlowRateInfoItem> = {};

    const withdrawalQueueActivated = contractPromisesRes[0];
    const withdrawalDelay = contractPromisesRes[1].toNumber();

    // remove first 2 items from promise all response
    contractPromisesRes.splice(0, 2);

    // the remaining items should be sets of 2 per token
    for (let i = 0, l = req.tokens.length; i < l; i++) {
      const shifter = i * 2;
      tokensRes[req.tokens[i]] = {
        capacity: contractPromisesRes[shifter].capacity,
        depth: contractPromisesRes[shifter].depth,
        refillTime: contractPromisesRes[shifter].refillTime.toNumber(),
        refillRate: contractPromisesRes[shifter].refillRate,
        largeTransferThreshold: contractPromisesRes[shifter + 1],
      };
    }

    // Return the token mappings
    return {
      withdrawalQueueActivated,
      withdrawalDelay,
      tokens: tokensRes,
    };
  }

  /**
 * Fetches the pending withdrawals for a given address.
 *
 * @param {PendingWithdrawalsRequest} req - The request object containing the reciever address.
 * @returns {Promise<PendingWithdrawalsResponse>} - A promise that resolves to an object containing the child token address.
 * @throws {BridgeError} - If an error occurs during the query, a BridgeError will be thrown with a specific error type.
 * @dev this SDK method is currently stubbed
 */
  public async getPendingWithdrawals(req: PendingWithdrawalsRequest): Promise<PendingWithdrawalsResponse> {
    // eslint-disable-next-line no-console

    if (!req.recipient) {
      throw new BridgeError(
        `invalid recipient ${req.recipient}`,
        BridgeErrorType.INVALID_RECIPIENT,
      );
    }

    const rootBridgeAddress = this.config.bridgeContracts.rootERC20BridgeFlowRate;
    const rootBridge = await createContract(rootBridgeAddress, ROOT_ERC20_BRIDGE_FLOW_RATE, this.config.rootProvider);

    const pendingLength: ethers.BigNumber = await rootBridge.getPendingWithdrawalsLength(req.recipient);

    const pendingWithdrawals: PendingWithdrawalsResponse = {
      pending: [],
    };

    if (pendingLength.toNumber() === 0) {
      return pendingWithdrawals;
    }

    const indices: Array<number> = [];
    for (let i = 0; i < pendingLength.toNumber(); i++) {
      indices.push(i);
    }

    const pending: Array<RootBridgePendingWithdrawal> = await rootBridge.getPendingWithdrawals(req.recipient, indices);

    const timestampNow = Math.floor(Date.now() / 1000);

    const withdrawalDelay: ethers.BigNumber = await rootBridge.withdrawalDelay();

    for (let i = 0, l = pending.length; i < l; i++) {
      const timeoutEnd = pending[i].timestamp.add(withdrawalDelay).toNumber();
      if (timeoutEnd > timestampNow) {
        pendingWithdrawals.pending[i] = {
          canWithdraw: false,
        } as PendingWithdrawal;
      } else {
        pendingWithdrawals.pending[i] = {
          canWithdraw: true,
        } as PendingWithdrawal;
      }
      pendingWithdrawals.pending[i].recipient = req.recipient;
      pendingWithdrawals.pending[i].withdrawer = pending[i].withdrawer;
      pendingWithdrawals.pending[i].token = pending[i].token;
      pendingWithdrawals.pending[i].amount = pending[i].amount;
      pendingWithdrawals.pending[i].timeoutStart = pending[i].timestamp.toNumber();
      pendingWithdrawals.pending[i].timeoutEnd = timeoutEnd;
    }

    return pendingWithdrawals;
  }

  /**
 * Retrieves the unsigned flow rate withdrawal transaction
 *
 * @param {FlowRateWithdrawRequest} req - The request object containing the receiver address and pending withdrawal index.
 * @returns {Promise<FlowRateWithdrawResponse>} - A promise that resolves to an object containing the unsigned transaction.
 * @throws {BridgeError} - If an error occurs during the query, a BridgeError will be thrown with a specific error type.
 * @dev this SDK method is currently stubbed
 */
  public async getFlowRateWithdrawTx(req: FlowRateWithdrawRequest): Promise<FlowRateWithdrawResponse> {
    // eslint-disable-next-line no-console

    if (!req.recipient) {
      throw new BridgeError(
        `invalid recipient ${req.recipient}`,
        BridgeErrorType.INVALID_RECIPIENT,
      );
    }

    if (req.index < 0) {
      throw new BridgeError(
        `invalid index ${req.index}`,
        BridgeErrorType.INVALID_FLOWRATE_INDEX,
      );
    }

    const rootBridgeAddress = this.config.bridgeContracts.rootERC20BridgeFlowRate;
    const rootBridge = await createContract(rootBridgeAddress, ROOT_ERC20_BRIDGE_FLOW_RATE, this.config.rootProvider);

    const pending: Array<RootBridgePendingWithdrawal> = await
      rootBridge.getPendingWithdrawals(req.recipient, [req.index]);

    if (pending[0].withdrawer === ethers.constants.AddressZero
      || pending[0].token === ethers.constants.AddressZero
      || pending[0].amount === ethers.BigNumber.from(0)
      || pending[0].timestamp === ethers.BigNumber.from(0)) {
      throw new BridgeError(
        `pending withdrawal not found for ${req.recipient} at index ${req.index}`,
        BridgeErrorType.FLOW_RATE_ERROR,
      );
    }

    const withdrawalDelay: ethers.BigNumber = await rootBridge.withdrawalDelay();
    const timeoutEnd = pending[0].timestamp.add(withdrawalDelay).toNumber();
    const timestampNow = Math.floor(Date.now() / 1000);

    if (timeoutEnd > timestampNow) {
      return {
        pendingWithdrawal: {
          canWithdraw: false,
          withdrawer: pending[0].withdrawer,
          recipient: req.recipient,
          token: pending[0].token,
          amount: pending[0].amount,
          timeoutStart: pending[0].timestamp.toNumber(),
          timeoutEnd,
        },
        unsignedTx: null,
      };
    }

    const data: string = await withBridgeError<string>(async () => rootBridge.interface.encodeFunctionData(
      'finaliseQueuedWithdrawal',
      [req.recipient, req.index],
    ), BridgeErrorType.INTERNAL_ERROR);

    return {
      pendingWithdrawal: {
        canWithdraw: true,
        withdrawer: pending[0].withdrawer,
        recipient: req.recipient,
        token: pending[0].token,
        amount: pending[0].amount,
        timeoutStart: pending[0].timestamp.toNumber(),
        timeoutEnd,
      },
      unsignedTx: {
        data,
        to: this.config.bridgeContracts.rootERC20BridgeFlowRate,
        value: 0,
        chainId: parseInt(this.config.bridgeInstance.rootChainID, 10),
      },
    };
  }

  /**
 * Retrieves the corresponding token mappings for a given address.
 * This function is used to map a root token to its child token in the context of a bridging system between chains.
 * If the token is native, a special key is used to represent it.
 *
 * @param {TokenMappingRequest} req - The request object containing the root token address or the string 'NATIVE'.
 * @returns {Promise<TokenMappingResponse>} - A promise that resolves to an object containing the child token address.
 * @throws {BridgeError} - If an error occurs during the query, a BridgeError will be thrown with a specific error type.
 * @dev this SDK method is currently stubbed
 */
  public async getTokenMapping(req: TokenMappingRequest): Promise<TokenMappingResponse> {
    // eslint-disable-next-line no-console

    if (req.rootToken.toUpperCase() === NATIVE
      || req.rootToken === this.config.bridgeContracts.rootChainWrappedETH) {
      const childBridgeAddress = this.config.bridgeContracts.childERC20Bridge;
      const childBridge = await createContract(childBridgeAddress, CHILD_ERC20_BRIDGE, this.config.childProvider);
      const childETHToken = await childBridge.childETHToken();

      return {
        rootToken: req.rootToken,
        childToken: childETHToken,
      };
    }

    const rootBridgeAddress = this.config.bridgeContracts.rootERC20BridgeFlowRate;
    const rootBridge = await createContract(rootBridgeAddress, ROOT_ERC20_BRIDGE_FLOW_RATE, this.config.rootProvider);
    const rootTokenChildAddress = await rootBridge.rootTokenToChildToken(req.rootToken);

    if (rootTokenChildAddress === ethers.constants.AddressZero) {
      return {
        rootToken: req.rootToken,
        childToken: null,
      };
    }

    if (rootTokenChildAddress === req.rootToken) {
      return {
        rootToken: req.rootToken,
        childToken: NATIVE,
      };
    }
    return {
      rootToken: req.rootToken,
      childToken: rootTokenChildAddress,
    };
  }
}
