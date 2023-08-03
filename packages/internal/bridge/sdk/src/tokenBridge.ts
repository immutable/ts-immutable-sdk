import { BridgeConfiguration } from 'config';
import { ethers } from 'ethers';
import {
  ApproveDepositBridgeRequest,
  ApproveDepositBridgeResponse,
  BridgeDepositRequest,
  BridgeDepositResponse,
  BridgeFeeRequest,
  BridgeFeeResponse,
  BridgeWithdrawRequest,
  BridgeWithdrawResponse,
  ChildTokenRequest,
  ChildTokenResponse,
  CompletionStatus,
  ExitRequest,
  ExitResponse,
  WaitForDepositRequest,
  WaitForDepositResponse,
  WaitForWithdrawalRequest,
  WaitForWithdrawalResponse,
  RootTokenRequest,
  RootTokenResponse,
} from 'types';
import { ROOT_ERC20_PREDICATE } from 'contracts/ABIs/RootERC20Predicate';
import { ERC20 } from 'contracts/ABIs/ERC20';
import { BridgeError, BridgeErrorType, withBridgeError } from 'errors';
import { ROOT_STATE_SENDER } from 'contracts/ABIs/RootStateSender';
import { CHILD_STATE_RECEIVER } from 'contracts/ABIs/ChildStateReceiver';
import { getBlockNumberClosestToTimestamp } from 'lib/getBlockCloseToTimestamp';
import { CHILD_ERC20_PREDICATE } from 'contracts/ABIs/ChildERC20Predicate';
import { CHECKPOINT_MANAGER } from 'contracts/ABIs/CheckpointManager';
import { decodeExtraData } from 'lib/decodeExtraData';
import { L2_STATE_SENDER_ADDRESS, NATIVE_TOKEN_BRIDGE_KEY } from 'constants/bridges';
import { L2_STATE_SENDER } from 'contracts/ABIs/L2StateSender';
import { EXIT_HELPER } from 'contracts/ABIs/ExitHelper';
import { CHILD_ERC20 } from 'contracts/ABIs/ChildERC20';

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
   * Retrieves the bridge fee for depositing a specific token, used to reimburse the bridge-relayer.
   * It is clipped from the deposit amount.
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
   *   token: '0x123456...', // token
   * };
   *
   * @example
   * const feeRequest = {
   *   token: 'NATIVE', // token
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
    this.validateChainConfiguration();
    if (req.token !== 'NATIVE' && !ethers.utils.isAddress(req.token)) {
      throw new BridgeError(
        `token address ${req.token} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS,
      );
    }
    return {
      bridgeable: true,
      feeAmount: ethers.BigNumber.from(0),
    };
  }

  /**
   * Retrieves the unsigned approval transaction for a deposit to the bridge.
   * Approval is required before depositing tokens to the bridge using
   *
   * @param {ApproveBridgeRequest} req - The approve bridge request object containing the depositor address,
   * token address, and deposit amount.
   * @returns {Promise<ApproveBridgeResponse>} - A promise that resolves to an object containing the unsigned
   * approval transaction and a flag indicating if the approval is required.
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
   * bridgeSdk.getUnsignedApproveDepositBridgeTx(approveRequest)
   *   .then((approveResponse) => {
   *     if (approveResponse.unsignedTx) {
   *       // Send the unsigned approval transaction to the depositor to sign and send
   *     } else {
   *      // No approval is required
   *     }
   *   })
   *   .catch((error) => {
   *     console.error('Error:', error.message);
   *   });
   */
  public async getUnsignedApproveDepositBridgeTx(
    req: ApproveDepositBridgeRequest,
  ): Promise<ApproveDepositBridgeResponse> {
    this.validateChainConfiguration();

    TokenBridge.validateDepositArgs(req.depositorAddress, req.depositAmount, req.token);

    // If the token is NATIVE, no approval is required
    if (req.token === 'NATIVE') {
      return {
        unsignedTx: null,
      };
    }

    const erc20Contract: ethers.Contract = await withBridgeError<ethers.Contract>(
      async () => new ethers.Contract(req.token, ERC20, this.config.rootProvider),
      BridgeErrorType.PROVIDER_ERROR,
    );

    // Get the current approved allowance of the RootERC20Predicate
    const rootERC20PredicateAllowance: ethers.BigNumber = await withBridgeError<ethers.BigNumber>(() => erc20Contract
      .allowance(
        req.depositorAddress,
        this.config.bridgeContracts.rootChainERC20Predicate,
      ), BridgeErrorType.PROVIDER_ERROR);

    // If the allowance is greater than or equal to the deposit amount, no approval is required
    if (rootERC20PredicateAllowance.gte(req.depositAmount)) {
      return {
        unsignedTx: null,
      };
    }
    // Calculate the amount of tokens that need to be approved for deposit
    const approvalAmountRequired = req.depositAmount.sub(
      rootERC20PredicateAllowance,
    );

    // Encode the approve function call data for the ERC20 contract
    const data: string = await withBridgeError<string>(async () => erc20Contract.interface
      .encodeFunctionData('approve', [
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
    };
  }

  /**
   * Generates an unsigned deposit transaction for a user to sign and submit to the bridge.
   * Must be called after bridgeSdk.getUnsignedApproveDepositBridgeTx to ensure user has approved sufficient tokens for deposit.
   *
   * @param {BridgeDepositRequest} req - The deposit request object containing the required data for depositing tokens.
   * @returns {Promise<BridgeDepositResponse>} - A promise that resolves to an object containing the unsigned transaction data.
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
   *   token: '0x123456...', // ERC20 token address
   *   depositorAddress: '0xabcdef...', // User's wallet address
   *   recipientAddress: '0x987654...', // Destination wallet address on the target chain
   *   depositAmount: ethers.utils.parseUnits('100', 18), // Deposit amount in wei
   * };
   *
   * @example
   * const depositEtherTokenRequest = {
   *   token: 'NATIVE',
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
    this.validateChainConfiguration();

    TokenBridge.validateDepositArgs(req.recipientAddress, req.depositAmount, req.token);

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

    // Convert the addresses to correct format addresses (e.g. prepend 0x if not already)
    const receipient = ethers.utils.getAddress(req.recipientAddress);

    // Handle return if it is a native token
    if (req.token === 'NATIVE') {
      // Encode the function data into a payload
      const data = await withBridgeError<string>(async () => rootERC20PredicateContract.interface.encodeFunctionData(
        'depositNativeTo',
        [receipient],
      ), BridgeErrorType.INTERNAL_ERROR);

      return {
        unsignedTx: {
          data,
          to: this.config.bridgeContracts.rootChainERC20Predicate,
          value: req.depositAmount,
        },
      };
    }

    // Handle return for ERC20
    const token = ethers.utils.getAddress(req.token);

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
      },
    };
  }

  /**
   * Waits for the deposit transaction to be confirmed and synced from the root chain to the child chain.
   *
   * @param {WaitForDepositRequest} req - The wait for request object containing the transaction hash.
   * @returns {Promise<WaitForDepositResponse>} - A promise that resolves to an object containing the status of the deposit transaction.
   * @throws {BridgeError} - If an error occurs during the transaction confirmation or state sync, a BridgeError will be
   * thrown with a specific error type.
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
    req: WaitForDepositRequest,
  ): Promise<WaitForDepositResponse> {
    this.validateChainConfiguration();
    const rootTxReceipt = await withBridgeError<ethers.providers.TransactionReceipt>(
      async () => this.config.rootProvider.waitForTransaction(req.transactionHash, this.config.rootChainFinalityBlocks),
      BridgeErrorType.PROVIDER_ERROR,
    );

    // Throw an error if the transaction was reverted
    if (rootTxReceipt.status !== 1) {
      throw new BridgeError(
        `${rootTxReceipt.transactionHash} on rootchain was reverted`,
        BridgeErrorType.TRANSACTION_REVERTED,
      );
    }

    // Get the state sync ID from the transaction receipt
    const stateSyncID = await withBridgeError<number>(
      async () => this.getRootStateSyncID(rootTxReceipt),
      BridgeErrorType.PROVIDER_ERROR,
    );

    // Get the block for the timestamp
    const rootBlock: ethers.providers.Block = await withBridgeError<ethers.providers.Block>(
      async () => await this.config.rootProvider.getBlock(rootTxReceipt.blockNumber),
      BridgeErrorType.PROVIDER_ERROR,
      `failed to query block ${rootTxReceipt.blockNumber} on rootchain`,
    );

    // Get the minimum block on childchain which corresponds with the timestamp on rootchain
    const minBlockRange: number = await withBridgeError<number>(async () => getBlockNumberClosestToTimestamp(
      this.config.childProvider,
      rootBlock.timestamp,
      this.config.blockTime,
      this.config.clockInaccuracy,
    ), BridgeErrorType.PROVIDER_ERROR);

    // Get the upper bound for which we expect the StateSync event to occur
    const maxBlockRange: number = minBlockRange + this.config.maxDepositBlockDelay;

    // Poll till event observed
    const result: CompletionStatus = await withBridgeError<CompletionStatus>(
      async () => this.waitForChildStateSync(
        stateSyncID,
        this.config.pollInterval,
        minBlockRange,
        maxBlockRange,
      ),
      BridgeErrorType.PROVIDER_ERROR,
    );

    return {
      status: result,
    };
  }

  /**
 * Retrieves the corresponding child token address for a given root token address.
 * This function is used to map a root token to its child token in the context of a bridging system between chains.
 * If the token is native, a special key is used to represent it.
 *
 * @param {ChildTokenRequest} req - The request object containing the root token address or the string 'NATIVE'.
 * @returns {Promise<ChildTokenResponse>} - A promise that resolves to an object containing the child token address.
 * @throws {BridgeError} - If an error occurs during the query, a BridgeError will be thrown with a specific error type.
 *
 * Possible BridgeError types include:
 * - INVALID_ADDRESS: If the Ethereum address provided in the request is invalid.
 * - PROVIDER_ERROR: If there's an error in querying the getChildToken mapping.
 * - INTERNAL_ERROR: An unexpected error occurred during the execution.
 *
 * @example
 * const request = {
 *   rootToken: '0x123456...', // Root token address or 'NATIVE'
 * };
 *
 * bridgeSdk.getChildToken(request)
 *   .then((response) => {
 *     console.log(response.childToken); // Child token address
 *   })
 *   .catch((error) => {
 *     console.error('Error:', error.message);
 *   });
 */
  public async getChildToken(req: ChildTokenRequest): Promise<ChildTokenResponse> {
  // Validate the chain configuration to ensure proper setup
    this.validateChainConfiguration();

    // If the root token is native, use the native token key; otherwise, use the provided root token address
    const reqTokenAddress = (req.rootToken === 'NATIVE') ? NATIVE_TOKEN_BRIDGE_KEY : req.rootToken;

    // Validate the request token address
    if (!ethers.utils.isAddress(reqTokenAddress)) {
      throw new BridgeError(
        `recipient address ${reqTokenAddress} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS,
      );
    }

    // Create an instance of the root ERC20 predicate contract
    const childTokenAddress: string = await withBridgeError<string>(
      async () => {
        const rootERC20Predicate: ethers.Contract = new ethers.Contract(
          this.config.bridgeContracts.rootChainERC20Predicate,
          ROOT_ERC20_PREDICATE,
          this.config.rootProvider,
        );
        return await rootERC20Predicate.getChildToken(reqTokenAddress);
      },
      BridgeErrorType.PROVIDER_ERROR,
      'failed to query getChildToken mapping',
    );

    // Return the child token address
    return {
      childToken: childTokenAddress,
    };
  }

  /**
 * Retrieves the corresponding root token address for a given child token address.
 * This function is used to map a child token back to its root token in the context of a bridging system between chains.
 *
 * If the root token address matches the address designated for the native token, the method will return 'NATIVE'.
 *
 * @param {RootTokenRequest} req - The request object containing the child token address.
 * @returns {Promise<RootTokenResponse>} - A promise that resolves to an object containing the root token address.
 * @throws {BridgeError} - If an error occurs during the query, a BridgeError will be thrown with a specific error type.
 *
 * Possible BridgeError types include:
 * - PROVIDER_ERROR: If there's an error in querying the root token from the child token contract.
 * - INVALID_TOKEN: If the token being withdrawed is not a valid bridgeable token
 *
 * @example
 * const request = {
 *   childToken: '0x123456...', // Child token address
 * };
 *
 * bridgeSdk.getRootToken(request)
 *   .then((response) => {
 *     console.log(response.rootToken); // Outputs: 'NATIVE' or Root token address
 *   })
 *   .catch((error) => {
 *     console.error('Error:', error.message);
 *   });
 */
  public async getRootToken(req: RootTokenRequest): Promise<RootTokenResponse> {
  // Validate the chain configuration to ensure proper setup
    this.validateChainConfiguration();

    // Query the corresponding root token address using the child token contract
    const rootToken = await withBridgeError<string>(
      async () => {
        // Create an instance of the child token contract using the given child token address
        const childToken: ethers.Contract = new ethers.Contract(req.childToken, CHILD_ERC20, this.config.childProvider);
        return await childToken.rootToken();
      },
      BridgeErrorType.PROVIDER_ERROR,
      'failed to query the root token from the child token contract',
    );

    // Check if the rootToken address is the designated native token address.
    // If it is, return 'NATIVE'. Else, return the root token address.
    return {
      rootToken: (rootToken === NATIVE_TOKEN_BRIDGE_KEY) ? 'NATIVE' : rootToken,
    };
  }

  /**
   * Generates an unsigned transaction that a user can use to initiate a token withdrawal from the bridge.
   * The user must sign and submit this transaction to execute the withdrawal.
   *
   * @param {BridgeWithdrawRequest} req - The withdrawal request object containing the necessary data for withdrawing tokens.
   * @returns {Promise<BridgeWithdrawResponse>} - A promise that resolves to an object containing the unsigned transaction data.
   *
   * @throws {BridgeError} - If an error occurs during the generation of the unsigned transaction,
   * a BridgeError will be thrown with a specific error type.
   * Possible BridgeError types include:
   * - INVALID_ADDRESS: The Ethereum address provided in the request is invalid. This could be the user's address or the token's address.
   * - INVALID_AMOUNT: The withdrawal amount provided in the request is invalid (less than or equal to 0).
   * - PROVIDER_ERROR: An error occurred when interacting with the Ethereum provider, likely due to a network or connectivity issue.
   * - INTERNAL_ERROR: An unexpected error occurred during the execution, likely due to the bridge SDK implementation.
   *
   * @example
   * const withdrawRequest = {
   *   token: '0x123456...', // ERC20 token address
   *   recipientAddress: '0xabcdef...', // Address to receive the withdrawn tokens
   *   withdrawAmount: ethers.utils.parseUnits('100', 18), // Withdraw amount in wei
   * };
   *
   * bridgeSdk.getUnsignedWithdrawTx(withdrawRequest)
   *   .then((withdrawalResponse) => {
   *     console.log(withdrawalResponse.unsignedTx);
   *   })
   *   .catch((error) => {
   *     console.error('Error:', error.message);
   *   });
   */
  public async getUnsignedWithdrawTx(
    req: BridgeWithdrawRequest,
  ): Promise<BridgeWithdrawResponse> {
    // Ensure the configuration of chains is valid.
    this.validateChainConfiguration();

    // Validate the recipient address, withdrawal amount, and token.
    TokenBridge.validateWithdrawArgs(req.recipientAddress, req.withdrawAmount, req.token);

    // Create a contract instance for interacting with the ChildERC20Predicate
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

    // Encode the withdrawTo function call data for the ERC20 contract
    const data: string = await withBridgeError<string>(async () => childERC20PredicateContract.interface
      .encodeFunctionData('withdrawTo', [
        req.token,
        req.recipientAddress,
        req.withdrawAmount,
      ]), BridgeErrorType.INTERNAL_ERROR);

    // Construct the unsigned transaction for the withdrawal
    return {
      unsignedTx: {
        data,
        to: this.config.bridgeContracts.childChainERC20Predicate,
        value: 0,
      },
    };
  }

  /**
   * Waits for the withdrawal transaction to be confirmed in the root chain by continuously
   * polling until the transaction is included in a checkpoint.
   * This function is intended to be used after executing a withdrawal transaction.
   *
   * @param {WaitForWithdrawalRequest} req - The request object containing the transaction hash of the withdrawal transaction.
   * @returns {Promise<WaitForWithdrawalResponse>} - A promise that resolves to an empty object once the withdrawal
   * transaction has been confirmed in the root chain.
   *
   * @throws {BridgeError} - If an error occurs during the waiting process, a BridgeError will be thrown with a specific error type.
   * Possible BridgeError types include:
   * - PROVIDER_ERROR: An error occurred when interacting with the Ethereum provider, likely due to a network or connectivity issue.
   *
   * @example
   * const waitForWithdrawalRequest = {
   *   transactionHash: '0x123456...', // Transaction hash of the withdrawal transaction
   * };
   *
   * bridgeSdk.waitForWithdrawal(waitForWithdrawalRequest)
   *   .then(() => {
   *     console.log('Withdrawal transaction has been confirmed in the root chain.');
   *   })
   *   .catch((error) => {
   *     console.error('Error:', error.message);
   *   });
   */
  public async waitForWithdrawal(
    req:WaitForWithdrawalRequest,
  ): Promise<WaitForWithdrawalResponse> {
    // Ensure the configuration of chains is valid.
    this.validateChainConfiguration();

    // Helper function to pause execution for a specified interval
    const pause = (): Promise<void> => new Promise((resolve) => {
      setTimeout(resolve, this.config.pollInterval);
    });

    await withBridgeError<void>(async () => {
      // Fetch the receipt of the withdrawal transaction
      const transactionReceipt = await this.config.childProvider.getTransactionReceipt(req.transactionHash);

      // Fetch the block in which the withdrawal transaction was included
      const block = await this.config.childProvider.getBlock(transactionReceipt.blockNumber);

      // Decode the extra data field from the block header
      const decodedExtraData = decodeExtraData(block.extraData);

      // Instantiate the checkpoint manager contract
      const checkpointManager = new ethers.Contract(
        this.config.bridgeContracts.rootChainCheckpointManager,
        CHECKPOINT_MANAGER,
        this.config.rootProvider,
      );

      // Recursive function to keep checking for the child deposit event
      const waitForRootEpoch = async (): Promise<null> => {
        // Fetch the current checkpoint epoch from the root chain
        const currentEpoch = await checkpointManager.currentEpoch();

        // If the current epoch is greater than or equal to the epoch number of the checkpoint in which
        // the withdrawal transaction was included, the withdrawal has been confirmed in the root chain
        if (currentEpoch >= decodedExtraData.checkpoint.epochNumber) {
          return null;
        }

        // Pause execution for a specified interval before checking again
        await pause();

        // Recursive call
        return waitForRootEpoch();
      };

      // Start waiting for the withdrawal transaction to be confirmed in the root chain
      await waitForRootEpoch();
    }, BridgeErrorType.PROVIDER_ERROR);

    // Return an empty object once the withdrawal transaction has been confirmed in the root chain
    return {};
  }

  /**
   * Creates an unsigned exit transaction which, when executed, will exit the assets from the child chain to the root chain.
   * This function should be used after a withdraw transaction has been executed on the child chain.
   * It should only be executed after `waitForWithdrawal` has completed successfully.
   *
   * @param {ExitRequest} req - The request object containing the transaction hash of the withdraw transaction.
   * @returns {Promise<ExitResponse>} - A promise that resolves to an object containing the unsigned exit transaction.
   *
   * @throws {BridgeError} - If an error occurs during the exit transaction creation process,
   * a BridgeError will be thrown with a specific error type.
   * Possible BridgeError types include:
   * - PROVIDER_ERROR: An error occurred when interacting with the Ethereum provider, likely due to a network or connectivity issue.
   * - INVALID_TRANSACTION: The deposit transaction is invalid or the L2StateSynced event log does not match the expected format.
   * - INTERNAL_ERROR: An internal error occurred during the function call encoding process.
   *
   * @example
   * const exitRequest = {
   *   transactionHash: '0x123456...', // Transaction hash of the deposit transaction
   * };
   *
   * bridgeSdk.getUnsignedExitTx(exitRequest)
   *   .then((response) => {
   *     console.log('Unsigned exit transaction:', response.unsignedTx);
   *   })
   *   .catch((error) => {
   *     console.error('Error:', error.message);
   *   });
   */
  public async getUnsignedExitTx(req: ExitRequest): Promise<ExitResponse> {
    // Ensure the configuration of chains is valid
    this.validateChainConfiguration();

    // Fetch the receipt of the deposit transaction
    const txReceipt = await withBridgeError<ethers.providers.TransactionReceipt>(
      async () => await this.config.childProvider.getTransactionReceipt(req.transactionHash),
      BridgeErrorType.PROVIDER_ERROR,
    );

    // Filter out the StateSynced event log from the transaction receipt
    const stateSenderLogs = txReceipt.logs.filter((log) => log.address.toLowerCase() === L2_STATE_SENDER_ADDRESS);
    if (stateSenderLogs.length !== 1) {
      throw new BridgeError(
        `expected 1 log in tx ${txReceipt.transactionHash} from address ${L2_STATE_SENDER_ADDRESS}`,
        BridgeErrorType.INVALID_TRANSACTION,
      );
    }

    // Parse the StateSynced event log
    const l2StateSyncEvent = await withBridgeError<ethers.utils.LogDescription>(async () => {
      const l2StateSenderInterface = new ethers.utils.Interface(L2_STATE_SENDER);
      const event = l2StateSenderInterface.parseLog(stateSenderLogs[0]);

      // Throw an error if the event log doesn't match the expected format
      if (event.signature !== 'L2StateSynced(uint256,address,address,bytes)') {
        throw new Error(`expected L2StateSynced event in tx ${txReceipt.transactionHash}`);
      }
      return event;
    }, BridgeErrorType.INVALID_TRANSACTION);

    // Instantiate the exit helper contract
    const exitHelper = await withBridgeError<ethers.Contract>(
      async () => new ethers.Contract(
        this.config.bridgeContracts.rootChainExitHelper,
        EXIT_HELPER,
        this.config.rootProvider,
      ),
      BridgeErrorType.PROVIDER_ERROR,
    );

    // Generate the exit proof
    const exitProof = await withBridgeError<any>(
      async () => (this.config.childProvider as ethers.providers.JsonRpcProvider)
        .send('bridge_generateExitProof', [l2StateSyncEvent.args.id.toHexString()]),
      BridgeErrorType.PROVIDER_ERROR,
    );

    // Encode the exit function call data
    const encodedExitTx = await withBridgeError<string>(async () => {
      const exitEventEncoded = ethers.utils.defaultAbiCoder.encode(
        ['uint256', 'address', 'address', 'bytes'],
        l2StateSyncEvent.args,
      );
      return exitHelper.interface.encodeFunctionData(
        'exit',
        [exitProof.Metadata.CheckpointBlock, exitProof.Metadata.LeafIndex, exitEventEncoded, exitProof.Data],
      );
    }, BridgeErrorType.INTERNAL_ERROR);

    // Create the unsigned exit transaction
    const unsignedTx: ethers.providers.TransactionRequest = {
      data: encodedExitTx,
      to: this.config.bridgeContracts.rootChainExitHelper,
      value: 0,
    };

    // Return the unsigned exit transaction
    return { unsignedTx };
  }

  private async waitForChildStateSync(
    stateSyncID: number,
    interval: number,
    minBlockRange: number,
    maxBlockRange: number,
  ) : Promise<CompletionStatus> {
    // Initialize the child state receiver contract
    const childStateReceiver = new ethers.Contract(
      this.config.bridgeContracts.childChainStateReceiver,
      CHILD_STATE_RECEIVER,

      this.config.childProvider,
    );

    // Create an event filter for the StateSyncResult event emitted by the contract
    // This will be used to listen for specific instances of the event where the stateSyncID matches our expected ID
    const eventFilter = childStateReceiver.filters.StateSyncResult(stateSyncID, null, null);

    // Define a helper function that queries the blockchain for the StateSyncResult events that match our filter
    // This function scans the block range from minBlockRange to maxBlockRange
    const getEventsWithStateSyncID = async (): Promise<ethers.Event[]> => childStateReceiver
      .queryFilter(
        eventFilter,
        minBlockRange,
        maxBlockRange,
      );

    // Define a helper function that pauses execution of our program for a certain interval (in milliseconds)
    // This is used to wait between checks for the StateSyncResult event on the blockchain
    const pause = (): Promise<void> => new Promise((resolve) => {
      setTimeout(resolve, interval);
    });

    // Define a recursive function that keeps checking the blockchain for our specific StateSyncResult event
    // It calls the helper function getEventsWithStateSyncID() to get the list of matching events
    // If it finds more than one matching event, it throws an error because we only expect one event with our specific stateSyncID
    // If it finds exactly one matching event, it returns that event
    // If it doesn't find any matching event, it waits for a while (using the pause() function) and then checks again (recursive call)
    const checkForChildDepositEvent = async (): Promise<ethers.Event> => {
      const events = await getEventsWithStateSyncID();
      if (events.length > 1) {
        throw new Error(`expected maximum of 1 events with statesync id ${stateSyncID} but found ${events.length}`);
      }
      if (events.length === 1) {
        return events[0];
      }

      // Pause execution for a specified interval before checking again
      await pause();

      // Recursive call
      return checkForChildDepositEvent();
    };

    // Call our recursive function and wait for it to find the StateSyncResult event
    const childDepositEvent = await checkForChildDepositEvent();

    // Perform some error checking on the event:
    // - If there's no event, throw an error
    // - If the event doesn't have arguments, throw an error
    // - If the event's arguments don't include a status, throw an error
    if (!childDepositEvent) throw new Error('failed to find child deposit event');
    if (!childDepositEvent.args) throw new Error('child deposit event has no args');
    if (!childDepositEvent.args.status) throw new Error('child deposit event has no status');

    // If the event's status argument is present, we consider that the state sync operation was successful
    if (childDepositEvent.args.status) {
      return CompletionStatus.SUCCESS;
    }

    // If not, we consider that the operation failed
    return CompletionStatus.FAILED;
  }

  private async getRootStateSyncID(txReceipt: ethers.providers.TransactionReceipt): Promise<number> {
    const stateSenderInterface = new ethers.utils.Interface(ROOT_STATE_SENDER);

    // Get the StateSynced event log from the transaction receipt
    const stateSenderLogs: ethers.providers.Log[] = txReceipt
      .logs
      .filter((log) => log.address.toLowerCase() === this.config.bridgeContracts.rootChainStateSender.toLowerCase());

    if (stateSenderLogs.length !== 1) {
      throw new Error(`expected at least 1 log in tx ${txReceipt.transactionHash}`);
    }
    const stateSyncEvent = stateSenderInterface.parseLog(stateSenderLogs[0]);

    // Throw an error if the event log doesn't match the expected format
    if (stateSyncEvent.signature !== 'StateSynced(uint256,address,address,bytes)') {
      throw new Error(`expected state sync event in tx ${txReceipt.transactionHash}`);
    }

    // Return the state sync ID as a number
    return parseInt(stateSyncEvent.args.id, 10);
  }

  private static validateDepositArgs(
    depositorOrRecipientAddress: string,
    depositAmount: ethers.BigNumber,
    token: string,
  ) {
    if (!ethers.utils.isAddress(depositorOrRecipientAddress)) {
      throw new BridgeError(
        `address ${depositorOrRecipientAddress} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS,
      );
    }

    // The deposit amount cannot be <= 0
    if (depositAmount.isNegative() || depositAmount.isZero()) {
      throw new BridgeError(
        `deposit amount ${depositAmount.toString()} is invalid`,
        BridgeErrorType.INVALID_AMOUNT,
      );
    }

    // If the token is not native, it must be a valid address
    if (token !== 'NATIVE' && !ethers.utils.isAddress(token)) {
      throw new BridgeError(
        `token address ${token} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS,
      );
    }
  }

  private static validateWithdrawArgs(
    withdrawerOrRecipientAddress: string,
    withdrawAmount: ethers.BigNumber,
    token: string,
  ) {
    // Validate the withdrawer address
    if (!ethers.utils.isAddress(withdrawerOrRecipientAddress)) {
      throw new BridgeError(
        `withdrawer address ${withdrawerOrRecipientAddress} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS,
      );
    }

    // Validate the withdrawal amount. It cannot be zero or negative.
    if (withdrawAmount.isNegative() || withdrawAmount.isZero()) {
      throw new BridgeError(
        `withdraw amount ${withdrawAmount.toString()} is invalid`,
        BridgeErrorType.INVALID_AMOUNT,
      );
    }

    // Check if the ERC20 Token is a valid address
    if (!ethers.utils.isAddress(token)) {
      throw new BridgeError(
        `token address ${token} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS,
      );
    }
  }

  // Query the rootchain and childchain providers to ensure the chainID is as expected by the SDK.
  // This is to prevent the SDK from being used on the wrong chain, especially after a chain reset.
  private async validateChainConfiguration(): Promise<void> {
    const errMessage = 'Please upgrade to the latest version of the Bridge SDK or provide valid configuration';

    const rootNetwork = await withBridgeError<ethers.providers.Network>(
      async () => this.config.rootProvider.getNetwork(),
      BridgeErrorType.PROVIDER_ERROR,
    );
    if (rootNetwork.chainId.toString() !== this.config.bridgeInstance.rootChainID) {
      throw new BridgeError(
        `Rootchain provider chainID ${rootNetwork.chainId} does not match expected chainID ${this.config.bridgeInstance.rootChainID}. ${errMessage}`,
        BridgeErrorType.UNSUPPORTED_ERROR,
      );
    }

    const childNetwork = await this.config.childProvider.getNetwork();
    if (childNetwork.chainId.toString() !== this.config.bridgeInstance.childChainID) {
      throw new BridgeError(
        `Childchain provider chainID ${childNetwork.chainId} does not match expected chainID ${this.config.bridgeInstance.childChainID}. ${errMessage}`,
        BridgeErrorType.UNSUPPORTED_ERROR,
      );
    }
  }
}
