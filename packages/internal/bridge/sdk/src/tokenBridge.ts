/* eslint-disable class-methods-use-this */
import {
  AxelarQueryAPI, AxelarQueryAPIFeeResponse, Environment,
} from '@axelar-network/axelarjs-sdk';
import {
  ETH_MAINNET_TO_ZKEVM_MAINNET, ETH_SEPOLIA_TO_ZKEVM_TESTNET,
} from 'constants/bridges';
import { BridgeConfiguration } from 'config';
import { ethers } from 'ethers';
import {
  BridgeFeeRequest,
  BridgeFeeResponse,
  BridgeMethodsGasLimit,
  FeeData,
  BridgeTxRequest,
  BridgeFeeActions,
  bridgeMethods,
  ApproveBridgeRequest,
  ApproveBridgeResponse,
  BridgeTxResponse,
  axelarChains,
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
  AddGasRequest,
  AddGasResponse,
} from 'types';
import { ROOT_ERC20_BRIDGE_FLOW_RATE } from 'contracts/ABIs/RootERC20BridgeFlowRate';
import { ERC20 } from 'contracts/ABIs/ERC20';
import { BridgeError, BridgeErrorType, withBridgeError } from 'errors';
import { CHILD_ERC20_BRIDGE } from 'contracts/ABIs/ChildERC20Bridge';
import { getGasPriceInWei } from 'lib/gasPriceInWei';

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
   * @param {BridgeConfiguration} config - The bridge configuration object.ƒ
   */
  constructor(config: BridgeConfiguration) {
    this.config = config;
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
    await this.validateChainConfiguration();
    await this.validateChainIds(req.sourceChainId, req.destinationChainId);

    let sourceChainFee: ethers.BigNumber = ethers.BigNumber.from(0);
    let destinationChainFee: ethers.BigNumber = ethers.BigNumber.from(0);
    let bridgeFee: ethers.BigNumber = ethers.BigNumber.from(0);
    const networkFee: ethers.BigNumber = ethers.BigNumber.from(0);

    if (req.action === BridgeFeeActions.FINALISE_WITHDRAWAL) {
      sourceChainFee = await this.getGasEstimates(
        this.config.rootProvider,
        BridgeMethodsGasLimit.FINALISE_WITHDRAWAL,
      );
    } else {
      let sourceProvider:ethers.providers.Provider;
      let destinationProvider:ethers.providers.Provider;

      const destinationGasLimit = BridgeMethodsGasLimit[`${req.action}_DESTINATION`];
      if (req.action === BridgeFeeActions.WITHDRAW) {
        sourceProvider = this.config.childProvider;
        destinationProvider = this.config.rootProvider;
      } else {
        sourceProvider = this.config.rootProvider;
        destinationProvider = this.config.childProvider;
      }

      sourceChainFee = await this.getGasEstimates(
        sourceProvider,
        BridgeMethodsGasLimit[`${req.action}_SOURCE`],
      );
      destinationChainFee = await this.getGasEstimates(
        destinationProvider,
        destinationGasLimit,
      );

      bridgeFee = await this.calculateBridgeFee(
        req.sourceChainId,
        req.destinationChainId,
        destinationGasLimit,
        req.gasMultiplier,
      );
    }

    const totalFee: ethers.BigNumber = sourceChainFee.add(bridgeFee).add(networkFee);

    return {
      sourceChainFee,
      destinationChainFee,
      bridgeFee,
      networkFee, // no network fee charged currently
      totalFee,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  private async getGasEstimates(
    provider: ethers.providers.Provider,
    txnGasLimitInWei: number,
  ): Promise<ethers.BigNumber> {
    const feeData: FeeData = await provider.getFeeData();
    const gasPriceInWei = getGasPriceInWei(feeData);
    if (!gasPriceInWei) return ethers.BigNumber.from(0);
    return gasPriceInWei.mul(txnGasLimitInWei);
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
    await this.validateChainConfiguration();

    await this.validateDepositArgs(
      req.token,
      req.senderAddress,
      req.amount,
      req.sourceChainId,
      req.destinationChainId,
    );

    // If the token is NATIVE, no approval is required
    if (req.token.toUpperCase() === 'NATIVE') {
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
        req.senderAddress,
        this.config.bridgeContracts.rootERC20BridgeFlowRate,
      ), BridgeErrorType.PROVIDER_ERROR);

    // If the allowance is greater than or equal to the deposit amount, no approval is required
    if (rootERC20PredicateAllowance.gte(req.amount)) {
      return {
        unsignedTx: null,
      };
    }
    // Calculate the amount of tokens that need to be approved for deposit
    const approvalAmountRequired = req.amount.sub(
      rootERC20PredicateAllowance,
    );

    // Encode the approve function call data for the ERC20 contract
    const data: string = await withBridgeError<string>(async () => erc20Contract.interface
      .encodeFunctionData('approve', [
        this.config.bridgeContracts.rootERC20BridgeFlowRate,
        approvalAmountRequired,
      ]), BridgeErrorType.INTERNAL_ERROR);

    // Create the unsigned transaction for the approval
    const unsignedTx: ethers.providers.TransactionRequest = {
      data,
      to: req.token,
      value: 0,
      from: req.senderAddress,
    };

    return {
      unsignedTx,
    };
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
    await this.validateChainConfiguration();
    await this.validateDepositArgs(
      req.token,
      req.senderAddress,
      req.amount,
      req.sourceChainId,
      req.destinationChainId,
    );

    // Convert the addresses to correct format addresses (e.g. prepend 0x if not already)
    const receipient = ethers.utils.getAddress(req.recipientAddress);
    const sender = ethers.utils.getAddress(req.senderAddress);

    if (req.sourceChainId === this.config.bridgeInstance.rootChainID) {
      const rootBridge = await withBridgeError<ethers.Contract>(
        async () => {
          const contract = new ethers.Contract(
            this.config.bridgeContracts.rootERC20BridgeFlowRate,
            ROOT_ERC20_BRIDGE_FLOW_RATE,
          );
          return contract;
        },
        BridgeErrorType.INTERNAL_ERROR,
      );

      return this.getBridgeTx(
        sender,
        receipient,
        req.amount,
        req.token,
        rootBridge,
        bridgeMethods.deposit,
        this.config.bridgeContracts.rootERC20BridgeFlowRate,
        req.sourceChainId,
        req.destinationChainId,
        BridgeFeeActions.DEPOSIT,
        req.gasMultiplier,
      );
    }

    const childBridge = await withBridgeError<ethers.Contract>(
      async () => {
        const contract = new ethers.Contract(
          this.config.bridgeContracts.childERC20Bridge,
          CHILD_ERC20_BRIDGE,
        );
        return contract;
      },
      BridgeErrorType.INTERNAL_ERROR,
    );

    return this.getBridgeTx(
      sender,
      receipient,
      req.amount,
      req.token,
      childBridge,
      bridgeMethods.withdraw,
      this.config.bridgeContracts.childERC20Bridge,
      req.sourceChainId,
      req.destinationChainId,
      BridgeFeeActions.WITHDRAW,
      req.gasMultiplier,
    );
  }

  private async getBridgeTx(
    sender:string,
    recipient:string,
    amount:ethers.BigNumber,
    token:string,
    contract:ethers.Contract,
    contractMethods: Record<string, string>,
    contractAddress: string,
    sourceChainId: string,
    destinationChainId: string,
    action: BridgeFeeActions,
    gasMultiplier: number = 1.1,
  ) {
    const fees:BridgeFeeResponse = await this.getFee({
      action,
      gasMultiplier,
      sourceChainId,
      destinationChainId,
    });

    // Handle return if it is a native token
    if (token.toUpperCase() === 'NATIVE') {
      // Encode the function data into a payload
      let data: string;
      if (sender === recipient) {
        data = await withBridgeError<string>(async () => contract.interface.encodeFunctionData(
          contractMethods.native,
          [amount],
        ), BridgeErrorType.INTERNAL_ERROR);
      } else {
        data = await withBridgeError<string>(async () => contract.interface.encodeFunctionData(
          contractMethods.nativeTo,
          [recipient, amount],
        ), BridgeErrorType.INTERNAL_ERROR);
      }

      return {
        feeData: fees,
        unsignedTx: {
          data,
          to: contractAddress,
          value: amount.add(fees.bridgeFee).toString(),
        },
      };
    }

    // Handle return for ERC20
    const erc20Token = ethers.utils.getAddress(token);

    // Encode the function data into a payload
    let data: string;
    if (sender === recipient) {
      data = await withBridgeError<string>(async () => contract.interface.encodeFunctionData(
        contractMethods.token,
        [erc20Token, amount],
      ), BridgeErrorType.INTERNAL_ERROR);
    } else {
      data = await withBridgeError<string>(async () => contract.interface.encodeFunctionData(
        contractMethods.tokenTo,
        [erc20Token, recipient, amount],
      ), BridgeErrorType.INTERNAL_ERROR);
    }
    return {
      feeData: fees,
      unsignedTx: {
        data,
        to: contractAddress,
        value: fees.bridgeFee.toString(),
      },
    };
  }

  private async validateDepositArgs(
    token: string,
    senderOrRecipientAddress: string,
    amount: ethers.BigNumber,
    sourceChainId: string,
    destinationChainId: string,
  ) {
    if (!ethers.utils.isAddress(senderOrRecipientAddress)) {
      throw new BridgeError(
        `address ${senderOrRecipientAddress} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS,
      );
    }

    // The deposit amount cannot be <= 0
    if (amount.isNegative() || amount.isZero()) {
      throw new BridgeError(
        `deposit amount ${amount.toString()} is invalid`,
        BridgeErrorType.INVALID_AMOUNT,
      );
    }

    // If the token is not native, it must be a valid address
    if (token.toUpperCase() !== 'NATIVE' && !ethers.utils.isAddress(token)) {
      throw new BridgeError(
        `token address ${token} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS,
      );
    }

    this.validateChainIds(sourceChainId, destinationChainId);
  }

  private async validateChainIds(
    sourceChainId: string,
    destinationChainId: string,
  ) {
    // If the token is not native, it must be a valid address
    if (sourceChainId !== this.config.bridgeInstance.rootChainID.toString()
      && sourceChainId !== this.config.bridgeInstance.childChainID.toString()) {
      throw new BridgeError(
        `the sourceChainId ${sourceChainId} is not a valid`,
        BridgeErrorType.INVALID_SOURCE_CHAIN_ID,
      );
    }

    // If the token is not native, it must be a valid address
    if (destinationChainId !== this.config.bridgeInstance.rootChainID.toString()
      && destinationChainId !== this.config.bridgeInstance.childChainID.toString()) {
      throw new BridgeError(
        `the destinationChainId ${destinationChainId} is not a valid`,
        BridgeErrorType.INVALID_DESTINATION_CHAIN_ID,
      );
    }

    // If the token is not native, it must be a valid address
    if (sourceChainId === destinationChainId.toString()) {
      throw new BridgeError(
        `the sourceChainId ${sourceChainId} cannot be the same as the destinationChainId ${destinationChainId}`,
        BridgeErrorType.CHAIN_IDS_MATCH,
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

    if (rootNetwork!.chainId.toString() !== this.config.bridgeInstance.rootChainID.toString()) {
      throw new BridgeError(
        `Rootchain provider chainID ${rootNetwork!.chainId} does not match expected chainID ${this.config.bridgeInstance.rootChainID}. ${errMessage}`,
        BridgeErrorType.UNSUPPORTED_ERROR,
      );
    }

    const childNetwork = await this.config.childProvider.getNetwork();

    if (childNetwork.chainId.toString() !== this.config.bridgeInstance.childChainID.toString()) {
      throw new BridgeError(
        `Childchain provider chainID ${childNetwork.chainId} does not match expected chainID ${this.config.bridgeInstance.childChainID}. ${errMessage}`,
        BridgeErrorType.UNSUPPORTED_ERROR,
      );
    }
  }

  /**
 * Calculate the gas amount for a transaction using axelarjs-sdk.
 * @param {*} source - The source chainId.
 * @param {*} destination - The destination chainId.
 * @param {*} gasLimit - The gas limit for the desired operation.
 * @param {*} gasMultiplier - The gas multiplier to add buffer to the fees.
 * @returns {ethers.BigNumber} - The Axelar Gas amount in the source chain currency.
 */
  // eslint-disable-next-line class-methods-use-this
  private async calculateBridgeFee(
    source:string,
    destination:string,
    gasLimit: number,
    gasMultiplier: number = 1.1,
  ): Promise<ethers.BigNumber> {
    const sourceAxelar:AxelarChainDetails = axelarChains[source];
    const destinationAxelar:AxelarChainDetails = axelarChains[destination];

    if (!sourceAxelar) {
      throw new BridgeError(
        `Source chainID ${source} can not be matched to an Axelar chain.`,
        BridgeErrorType.AXELAR_CHAIN_NOT_FOUND,
      );
    }

    if (!destinationAxelar) {
      throw new BridgeError(
        `Destination chainID ${destination} can not be matched to an Axelar chain.`,
        BridgeErrorType.AXELAR_CHAIN_NOT_FOUND,
      );
    }

    let axelarEnv:Environment;
    if (source === ETH_MAINNET_TO_ZKEVM_MAINNET.rootChainID
      || source === ETH_MAINNET_TO_ZKEVM_MAINNET.childChainID) {
      axelarEnv = Environment.MAINNET;
    } else if (source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID
      || source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID) {
      axelarEnv = Environment.TESTNET;
    } else {
      axelarEnv = Environment.DEVNET;
    }

    const api = new AxelarQueryAPI({ environment: axelarEnv });
    const estimateGasFeeResult:string | AxelarQueryAPIFeeResponse = await api.estimateGasFee(
      sourceAxelar.id,
      destinationAxelar.id,
      sourceAxelar.symbol,
      gasLimit,
      gasMultiplier,
    );

    if (typeof estimateGasFeeResult === 'string') {
      throw new BridgeError(
        `Estimating Axelar Gas failed with the reason: ${estimateGasFeeResult}`,
        BridgeErrorType.AXELAR_GAS_ESTIMATE_FAILED,
      );
    }

    if (!estimateGasFeeResult.executionFeeWithMultiplier) {
      throw new BridgeError(
        `Axelar Gas didn't return the executionFeeWithMultiplier: ${estimateGasFeeResult.executionFeeWithMultiplier}`,
        BridgeErrorType.AXELAR_GAS_ESTIMATE_FAILED,
      );
    }

    return ethers.BigNumber.from(estimateGasFeeResult.executionFeeWithMultiplier);
  }

  // STUBBED ENDPOINTS FOR PHASE 2 -------------------------------------------

  /**
 * Queries the status of a bridge transaction.
 *
 * @param {TokenMappingRequest} req - The request object containing the token, rootChainId and childChainId.
 * @returns {Promise<TokenMappingResponse>} - A promise that resolves to an object containing the token mappings.
 * @throws {BridgeError} - If an error occurs during the query, a BridgeError will be thrown with a specific error type.
 * @dev this SDK method is currently stubbed
 */
  public async getTransactionStatus(req: TxStatusRequest): Promise<TxStatusResponse> {
    console.log('stubbed response with req', req);
    // Return the token mappings
    return [{
      transactionHash: '0x1234....',
      status: StatusResponse.COMPLETE,
      data: 'stubbed data',
    }];
  }

  /**
 * Queries for the information about which tokens are flowrated and how long the delay is.
 *
 * @param {void} - no params required.
 * @returns {Promise<FlowRateInfoResponse>} - A promise that resolves to an object containing the flow rate information.
 * @throws {BridgeError} - If an error occurs during the query, a BridgeError will be thrown with a specific error type.
 * @dev this SDK method is currently stubbed
 */
  public async getFlowRateInfo(): Promise<FlowRateInfoResponse> {
    console.log('stubbed response');
    // Return the token mappings
    return {
      withdrawalQueueActivated: false,
      withdrawalDelay: 86400,
      tokens: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        NATIVE: {
          capacity: ethers.utils.parseUnits('10', 18).toString(),
          depth: ethers.utils.parseUnits('10', 18).toString(),
          refillTime: 1701227629,
          refillRate: ethers.utils.parseUnits('10', 18).toString(),
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF': {
          capacity: ethers.utils.parseUnits('10', 18).toString(),
          depth: ethers.utils.parseUnits('10', 18).toString(),
          refillTime: 1701227629,
          refillRate: ethers.utils.parseUnits('10', 18).toString(),
        },
      },
    };
  }

  /**
 * Queries the status of a bridge transaction.
 *
 * @param {PendingWithdrawalsRequest} req - The request object containing the reciever address.
 * @returns {Promise<PendingWithdrawalsResponse>} - A promise that resolves to an object containing the child token address.
 * @throws {BridgeError} - If an error occurs during the query, a BridgeError will be thrown with a specific error type.
 * @dev this SDK method is currently stubbed
 */
  public async getPendingWithdrawals(req: PendingWithdrawalsRequest): Promise<PendingWithdrawalsResponse> {
    console.log('stubbed response with req', req);
    return {
      pending: [{
        withdrawer: '0xEac347177DbA4a190B632C7d9b8da2AbfF57c772',
        token: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
        amount: ethers.utils.parseUnits('1', 18).toString(),
        timeoutStart: 1698502429,
        timeoutEnd: 1701227629,
      },
      {
        withdrawer: '0xEac347177DbA4a190B632C7d9b8da2AbfF57c772',
        token: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
        amount: ethers.utils.parseUnits('2', 18).toString(),
        timeoutStart: 1698416029,
        timeoutEnd: 1698502429,
      }],
    };
  }

  /**
 * Retrieves the unsigned flow rate withdrawal transaction
 *
 * @param {FlowRateWithdrawRequest} req - The request object containing the receiver address and pending withdrawal index.
 * @returns {Promise<FlowRateWithdrawResponse>} - A promise that resolves to an object containing the unsigned transaction.
 * @throws {BridgeError} - If an error occurs during the query, a BridgeError will be thrown with a specific error type.
 * @dev this SDK method is currently stubbed
 */
  public async getFlowRateWithdrawTx(req:FlowRateWithdrawRequest): Promise<FlowRateWithdrawResponse> {
    console.log('stubbed response with req', req);
    return {
      unsignedTx: {
        data: 'stubbed flow rate withdrawal data',
        to: '0x0',
        value: 0,
      },
    };
  }

  /**
 * Retrieves the unsigned transaction to top up the Axelar Gas.
 *
 * @param {AddGasRequest} req - The request object containing the root token address or the string 'NATIVE'.
 * @returns {Promise<AddGasResponse>} - A promise that resolves to an object containing the child token address.
 * @throws {BridgeError} - If an error occurs during the query, a BridgeError will be thrown with a specific error type.
 * @dev this SDK method is currently stubbed
 */
  public async addGas(req: AddGasRequest): Promise<AddGasResponse> {
    console.log('stubbed response with req', req);
    return {
      unsignedTx: {
        data: 'stubbed add gas payment data',
        to: '0x0',
        value: 0,
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
    console.log('stubbed response with req', req);
    return {
      rootToken: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
      childToken: 'NATIVE',
    };
  }
}
