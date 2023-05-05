import { BridgeConfiguration } from 'config';
import { ethers } from 'ethers';
import {
  ApproveBridgeRequest,
  ApproveBridgeResponse,
  BridgeDepositRequest,
  BridgeDepositResponse,
  BridgeFeeRequest,
  BridgeFeeResponse,
  CompletionStatus,
  FungibleToken,
  WaitForRequest,
  WaitForResponse,
} from 'types';
import { RootERC20Predicate } from 'contracts/ABIs/RootERC20Predicate';
import { ERC20 } from 'contracts/ABIs/ERC20';
import { BridgeError, BridgeErrorType, withBridgeError } from 'errors';
import { RootStateSender } from 'contracts/ABIs/RootStateSender';
import { ChildStateReceiver } from 'contracts/ABIs/ChildStateReceiver';

export class TokenBridge {
  private config: BridgeConfiguration;

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
        BridgeErrorType.INVALID_ADDRESS
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
    req: BridgeDepositRequest
  ): Promise<BridgeDepositResponse> {
    if (req.token === 'NATIVE') {
      throw new BridgeError(
        'native token deposit is not yet supported',
        BridgeErrorType.UNSUPPORTED_ERROR
      );
    }

    if (!ethers.utils.isAddress(req.depositorAddress)) {
      throw new BridgeError(
        `depositor address ${req.depositorAddress} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS
      );
    }

    if (!ethers.utils.isAddress(req.recipientAddress)) {
      throw new BridgeError(
        `recipient address ${req.recipientAddress} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS
      );
    }

    // If the token is ERC20, the address must be valid
    if (req.token !== 'NATIVE' && !ethers.utils.isAddress(req.token)) {
      throw new BridgeError(
        `token address ${req.token} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS
      );
    }
    // The deposit amount cannot be <= 0
    if (req.depositAmount.isNegative() || req.depositAmount.isZero()) {
      throw new BridgeError(
        `deposit amount ${req.depositAmount.toString()} is invalid`,
        BridgeErrorType.INVALID_AMOUNT
      );
    }

    // Convert the addresses to correct format addresses (e.g. prepend 0x if not already)
    const depositor = ethers.utils.getAddress(req.depositorAddress);
    const receipient = ethers.utils.getAddress(req.recipientAddress);
    const token = ethers.utils.getAddress(req.token);

    const rootERC20PredicateContract = await withBridgeError<ethers.Contract>(
      async () => {
        const rootERC20PredicateContract = new ethers.Contract(
          this.config.bridgeContracts.rootChainERC20Predicate,
          RootERC20Predicate
        );
        return rootERC20PredicateContract;
      },
      BridgeErrorType.INTERNAL_ERROR
    );

    // Encode the function data into a payload
    const data = await withBridgeError<string>(async () => {
      return rootERC20PredicateContract.interface.encodeFunctionData(
        'depositTo',
        [token, receipient, req.depositAmount]
      );
    }, BridgeErrorType.INTERNAL_ERROR);

    return {
      unsignedTx: {
        data: data,
        to: this.config.bridgeContracts.rootChainERC20Predicate,
        value: 0,
        from: depositor,
      },
    };
  }

  /**
   * Retrieves the unsigned approval transaction for a deposit to the bridge.
   *
   * @param {ApproveBridgeRequest} req - The approve bridge request object containing the depositor address, token address, and deposit amount.
   * @returns {Promise<ApproveBridgeResponse>} - A promise that resolves to an object containing the unsigned approval transaction and a flag indicating if the approval is required.
   * @throws {BridgeError} - If an error occurs during the transaction creation, a BridgeError will be thrown with a specific error type.
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
    req: ApproveBridgeRequest
  ): Promise<ApproveBridgeResponse> {
    // If the token is NATIVE, no approval is required
    if (req.token === 'NATIVE') {
      // When native tokens are supported, change this to return required: false
      throw new BridgeError(
        'native token deposit is not yet supported',
        BridgeErrorType.UNSUPPORTED_ERROR
      );
    }

    if (!ethers.utils.isAddress(req.depositorAddress)) {
      throw new BridgeError(
        `depositor address ${req.depositorAddress} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS
      );
    }

    // If the token is ERC20, the address must be valid
    if (req.token !== 'NATIVE' && !ethers.utils.isAddress(req.token)) {
      throw new BridgeError(
        `token address ${req.token} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS
      );
    }

    // The deposit amount cannot be <= 0
    if (req.depositAmount.isNegative() || req.depositAmount.isZero()) {
      throw new BridgeError(
        `deposit amount ${req.depositAmount.toString()} is invalid`,
        BridgeErrorType.INVALID_AMOUNT
      );
    }

    const erc20Contract: ethers.Contract =
      await withBridgeError<ethers.Contract>(async () => {
        return new ethers.Contract(req.token, ERC20, this.config.rootProvider);
      }, BridgeErrorType.INTERNAL_ERROR);

    // Get the current approved allowance of the RootERC20Predicate
    const rootERC20PredicateAllowance: ethers.BigNumber =
      await withBridgeError<ethers.BigNumber>(async () => {
        return await erc20Contract.allowance(
          req.depositorAddress,
          this.config.bridgeContracts.rootChainERC20Predicate
        );
      }, BridgeErrorType.PROVIDER_ERROR);

    // If the allowance is greater than or equal to the deposit amount, no approval is required
    if (rootERC20PredicateAllowance.gte(req.depositAmount)) {
      return {
        unsignedTx: null,
        required: false,
      };
    }
    // Calculate the amount of tokens that need to be approved for deposit
    const approvalAmountRequired = req.depositAmount.sub(
      rootERC20PredicateAllowance
    );

    // Encode the approve function call data for the ERC20 contract
    const data: string = await withBridgeError<string>(async () => {
      return erc20Contract.interface.encodeFunctionData('approve', [
        this.config.bridgeContracts.rootChainERC20Predicate,
        approvalAmountRequired,
      ]);
    }, BridgeErrorType.INTERNAL_ERROR);

    // Create the unsigned transaction for the approval
    const unsignedTx: ethers.providers.TransactionRequest = {
      data: data,
      to: req.token,
      value: 0,
      from: req.depositorAddress,
    };

    return {
      unsignedTx: unsignedTx,
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
    req: WaitForRequest
  ): Promise<WaitForResponse> {
    const rootTxReceipt: ethers.providers.TransactionReceipt = await withBridgeError<ethers.providers.TransactionReceipt>(async () => {
      return await this.config.rootProvider.waitForTransaction(req.transactionHash, 3)
    }, BridgeErrorType.PROVIDER_ERROR);

    // Throw an error if the transaction was reverted
    if (rootTxReceipt.status !== 1) {
      throw new BridgeError(`${rootTxReceipt.transactionHash} on rootchain was reverted`, BridgeErrorType.TRANSACTION_REVERTED);
    }

    // Get the state sync ID from the transaction receipt
    const stateSyncID = await withBridgeError<string>(async () => {
      return await this.getRootStateSyncID(rootTxReceipt);
    }, BridgeErrorType.PROVIDER_ERROR)

    const result: CompletionStatus = await withBridgeError<CompletionStatus>(async () => {
      return await this.waitForChildStateSync(stateSyncID, 10000);
    }, BridgeErrorType.PROVIDER_ERROR);

    return {
      status: result,
    };
  }
  private async waitForChildStateSync(    
    stateSyncID: string,
    interval: number) : Promise<CompletionStatus> {
      const childStateReceiver = new ethers.Contract(this.config.bridgeContracts.childChainStateReceiver, ChildStateReceiver, this.config.childProvider);

      // Set up an event filter for the StateSyncResult event
      const eventFilter = childStateReceiver.filters["StateSyncResult"]();
  
      let childDepositEvent;
      while (true) {  
        // Query for past events that match the event filter
        const pastEvents = await childStateReceiver.queryFilter(eventFilter);
        childDepositEvent = pastEvents.find((ev) => {
          if (!ev.args) return false;
          if (!ev.args.counter) return false;
          return (ev.args.counter.toString() === stateSyncID) 
        });
        if (childDepositEvent) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
      if (!childDepositEvent) throw new Error("failed to find child deposit event");
      if (!childDepositEvent.args) throw new Error("child deposit event has no args");
      if (!childDepositEvent.args.status) throw new Error("child deposit event has no status")
      if (childDepositEvent.args.status) {
        return CompletionStatus.SUCCESS
      } else {
        return CompletionStatus.FAILED
      }
  }

  private async getRootStateSyncID(txReceipt: ethers.providers.TransactionReceipt): Promise<string> {
    const stateSenderInterface = new ethers.utils.Interface(RootStateSender);

    // Get the StateSynced event log from the transaction receipt
    const stateSenderLogs = txReceipt.logs.filter((log) => log.address.toLowerCase() == this.config.bridgeContracts.rootChainStateSender.toLowerCase())
    if (stateSenderLogs.length !== 1) {
      throw new Error(`expected at least 1 log in tx ${txReceipt.transactionHash}`);
    }
    const stateSyncEvent = stateSenderInterface.parseLog(stateSenderLogs[0]);

    // Throw an error if the event log doesn't match the expected format
    if (stateSyncEvent.signature !== "StateSynced(uint256,address,address,bytes)") {
      throw new Error(`expected state sync event in tx ${txReceipt.transactionHash}`);
    }

    // Return the state sync ID as a string
    const stateSyncID = stateSyncEvent.args.id.toString();
    return stateSyncID;
  }

  private async getFeeForToken(
    token: FungibleToken
  ): Promise<ethers.BigNumber> {
    return ethers.BigNumber.from(0);
  }
}
