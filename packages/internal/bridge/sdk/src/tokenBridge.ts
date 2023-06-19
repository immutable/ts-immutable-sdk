import { BridgeConfiguration } from 'config';
import { ethers } from 'ethers';
import {
  ApproveBridgeRequest,
  ApproveBridgeResponse,
  BridgeDepositRequest,
  BridgeDepositResponse,
  BridgeFeeRequest,
  BridgeFeeResponse,
  BridgeWithdrawRequest,
  BridgeWithdrawResponse,
  CompletionStatus,
  FungibleToken,
  WaitForRequest,
  WaitForResponse,
} from 'types';
import { ROOT_ERC20_PREDICATE } from 'contracts/ABIs/RootERC20Predicate';
import { ERC20 } from 'contracts/ABIs/ERC20';
import { BridgeError, BridgeErrorType, withBridgeError } from 'errors';
import { ROOT_STATE_SENDER } from 'contracts/ABIs/RootStateSender';
import { CHILD_STATE_RECEIVER } from 'contracts/ABIs/ChildStateReceiver';
import { getBlockNumberClosestToTimestamp } from 'lib/getBlockCloseToTimestamp';
import { CHILD_ERC20_PREDICATE } from 'contracts/ABIs/ChildERC20Predicate';

/**
 * Represents a token bridge, which manages asset transfers between two chains.
 */
export class TokenBridge {
  /**
   * @property {BridgeConfiguration} config - The bridge configuration object.
   */
  private config: BridgeConfiguration;

  /**
   * Constructs a TokenBridge instance.
   *
   * @param {BridgeConfiguration} config - The bridge configuration object.
   */
  constructor(config: BridgeConfiguration) {
    this.config = config;
  }

  /**
   * Retrieves the bridge fee for a specific token.
   *
   * @param {BridgeFeeRequest} req - The fee request object containing the token address for which the fee is required.
   * @returns {Promise<BridgeFeeResponse>} - A promise that resolves to an object containing the bridge fee for the specified token and a flag indicating if the token is bridgeable.
   * @throws {BridgeError} - If an error occurs during the fee retrieval, a BridgeError will be thrown with a specific error type.
   *
   * Possible BridgeError types include:
   * - INVALID_ADDRESS: The token address provided in the request is invalid.
   *
   * @example
   * const feeRequest = {
   *   token: '0x123456...', // ERC20 token address
   * };
   *
   * bridgeSdk.getFee(feeRequest)
   *   .then((feeResponse) => {
   *     console.log('Bridgeable:', feeResponse.bridgeable);
   *     console.log('Fee Amount:', feeResponse.feeAmount.toString());
   *   })
   *   .catch((error) => {
   *     console.error('Error:', error.message);
   *   });
   */
  public async getFee(req: BridgeFeeRequest): Promise<BridgeFeeResponse> {
    if (!ethers.utils.isAddress(req.token)) {
      throw new BridgeError(
        `token address ${req.token} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS,
      );
    }
    return {
      bridgeable: true,
      feeAmount: await this.getFeeForToken(req.token),
    };
  }

  /**
   * Generates an unsigned deposit transaction for a user to sign and submit to the bridge.
   *
   * @param {BridgeDepositRequest} req - The deposit request object containing the required data for depositing tokens.
   * @returns {Promise<BridgeDepositResponse>} - A promise that resolves to an object containing the unsigned transaction data.
   * @throws {BridgeError} - If an error occurs during the generation of the unsigned transaction, a BridgeError will be thrown with a specific error type.
   *
   * Possible BridgeError types include:
   * - UNSUPPORTED_ERROR: The operation is not supported. Currently thrown when attempting to deposit native tokens.
   * - INVALID_ADDRESS: An Ethereum address provided in the request is invalid. This could be the depositor's, recipient's or the token's address.
   * - INVALID_AMOUNT: The deposit amount provided in the request is invalid (less than or equal to 0).
   * - INTERNAL_ERROR: An unexpected error occurred during the execution, likely due to the bridge SDK implementation.
   *
   * @example
   * const depositRequest = {
   *   token: '0x123456...', // ERC20 token address
   *   depositorAddress: '0xabcdef...', // User's wallet address
   *   recipientAddress: '0x987654...', // Destination wallet address on the target chain
   *   depositAmount: ethers.utils.parseUnits('100', 18), // Deposit amount in wei
   * };
   *
   * bridgeSdk.getUnsignedDepositTx(depositRequest)
   *   .then((depositResponse) => {
   *     console.log(depositResponse.unsignedTx);
   *   })
   *   .catch((error) => {
   *     console.error('Error:', error.message);
   *   });
   */
  public async getUnsignedDepositTx(
    req: BridgeDepositRequest,
  ): Promise<BridgeDepositResponse> {
    if (req.token === 'NATIVE') {
      throw new BridgeError(
        'native token deposit is not yet supported',
        BridgeErrorType.UNSUPPORTED_ERROR,
      );
    }

    if (!ethers.utils.isAddress(req.depositorAddress)) {
      throw new BridgeError(
        `depositor address ${req.depositorAddress} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS,
      );
    }

    if (!ethers.utils.isAddress(req.recipientAddress)) {
      throw new BridgeError(
        `recipient address ${req.recipientAddress} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS,
      );
    }

    // If the token is ERC20, the address must be valid
    if (req.token !== 'NATIVE' && !ethers.utils.isAddress(req.token)) {
      throw new BridgeError(
        `token address ${req.token} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS,
      );
    }
    // The deposit amount cannot be <= 0
    if (req.depositAmount.isNegative() || req.depositAmount.isZero()) {
      throw new BridgeError(
        `deposit amount ${req.depositAmount.toString()} is invalid`,
        BridgeErrorType.INVALID_AMOUNT,
      );
    }

    // Convert the addresses to correct format addresses (e.g. prepend 0x if not already)
    const depositor = ethers.utils.getAddress(req.depositorAddress);
    const receipient = ethers.utils.getAddress(req.recipientAddress);
    const token = ethers.utils.getAddress(req.token);

    const rootERC20PredicateContract = await withBridgeError<ethers.Contract>(
      async () => {
        const contract = new ethers.Contract(
          this.config.bridgeContracts.rootChainERC20Predicate,
          ROOT_ERC20_PREDICATE,
        );
        return contract;
      },
      BridgeErrorType.INTERNAL_ERROR,
    );

    // Encode the function data into a payload
    const data = await withBridgeError<string>(async () => rootERC20PredicateContract.interface.encodeFunctionData(
      'depositTo',
      [token, receipient, req.depositAmount],
    ), BridgeErrorType.INTERNAL_ERROR);

    return {
      unsignedTx: {
        data,
        to: this.config.bridgeContracts.rootChainERC20Predicate,
        value: 0,
        from: depositor,
      },
    };
  }

  public async getUnsignedWithdrawTx(
    req: BridgeWithdrawRequest,
  ): Promise<BridgeWithdrawResponse> {
    const childERC20PredicateContract = await withBridgeError<ethers.Contract>(
      async () => {
        const contract = new ethers.Contract(
          this.config.bridgeContracts.childChainERC20Predicate,
          CHILD_ERC20_PREDICATE,
        );
        return contract;
      },
      BridgeErrorType.INTERNAL_ERROR,
    );

    // Encode the approve function call data for the ERC20 contract
    const data: string = await withBridgeError<string>(async () => childERC20PredicateContract.interface.encodeFunctionData('withdrawTo', [
      req.token,
      req.recipientAddress,
      req.withdrawAmount,
    ]), BridgeErrorType.INTERNAL_ERROR);

    return {
      unsignedTx: {
        data,
        to: this.config.bridgeContracts.childChainERC20Predicate,
        value: 0,
      },
    };
  }

  public async getUnsignedApproveChildBridgeTx(
    req: ApproveBridgeRequest,
  ): Promise<ApproveBridgeResponse> {
    const erc20Contract = await withBridgeError<ethers.Contract>(
      async () => {
        const contract = new ethers.Contract(
          req.token,
          ERC20,
        );
        return contract;
      },
      BridgeErrorType.INTERNAL_ERROR,
    );
    // Encode the approve function call data for the ERC20 contract
    const data: string = await withBridgeError<string>(async () => erc20Contract.interface.encodeFunctionData('approve', [
      this.config.bridgeContracts.childChainERC20Predicate,
      req.depositAmount,
    ]), BridgeErrorType.INTERNAL_ERROR);

    // Create the unsigned transaction for the approval
    const unsignedTx: ethers.providers.TransactionRequest = {
      data,
      to: req.token,
      value: 0,
      from: req.depositorAddress,
    };

    return {
      unsignedTx,
      required: true,
    };
  }

  /**
   * Retrieves the unsigned approval transaction for a deposit to the bridge.
   *
   * @param {ApproveBridgeRequest} req - The approve bridge request object containing the depositor address, token address, and deposit amount.
   * @returns {Promise<ApproveBridgeResponse>} - A promise that resolves to an object containing the unsigned approval transaction and a flag indicating if the approval is required.
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
   * const approveRequest = {
   *   depositorAddress: '0x123456...', // Depositor's Ethereum address
   *   token: '0xabcdef...', // ERC20 token address
   *   depositAmount: ethers.utils.parseUnits('100', 18), // Deposit amount in token's smallest unit (e.g., wei for Ether)
   * };
   *
   * bridgeSdk.getUnsignedApproveBridgeTx(approveRequest)
   *   .then((approveResponse) => {
   *     console.log('Approval Required:', approveResponse.required);
   *     console.log('Unsigned Approval Transaction:', approveResponse.unsignedTx);
   *   })
   *   .catch((error) => {
   *     console.error('Error:', error.message);
   *   });
   */
  public async getUnsignedApproveBridgeTx(
    req: ApproveBridgeRequest,
  ): Promise<ApproveBridgeResponse> {
    // If the token is NATIVE, no approval is required
    if (req.token === 'NATIVE') {
      // When native tokens are supported, change this to return required: false
      throw new BridgeError(
        'native token deposit is not yet supported',
        BridgeErrorType.UNSUPPORTED_ERROR,
      );
    }

    if (!ethers.utils.isAddress(req.depositorAddress)) {
      throw new BridgeError(
        `depositor address ${req.depositorAddress} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS,
      );
    }

    // If the token is ERC20, the address must be valid
    if (req.token !== 'NATIVE' && !ethers.utils.isAddress(req.token)) {
      throw new BridgeError(
        `token address ${req.token} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS,
      );
    }

    // The deposit amount cannot be <= 0
    if (req.depositAmount.isNegative() || req.depositAmount.isZero()) {
      throw new BridgeError(
        `deposit amount ${req.depositAmount.toString()} is invalid`,
        BridgeErrorType.INVALID_AMOUNT,
      );
    }

    const erc20Contract: ethers.Contract = await withBridgeError<ethers.Contract>(async () => new ethers.Contract(req.token, ERC20, this.config.rootProvider), BridgeErrorType.INTERNAL_ERROR);

    // Get the current approved allowance of the RootERC20Predicate
    const rootERC20PredicateAllowance: ethers.BigNumber = await withBridgeError<ethers.BigNumber>(() => erc20Contract.allowance(
      req.depositorAddress,
      this.config.bridgeContracts.rootChainERC20Predicate,
    ), BridgeErrorType.PROVIDER_ERROR);

    // If the allowance is greater than or equal to the deposit amount, no approval is required
    if (rootERC20PredicateAllowance.gte(req.depositAmount)) {
      return {
        unsignedTx: null,
        required: false,
      };
    }
    // Calculate the amount of tokens that need to be approved for deposit
    const approvalAmountRequired = req.depositAmount.sub(
      rootERC20PredicateAllowance,
    );

    // Encode the approve function call data for the ERC20 contract
    const data: string = await withBridgeError<string>(async () => erc20Contract.interface.encodeFunctionData('approve', [
      this.config.bridgeContracts.rootChainERC20Predicate,
      approvalAmountRequired,
    ]), BridgeErrorType.INTERNAL_ERROR);

    // Create the unsigned transaction for the approval
    const unsignedTx: ethers.providers.TransactionRequest = {
      data,
      to: req.token,
      value: 0,
      from: req.depositorAddress,
    };

    return {
      unsignedTx,
      required: true,
    };
  }

  /**
   * Waits for the deposit transaction to be confirmed and synced from the root chain to the child chain.
   *
   * @param {WaitForRequest} req - The wait for request object containing the transaction hash.
   * @returns {Promise<WaitForResponse>} - A promise that resolves to an object containing the status of the deposit transaction.
   * @throws {BridgeError} - If an error occurs during the transaction confirmation or state sync, a BridgeError will be thrown with a specific error type.
   *
   * Possible BridgeError types include:
   * - PROVIDER_ERROR: An error occurred with the Ethereum provider during transaction confirmation or state synchronization.
   * - TRANSACTION_REVERTED: The transaction on the root chain was reverted.
   *
   * @example
   * const waitForRequest = {
   *   transactionHash: '0x123456...', // Deposit transaction hash on the root chain
   * };
   *
   * bridgeSdk.waitForDeposit(waitForRequest)
   *   .then((waitForResponse) => {
   *     console.log('Deposit Transaction Status:', waitForResponse.status);
   *   })
   *   .catch((error) => {
   *     console.error('Error:', error.message);
   *   });
   */
  public async waitForDeposit(
    req: WaitForRequest,
  ): Promise<WaitForResponse> {
    const rootTxReceipt: ethers.providers.TransactionReceipt = await withBridgeError<ethers.providers.TransactionReceipt>(async () => this.config.rootProvider.waitForTransaction(req.transactionHash, this.config.rootChainFinalityBlocks), BridgeErrorType.PROVIDER_ERROR);

    // Throw an error if the transaction was reverted
    if (rootTxReceipt.status !== 1) {
      throw new BridgeError(`${rootTxReceipt.transactionHash} on rootchain was reverted`, BridgeErrorType.TRANSACTION_REVERTED);
    }

    // Get the state sync ID from the transaction receipt
    const stateSyncID = await withBridgeError<number>(async () => this.getRootStateSyncID(rootTxReceipt), BridgeErrorType.PROVIDER_ERROR);

    // Get the block for the timestamp
    const rootBlock: ethers.providers.Block = await this.config.rootProvider.getBlock(rootTxReceipt.blockNumber);

    // Get the minimum block on childchain which corresponds with the timestamp on rootchain
    const minBlockRange: number = await withBridgeError<number>(async () => getBlockNumberClosestToTimestamp(this.config.childProvider, rootBlock.timestamp, this.config.blockTime, this.config.clockInaccuracy), BridgeErrorType.PROVIDER_ERROR);

    // Get the upper bound for which we expect the StateSync event to occur
    const maxBlockRange: number = minBlockRange + this.config.maxDepositBlockDelay;

    // Poll till event observed
    const result: CompletionStatus = await withBridgeError<CompletionStatus>(async () => this.waitForChildStateSync(stateSyncID, this.config.pollInterval, minBlockRange, maxBlockRange), BridgeErrorType.PROVIDER_ERROR);

    return {
      status: result,
    };
  }

  private async waitForChildStateSync(
    stateSyncID: number,
    interval: number,
    minBlockRange: number,
    maxBlockRange: number,
  ) : Promise<CompletionStatus> {
    const childStateReceiver = new ethers.Contract(this.config.bridgeContracts.childChainStateReceiver, CHILD_STATE_RECEIVER, this.config.childProvider);

    // Set up an event filter for the StateSyncResult event
    const eventFilter = childStateReceiver.filters.StateSyncResult(stateSyncID, null, null);

    // Helper function to query for events with the state sync id
    const getEventsWithStateSyncID = async (): Promise<ethers.Event[]> => childStateReceiver.queryFilter(eventFilter, minBlockRange, maxBlockRange);

    // Helper function to pause execution for a specified interval
    const pause = (): Promise<void> => new Promise((resolve) => {
      setTimeout(resolve, interval);
    });

    // Recursive function to keep checking for the child deposit event
    const checkForChildDepositEvent = async (): Promise<ethers.Event> => {
      const events = await getEventsWithStateSyncID();
      if (events.length > 1) {
        throw new Error(`expected maximum of 1 events with statesync id ${stateSyncID} but found ${events.length}`);
      }
      if (events.length === 1) {
        return events[0];
      }

      await pause();
      return checkForChildDepositEvent();
    };

    const childDepositEvent = await checkForChildDepositEvent();

    if (!childDepositEvent) throw new Error('failed to find child deposit event');
    if (!childDepositEvent.args) throw new Error('child deposit event has no args');
    if (!childDepositEvent.args.status) throw new Error('child deposit event has no status');
    if (childDepositEvent.args.status) {
      return CompletionStatus.SUCCESS;
    }
    return CompletionStatus.FAILED;
  }

  private async getRootStateSyncID(txReceipt: ethers.providers.TransactionReceipt): Promise<number> {
    const stateSenderInterface = new ethers.utils.Interface(ROOT_STATE_SENDER);

    // Get the StateSynced event log from the transaction receipt
    const stateSenderLogs = txReceipt.logs.filter((log) => log.address.toLowerCase() === this.config.bridgeContracts.rootChainStateSender.toLowerCase());
    if (stateSenderLogs.length !== 1) {
      throw new Error(`expected at least 1 log in tx ${txReceipt.transactionHash}`);
    }
    const stateSyncEvent = stateSenderInterface.parseLog(stateSenderLogs[0]);

    // Throw an error if the event log doesn't match the expected format
    if (stateSyncEvent.signature !== 'StateSynced(uint256,address,address,bytes)') {
      throw new Error(`expected state sync event in tx ${txReceipt.transactionHash}`);
    }

    // Return the state sync ID as a number
    const stateSyncID = parseInt(stateSyncEvent.args.id, 10);
    return stateSyncID;
  }

  // TODO: please fix this
  // eslint-disable-next-line class-methods-use-this
  private async getFeeForToken(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: FungibleToken,
  ): Promise<ethers.BigNumber> {
    return ethers.BigNumber.from(0);
  }
}
