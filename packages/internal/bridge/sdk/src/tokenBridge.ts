/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
import axios, { AxiosResponse } from 'axios';
import { ethers } from 'ethers';
import {
  ETH_MAINNET_TO_ZKEVM_MAINNET,
  ETH_SEPOLIA_TO_ZKEVM_TESTNET,
  ZKEVM_DEVNET_CHAIN_ID,
  ZKEVM_MAINNET_CHAIN_ID,
  ZKEVM_TESTNET_CHAIN_ID,
  axelarAPIEndpoints,
  axelarChains,
  bridgeMethods,
} from './constants/bridges';
import { ROOT_ERC20_BRIDGE_FLOW_RATE } from './contracts/ABIs/RootERC20BridgeFlowRate';
import { ERC20 } from './contracts/ABIs/ERC20';
import { BridgeError, BridgeErrorType, withBridgeError } from './errors';
import { CHILD_ERC20_BRIDGE } from './contracts/ABIs/ChildERC20Bridge';
import { getGasPriceInWei } from './lib/gasPriceInWei';
import { BridgeConfiguration } from './config';
import {
  BridgeFeeRequest,
  BridgeFeeResponse,
  BridgeMethodsGasLimit,
  FeeData,
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
  CalculateBridgeFeeResponse,
  RootBridgePendingWithdrawal,
  TxStatusResponseItem,
  PendingWithdrawal,
} from './types';
import { GMPStatus, GMPStatusResponse, GasPaidStatus } from './types/axelar';
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

    if (req.action !== BridgeFeeActions.FINALISE_WITHDRAWAL) {
      await this.validateChainIds(req.sourceChainId, req.destinationChainId);
    }

    if (req.action === BridgeFeeActions.DEPOSIT && req.sourceChainId !== this.config.bridgeInstance.rootChainID) {
      throw new BridgeError(
        `Deposit must be from the root chain (${this.config.bridgeInstance.rootChainID}) to the child chain (${this.config.bridgeInstance.childChainID})`,
        BridgeErrorType.UNSUPPORTED_ERROR,
      );
    }

    if (req.action === BridgeFeeActions.WITHDRAW && req.sourceChainId !== this.config.bridgeInstance.childChainID) {
      throw new BridgeError(
        `Withdraw must be from the child chain (${this.config.bridgeInstance.childChainID}) to the root chain (${this.config.bridgeInstance.rootChainID})`,
        BridgeErrorType.UNSUPPORTED_ERROR,
      );
    }

    if (req.action === BridgeFeeActions.FINALISE_WITHDRAWAL
      && req.sourceChainId !== this.config.bridgeInstance.rootChainID) {
      throw new BridgeError(
        `Finalised withdrawals must be on the root chain (${this.config.bridgeInstance.rootChainID})`,
        BridgeErrorType.UNSUPPORTED_ERROR,
      );
    }

    let sourceChainGas: ethers.BigNumber = ethers.BigNumber.from(0);
    let bridgeFee: ethers.BigNumber = ethers.BigNumber.from(0);
    const imtblFee: ethers.BigNumber = ethers.BigNumber.from(0);

    if (req.action === BridgeFeeActions.FINALISE_WITHDRAWAL) {
      sourceChainGas = await this.getGasEstimates(
        this.config.rootProvider,
        BridgeMethodsGasLimit.FINALISE_WITHDRAWAL,
      );
    } else {
      const sourceProvider:ethers.providers.Provider = (req.action === BridgeFeeActions.WITHDRAW)
        ? this.config.childProvider : this.config.rootProvider;

      sourceChainGas = await this.getGasEstimates(
        sourceProvider,
        BridgeMethodsGasLimit[`${req.action}_SOURCE`],
      );

      const feeResult = await this.calculateBridgeFee(
        req.sourceChainId,
        req.destinationChainId,
        BridgeMethodsGasLimit[`${req.action}_DESTINATION`],
        req.gasMultiplier,
      );

      bridgeFee = feeResult.bridgeFee;
    }

    const totalFees: ethers.BigNumber = sourceChainGas.add(bridgeFee).add(imtblFee);

    return {
      sourceChainGas,
      bridgeFee,
      imtblFee, // no network fee charged currently
      totalFees,
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
        contractToApprove: null,
        unsignedTx: null,
      };
    }

    let sourceProvider:ethers.providers.Provider;
    let sourceBridgeAddress: string;
    if (req.sourceChainId === this.config.bridgeInstance.rootChainID) {
      sourceProvider = this.config.rootProvider;
      sourceBridgeAddress = this.config.bridgeContracts.rootERC20BridgeFlowRate;
    } else {
      sourceProvider = this.config.childProvider;
      sourceBridgeAddress = this.config.bridgeContracts.childERC20Bridge;
    }

    const erc20Contract: ethers.Contract = await withBridgeError<ethers.Contract>(
      async () => new ethers.Contract(req.token, ERC20, sourceProvider),
      BridgeErrorType.PROVIDER_ERROR,
    );

    // Get the current approved allowance of the RootERC20Predicate
    const allowance: ethers.BigNumber = await withBridgeError<ethers.BigNumber>(() => erc20Contract
      .allowance(
        req.senderAddress,
        sourceBridgeAddress,
      ), BridgeErrorType.PROVIDER_ERROR);

    // If the allowance is greater than or equal to the deposit amount, no approval is required
    if (allowance.gte(req.amount)) {
      return {
        contractToApprove: null,
        unsignedTx: null,
      };
    }
    // Calculate the amount of tokens that need to be approved for deposit
    const approvalAmountRequired = req.amount.sub(
      allowance,
    );

    // Encode the approve function call data for the ERC20 contract
    const data: string = await withBridgeError<string>(async () => erc20Contract.interface
      .encodeFunctionData('approve', [
        sourceBridgeAddress,
        approvalAmountRequired,
      ]), BridgeErrorType.INTERNAL_ERROR);

    // Create the unsigned transaction for the approval
    const unsignedTx: ethers.providers.TransactionRequest = {
      data,
      to: req.token,
      value: 0,
      from: req.senderAddress,
      chainId: parseInt(req.sourceChainId, 10),
    };

    return {
      contractToApprove: sourceBridgeAddress,
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
        this.config.rootProvider,
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
      this.config.childProvider,
      req.gasMultiplier,
    );
  }

  private async checkReceiver(
    provider: ethers.providers.Provider,
    address: string,
  ): Promise<boolean> {
    const ABI = ['function receive()'];

    const bytecode = await provider.getCode(address);

    // No code : "0x" then the address is not a contract so it is a valid receiver.
    if (bytecode.length <= 2) return true;

    const contract = new ethers.Contract(address, ABI, provider);

    try {
      // try to estimate gas for the receive function, if it works it exists
      await contract.estimateGas.receive();
      return true;
    } catch {
      try {
        // if receive fails, try to estimate this way which will work if a fallback function is present
        await provider.estimateGas({ to: address });
        return true;
      } catch {
        // no receive or fallback
        return false;
      }
    }
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
    provider: ethers.providers.Provider,
    gasMultiplier: number = 1.1,
  ): Promise<BridgeTxResponse> {
    const fees:BridgeFeeResponse = await this.getFee({
      action,
      gasMultiplier,
      sourceChainId,
      destinationChainId,
    });

    const canReceive:boolean = await this.checkReceiver(provider, recipient);

    if (!canReceive) {
      throw new BridgeError(
        `address ${recipient} is not a valid receipient`,
        BridgeErrorType.INVALID_RECIPIENT,
      );
    }

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
          chainId: parseInt(sourceChainId, 10),
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
        chainId: parseInt(sourceChainId, 10),
      },
    } as BridgeTxResponse;
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
    const isSourceChainRootOrChildChain = sourceChainId === this.config.bridgeInstance.rootChainID
      || sourceChainId === this.config.bridgeInstance.childChainID;

    // The source chain must be one of either the configured root chain or the configured child chain
    if (!isSourceChainRootOrChildChain) {
      throw new BridgeError(
        `the sourceChainId ${sourceChainId} is not a valid`,
        BridgeErrorType.INVALID_SOURCE_CHAIN_ID,
      );
    }

    const isDestinationChainRootOrChildChain = destinationChainId === this.config.bridgeInstance.rootChainID
      || destinationChainId === this.config.bridgeInstance.childChainID;

    // If the token is not native, it must be a valid address
    if (!isDestinationChainRootOrChildChain) {
      throw new BridgeError(
        `the destinationChainId ${destinationChainId} is not a valid`,
        BridgeErrorType.INVALID_DESTINATION_CHAIN_ID,
      );
    }

    // The source chain and destination chain should not be the same
    if (sourceChainId === destinationChainId) {
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
      BridgeErrorType.ROOT_PROVIDER_ERROR,
    );

    if (rootNetwork!.chainId.toString() !== this.config.bridgeInstance.rootChainID) {
      throw new BridgeError(
        `Rootchain provider chainID ${rootNetwork!.chainId} does not match expected chainID ${this.config.bridgeInstance.rootChainID}. ${errMessage}`,
        BridgeErrorType.UNSUPPORTED_ERROR,
      );
    }

    const childNetwork = await withBridgeError<ethers.providers.Network>(
      async () => this.config.childProvider.getNetwork(),
      BridgeErrorType.CHILD_PROVIDER_ERROR,
    );

    if (childNetwork.chainId.toString() !== this.config.bridgeInstance.childChainID) {
      throw new BridgeError(
        `Childchain provider chainID ${childNetwork.chainId} does not match expected chainID ${this.config.bridgeInstance.childChainID}. ${errMessage}`,
        BridgeErrorType.UNSUPPORTED_ERROR,
      );
    }
  }

  private getAxelarEndpoint(source:string) {
    let axelarAPIEndpoint:string;
    if (source === ETH_MAINNET_TO_ZKEVM_MAINNET.rootChainID
      || source === ETH_MAINNET_TO_ZKEVM_MAINNET.childChainID) {
      axelarAPIEndpoint = axelarAPIEndpoints.mainnet;
    } else if (source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID
      || source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID) {
      axelarAPIEndpoint = axelarAPIEndpoints.testnet;
    } else {
      axelarAPIEndpoint = axelarAPIEndpoints.devnet;
    }
    return axelarAPIEndpoint;
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
  ): Promise<CalculateBridgeFeeResponse> {
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

    const axelarAPIEndpoint:string = this.getAxelarEndpoint(source);

    let axiosResponse:AxiosResponse;

    const estimateGasReq = {
      method: 'estimateGasFee',
      sourceChain: sourceAxelar.id,
      destinationChain: destinationAxelar.id,
      symbol: sourceAxelar.symbol,
      gasLimit,
      gasMultiplier,
    };

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
      return {
        bridgeFee: ethers.BigNumber.from(`${axiosResponse.data}`),
      };
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
    const axelarAPIEndpoint:string = this.getAxelarEndpoint(req.sourceChainId);

    const txStatusResponse:TxStatusResponse = {
      transactions: [],
    };

    const abiCoder = new ethers.utils.AbiCoder();

    const statusPromises:Array<Promise<GMPStatusResponse>> = [];
    for (const transaction of req.transactions) {
      statusPromises.push(queryTransactionStatus(axelarAPIEndpoint, transaction.txHash));
    }

    let statusResponses:Array<GMPStatusResponse>;
    try {
      statusResponses = await Promise.all(statusPromises);
    } catch (err) {
      throw new BridgeError(
        `Failed to fetch the Axelar Status with the reason: ${err}`,
        BridgeErrorType.AXELAR_GAS_ESTIMATE_FAILED,
      );
    }

    const unpaidGasStatus = [GasPaidStatus.GAS_UNPAID, GasPaidStatus.GAS_PAID_NOT_ENOUGH_GAS];

    const isWithdraw = [
      ZKEVM_DEVNET_CHAIN_ID,
      ZKEVM_TESTNET_CHAIN_ID,
      ZKEVM_MAINNET_CHAIN_ID].includes(req.sourceChainId);

    let rootBridge:ethers.Contract;
    if (isWithdraw) {
      rootBridge = await withBridgeError<ethers.Contract>(
        async () => {
          const contract = new ethers.Contract(
            this.config.bridgeContracts.rootERC20BridgeFlowRate,
            ROOT_ERC20_BRIDGE_FLOW_RATE,
            this.config.rootProvider,
          );
          return contract;
        },
        BridgeErrorType.INTERNAL_ERROR,
      );
    }

    const flowRatePromises:Array<Promise<any>> = [];
    const flowRateLengthPromises:Array<Promise<any>> = [];

    const flowRatePromisesReceivers: Array<string> = [];

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
        txHash: req.transactions[i].txHash,
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

      let flowRatePromiseIndex: number = flowRatePromisesReceivers.findIndex((el) => el === txItem.recipient);
      if (metaStatus === StatusResponse.COMPLETE
        && isWithdraw && txItem.recipient) {
        // consolidate the calls we have to make to the flow rate by receiver
        if (flowRatePromiseIndex === -1) {
          flowRatePromisesReceivers.push(txItem.recipient);
          flowRatePromiseIndex = flowRatePromisesReceivers.length - 1;
        }
        txItem.data.flowRatePromiseIndex = flowRatePromiseIndex;
      }

      txStatusResponse.transactions.push(txItem);
    }// for

    for (const flowRateReceiver of flowRatePromisesReceivers) {
      flowRateLengthPromises.push(rootBridge!.getPendingWithdrawalsLength(flowRateReceiver));
    }

    let flowRateLengthResponses:Array<number> = [];

    try {
      flowRateLengthResponses = await Promise.all(flowRateLengthPromises);
    } catch (err) {
      throw new BridgeError(
        `Failed to fetch the Flow Rate pending lengths with the reason: ${err}`,
        BridgeErrorType.FLOW_RATE_ERROR,
      );
    }

    for (let i = 0, l = flowRatePromisesReceivers.length; i < l; i++) {
      const indices: Array<number> = [...Array(flowRateLengthResponses[i]).keys()];
      flowRatePromises.push(rootBridge!.getPendingWithdrawals(flowRatePromisesReceivers[i], indices));
    }

    let flowRateResponses:Array<Array<RootBridgePendingWithdrawal>> = [];
    if (flowRatePromises.length > 0) {
      try {
        flowRateResponses = await Promise.all(flowRatePromises);
      } catch (err) {
        throw new BridgeError(
          `Failed to fetch the Flow Rate statuses with the reason: ${err}`,
          BridgeErrorType.FLOW_RATE_ERROR,
        );
      }
    }

    for (const txStatusRes of txStatusResponse.transactions) {
      if (txStatusRes.data.flowRatePromiseIndex !== -1 && flowRateResponses[txStatusRes.data.flowRatePromiseIndex]) {
        const flowRatedTx = flowRateResponses[txStatusRes.data.flowRatePromiseIndex].find((el) => (
          el.amount.toString() === txStatusRes.amount.toString()
          && el.token === txStatusRes.token
          && el.withdrawer === txStatusRes.sender
        ));
        if (flowRatedTx) {
          txStatusRes.status = StatusResponse.FLOW_RATE_CONTROLLED;
          txStatusRes.data = {
            timestamp: flowRatedTx.timestamp.toString(),
          };
        }
      }
      delete txStatusRes.data.flowRatePromiseIndex;
    }

    // Return the tx status response
    return txStatusResponse;
  }

  /**
 * Queries for the information about which tokens are flowrated and how long the delay is.
 *
 * @param {void} - no params required.
 * @returns {Promise<FlowRateInfoResponse>} - A promise that resolves to an object containing the flow rate information.
 * @throws {BridgeError} - If an error occurs during the query, a BridgeError will be thrown with a specific error type.
 * @dev this SDK method is currently stubbed
 */
  public async getFlowRateInfo(req: FlowRateInfoRequest = {}): Promise<FlowRateInfoResponse> {
    // eslint-disable-next-line no-console
    console.log('stubbed response with req', req);
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

    const rootBridge = await withBridgeError<ethers.Contract>(
      async () => {
        const contract = new ethers.Contract(
          this.config.bridgeContracts.rootERC20BridgeFlowRate,
          ROOT_ERC20_BRIDGE_FLOW_RATE,
          this.config.rootProvider,
        );
        return contract;
      },
      BridgeErrorType.INTERNAL_ERROR,
    );

    const pendingLength: ethers.BigNumber = await rootBridge.getPendingWithdrawalsLength(req.recipient);

    const pendingWithdrawals: PendingWithdrawalsResponse = {
      pending: [],
    };

    if (pendingLength.toNumber() === 0) {
      return pendingWithdrawals;
    }

    const indices: Array<number> = [...Array(pendingLength).keys()];

    const pending:Array<RootBridgePendingWithdrawal> = await rootBridge.getPendingWithdrawals(req.recipient, indices);

    const timestampNow = Math.floor(Date.now() / 1000);

    for (let i = 0, l = pending.length; i < l; i++) {
      // @TODO query timeout from contract (SMR-2090)
      const timeoutEnd = pending[i].timestamp.toNumber() + (60 * 60 * 24);
      if (timeoutEnd > timestampNow) {
        pendingWithdrawals.pending[i] = {
          canWithdraw: false,
        } as PendingWithdrawal;
      } else {
        pendingWithdrawals.pending[i] = {
          canWithdraw: true,
        } as PendingWithdrawal;
      }
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
  public async getFlowRateWithdrawTx(req:FlowRateWithdrawRequest): Promise<FlowRateWithdrawResponse> {
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

    const rootBridge = await withBridgeError<ethers.Contract>(
      async () => {
        const contract = new ethers.Contract(
          this.config.bridgeContracts.rootERC20BridgeFlowRate,
          ROOT_ERC20_BRIDGE_FLOW_RATE,
          this.config.rootProvider,
        );
        return contract;
      },
      BridgeErrorType.INTERNAL_ERROR,
    );

    const pending:Array<RootBridgePendingWithdrawal> = await
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

    // @TODO query timeout from contract (SMR-2090)
    const timeoutEnd = pending[0].timestamp.toNumber() + (60 * 60 * 24);
    const timestampNow = Math.floor(Date.now() / 1000);

    if (timeoutEnd > timestampNow) {
      return {
        pendingWithdrawal: {
          canWithdraw: false,
          withdrawer: pending[0].withdrawer,
          token: pending[0].token,
          amount: pending[0].amount,
          timeoutStart: pending[0].timestamp.toNumber(),
          timeoutEnd,
        },
        unsignedTx: null,
      };
    }

    const data:string = await withBridgeError<string>(async () => rootBridge.interface.encodeFunctionData(
      'finaliseQueuedWithdrawal',
      [req.recipient, req.index],
    ), BridgeErrorType.INTERNAL_ERROR);

    return {
      pendingWithdrawal: {
        canWithdraw: true,
        withdrawer: pending[0].withdrawer,
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
    console.log('stubbed response with req', req);
    return {
      rootToken: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
      childToken: 'NATIVE',
    };
  }
}
