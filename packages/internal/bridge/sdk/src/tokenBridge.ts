/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
import axios, { AxiosResponse } from 'axios';
import { ethers } from 'ethers';
import { ROOT_AXELAR_ADAPTER } from 'contracts/ABIs/RootAxelarBridgeAdapter';
import {
  ETHEREUM_NATIVE_TOKEN_ADDRESS,
  ETH_MAINNET_TO_ZKEVM_MAINNET,
  ETH_SEPOLIA_TO_ZKEVM_TESTNET,
  ZKEVM_DEVNET_CHAIN_ID,
  ZKEVM_MAINNET_CHAIN_ID,
  ZKEVM_TESTNET_CHAIN_ID,
  axelarAPIEndpoints,
  axelarChains,
  bridgeMethods,
  tenderlyAPIEndpoints,
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
  FungibleToken,
  FlowRateInfoItem,
  TxStatusRequestItem,
  GetAllowanceResponse,
  TenderlyGasEstimatesResponse,
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
    return await this.getFeePrivate(req);
  }

  private async getFeePrivate(req: BridgeFeeRequest): Promise<BridgeFeeResponse> {
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

    const imtblFee: ethers.BigNumber = ethers.BigNumber.from(0);
    let bridgeFee: ethers.BigNumber = ethers.BigNumber.from(0);
    let sourceChainGas = ethers.BigNumber.from(0);
    let approvalFee = ethers.BigNumber.from(0);
    let destinationChainGas = 0;

    if (req.action === BridgeFeeActions.FINALISE_WITHDRAWAL) {
      sourceChainGas = await this.getGasEstimates(
        this.config.rootProvider,
        BridgeMethodsGasLimit.FINALISE_WITHDRAWAL,
      );

      const totalFees: ethers.BigNumber = sourceChainGas.add(approvalFee).add(bridgeFee).add(imtblFee);

      return {
        sourceChainGas,
        approvalFee,
        bridgeFee,
        imtblFee, // no network fee charged currently
        totalFees,
      };
    }

    const sourceProvider:ethers.providers.Provider = (req.action === BridgeFeeActions.WITHDRAW)
      ? this.config.childProvider : this.config.rootProvider;

    let fees;

    // use static fees as a fallback where no sender & recipient is parsed
    // @TODO deprecate this and always use dynamic fees
    if (req.senderAddress === '0x0' || req.recipientAddress === '0x0') {
      fees = await this.getFeesStatic(
        sourceProvider,
        req.action,
        req.token,
      );
    } else {
      fees = await this.getFeesDynamic(
        sourceProvider,
        req.action,
        req.sourceChainId,
        req.token,
        req.senderAddress,
        req.recipientAddress,
        req.amount,
      );
    }

    destinationChainGas = fees.destinationChainGas;
    sourceChainGas = fees.sourceChainGas;
    approvalFee = fees.approvalFee;

    const feeResult = await this.calculateBridgeFee(
      req.sourceChainId,
      req.destinationChainId,
      destinationChainGas,
      req.gasMultiplier,
    );

    bridgeFee = feeResult.bridgeFee;

    const totalFees: ethers.BigNumber = sourceChainGas.add(approvalFee).add(bridgeFee).add(imtblFee);

    return {
      sourceChainGas,
      approvalFee,
      bridgeFee,
      imtblFee, // no network fee charged currently
      totalFees,
    };
  }

  private async getFeesStatic(
    sourceProvider: ethers.providers.Provider,
    action: BridgeFeeActions.DEPOSIT | BridgeFeeActions.WITHDRAW,
    token:string,
  ) {
    let sourceChainGas: ethers.BigNumber = ethers.BigNumber.from(0);
    let approvalFee: ethers.BigNumber = ethers.BigNumber.from(0);

    if (token.toUpperCase() !== 'NATIVE') {
      approvalFee = await this.getGasEstimates(
        sourceProvider,
        BridgeMethodsGasLimit.APPROVE_TOKEN,
      );
    }

    sourceChainGas = await this.getGasEstimates(
      sourceProvider,
      BridgeMethodsGasLimit[`${action}_SOURCE`],
    );

    const destinationChainGas: number = BridgeMethodsGasLimit[`${action}_DESTINATION`];

    return {
      sourceChainGas,
      approvalFee,
      destinationChainGas,
    };
  }

  private async getFeesDynamic(
    sourceProvider: ethers.providers.Provider,
    action: BridgeFeeActions.DEPOSIT | BridgeFeeActions.WITHDRAW,
    sourceChainId: string,
    token:string,
    senderAddress: string,
    recipientAddress: string,
    amount: ethers.BigNumber,
  ) {
    let sourceChainGas: ethers.BigNumber = ethers.BigNumber.from(0);
    let approvalFee: ethers.BigNumber = ethers.BigNumber.from(0);
    let amountToApprove = ethers.BigNumber.from(0);
    let sourceBridgeAddress;
    let erc20Contract;

    if (token.toUpperCase() !== 'NATIVE') {
      const resGetAllowance = await this.getAllowance(
        sourceChainId,
        token,
        senderAddress,
        amount,
      );
      amountToApprove = resGetAllowance.amountToApprove;
      erc20Contract = resGetAllowance.erc20Contract;
    }

    const destinationChainGas: number = BridgeMethodsGasLimit[`${action}_DESTINATION`];

    if (action === BridgeFeeActions.DEPOSIT) {
      // deposit
      sourceBridgeAddress = this.config.bridgeContracts.rootERC20BridgeFlowRate;
      const tenderlyRes = await this.getTenderlyBridgeGasEstimates(
        sourceChainId,
        senderAddress,
        recipientAddress,
        amount,
        amountToApprove,
        sourceBridgeAddress,
        erc20Contract,
        token,
      );

      if (tenderlyRes.approvalFee > 0) {
        approvalFee = await this.getGasEstimates(
          sourceProvider,
          tenderlyRes.approvalFee,
        );
      }

      sourceChainGas = await this.getGasEstimates(
        sourceProvider,
        tenderlyRes.sourceChainGas,
      );
    } else {
      // withdrawal
      sourceChainGas = await this.getGasEstimates(
        sourceProvider,
        BridgeMethodsGasLimit[`${action}_SOURCE`],
      );

      if (amountToApprove.gt(0)) {
        approvalFee = await this.getGasEstimates(
          sourceProvider,
          BridgeMethodsGasLimit.APPROVE_TOKEN,
        );
      }
      // destinationChainGas = await this.getTenderlyAdapterGasEstimates(
      //   req.destinationChainId,
      //   req.senderAddress,
      //   req.recipientAddress,
      //   req.amount,
      //   req.token,
      // );
    }
    return {
      sourceChainGas,
      approvalFee,
      destinationChainGas,
    };
  }

  // @DEV this function is not used until issue SMR-2559
  private async getTenderlyAdapterGasEstimates(
    destinationChainId:string,
    sender: string,
    recipient: string,
    amount: ethers.BigNumber,
    token: FungibleToken,
  ): Promise<number> {
    console.log('getTenderlyAdapterGasEstimates', destinationChainId, sender, recipient, amount, token);

    let sourceProvider:ethers.providers.Provider;
    let sourceAdapterAddress: string;
    if (destinationChainId === this.config.bridgeInstance.rootChainID) {
      sourceProvider = this.config.rootProvider;
      sourceAdapterAddress = this.config.bridgeContracts.rootAxelarAdapter;
    } else {
      sourceProvider = this.config.childProvider;
      sourceAdapterAddress = this.config.bridgeContracts.childAxelarAdapter;
    }

    const axelarAdapterContract: ethers.Contract = await withBridgeError<ethers.Contract>(
      async () => new ethers.Contract(sourceAdapterAddress, ROOT_AXELAR_ADAPTER, sourceProvider),
      BridgeErrorType.PROVIDER_ERROR,
    );

    // @TODO this is just a static test, real payload needs to be constructed using the params parsed in
    const executeData = await withBridgeError<string>(async () => axelarAdapterContract.interface
      .encodeFunctionData('execute', [
        '0xb5d4436a9cb2a42a521b47c97c8d50c5d63fe5f7c3e9cd91611b922febffd11f',
        'immutable',
        '0x6328Ac88ba8D466a0F551FC7C42C61d1aC7f92ab',
        // eslint-disable-next-line max-len
        '0x7a8dc26796a1e50e6e190b70259f58f6a4edd5b22280ceecc82b687b8e982869000000000000000000000000e2629e08f4125d14e446660028bd98ee60ee69f200000000000000000000000024e190929c646bffb3f3bfd81ae3b8ea24194c80000000000000000000000000c4c3d44eb95c24babc172ff4a7006ed1565e9d9e0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      ]), BridgeErrorType.INTERNAL_ERROR);

    console.log('executeData', executeData);

    const tenderlyAPI = this.getTenderlyEndpoint(destinationChainId);
    let axiosResponse:AxiosResponse;

    // @TODO this needs to use state overrides so the transaction doesnt revert because the commandId is invalid.
    const simulations = [{
      network_id: destinationChainId,
      estimate_gas: true,
      simulation_type: 'quick',
      block_number: 5370742,
      from: sender,
      to: sourceAdapterAddress,
      input: executeData,
    }];

    console.log('simulations', simulations);

    try {
      axiosResponse = await axios.post(
        tenderlyAPI,
        {
          simulations,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error: any) {
      axiosResponse = error.response;
    }

    if (axiosResponse.data.error) {
      throw new BridgeError(
        `Estimating gas failed with the reason: ${axiosResponse.data.error.message}`,
        BridgeErrorType.TENDERLY_GAS_ESTIMATE_FAILED,
      );
    }

    const simResults = axiosResponse.data.simulation_results;

    console.log('simResults', simResults);

    if (simResults.length !== 1 || simResults[0].simulation.gas_used === undefined) {
      throw new BridgeError(
        'Estimating gas did not return simulation results',
        BridgeErrorType.TENDERLY_GAS_ESTIMATE_FAILED,
      );
    }

    return simResults[0].simulation.gas_used;
  }

  private async getTenderlyBridgeGasEstimates(
    sourceChainId:string,
    sender: string,
    recipient: string,
    amount: ethers.BigNumber,
    amountToApprove: ethers.BigNumber,
    contractToApprove: string | undefined,
    erc20Contract: ethers.Contract | undefined,
    token: FungibleToken,
  ): Promise<TenderlyGasEstimatesResponse> {
    const simulations: Array<any> = [];

    if (amountToApprove.gt(0) && token.toUpperCase() !== 'NATIVE') {
      if (!erc20Contract || !contractToApprove) {
        throw new BridgeError(
          `erc20Contract not found. The address (${contractToApprove}) is not a valid.`,
          BridgeErrorType.INVALID_ERC20_CONTRACT,
        );
      } else {
        // Encode the approve function call data for the ERC20 contract
        const approvalData = await withBridgeError<string>(async () => erc20Contract.interface
          .encodeFunctionData('approve', [
            contractToApprove,
            amountToApprove,
          ]), BridgeErrorType.INTERNAL_ERROR);

        simulations.push({
          network_id: sourceChainId,
          estimate_gas: true,
          simulation_type: 'full',
          from: sender,
          to: token,
          input: approvalData,
        });
      }
    }

    if (!token) {
      throw new BridgeError(
        `token not found. The address (${token}) is not a valid.`,
        BridgeErrorType.INVALID_TOKEN,
      );
    }

    const txData = await this.getTxData(
      sourceChainId,
      sender,
      recipient,
      amount,
      token,
    );

    // tx value for simulation mocked as amount + 1 wei for a native bridge and 1 wei for token bridges
    const txValue = (token.toUpperCase() !== 'NATIVE') ? '1' : amount.add('1').toString();

    simulations.push({
      network_id: sourceChainId,
      estimate_gas: true,
      simulation_type: 'full',
      from: sender,
      to: contractToApprove,
      input: txData,
      value: txValue,
    });

    let axiosResponse:AxiosResponse;

    const tenderlyAPI = this.getTenderlyEndpoint(sourceChainId);

    try {
      axiosResponse = await axios.post(
        tenderlyAPI,
        {
          simulations,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error: any) {
      axiosResponse = error.response;
    }

    if (axiosResponse.data.error) {
      throw new BridgeError(
        `Estimating gas failed with the reason: ${axiosResponse.data.error.message}`,
        BridgeErrorType.TENDERLY_GAS_ESTIMATE_FAILED,
      );
    }

    if (axiosResponse.data.simulation_results.length !== simulations.length) {
      throw new BridgeError(
        'Estimating gas failed with mismatched responses',
        BridgeErrorType.TENDERLY_GAS_ESTIMATE_FAILED,
      );
    }

    const tenderlyGasEstimatesRes = {} as TenderlyGasEstimatesResponse;
    const simResults = axiosResponse.data.simulation_results;

    if (simResults.length === 1) {
      if (simResults[0].simulation.error_message) {
        throw new BridgeError(
          `Estimating deposit gas failed with the reason: ${simResults[0].simulation.error_message}`,
          BridgeErrorType.TENDERLY_GAS_ESTIMATE_FAILED,
        );
      } else {
        tenderlyGasEstimatesRes.sourceChainGas = simResults[0].simulation.gas_used;
        tenderlyGasEstimatesRes.approvalFee = 0;
      }
    } else if (axiosResponse.data.simulation_results.length === 2) {
      if (simResults[0].simulation.error_message) {
        throw new BridgeError(
          `Estimating approval gas failed with the reason: ${simResults[0].simulation.error_message}`,
          BridgeErrorType.TENDERLY_GAS_ESTIMATE_FAILED,
        );
      } else if (simResults[1].simulation.error_message) {
        throw new BridgeError(
          `Estimating deposit gas failed with the reason: ${simResults[1].simulation.error_message}`,
          BridgeErrorType.TENDERLY_GAS_ESTIMATE_FAILED,
        );
      } else {
        tenderlyGasEstimatesRes.approvalFee = simResults[0].simulation.gas_used;
        tenderlyGasEstimatesRes.sourceChainGas = simResults[1].simulation.gas_used;
      }
    } else {
      throw new BridgeError(
        `Estimating gas failed with unexpected number responses ${axiosResponse.data.simulation_results.length}`,
        BridgeErrorType.TENDERLY_GAS_ESTIMATE_FAILED,
      );
    }

    return tenderlyGasEstimatesRes;
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
    return await this.getUnsignedApproveBridgeTxPrivate(req);
  }

  public async getUnsignedApproveBridgeTxPrivate(
    req: ApproveBridgeRequest,
  ): Promise<ApproveBridgeResponse> {
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

    const resGetAllowance = await this.getAllowance(
      req.sourceChainId,
      req.token,
      req.senderAddress,
      req.amount,
    );

    if (resGetAllowance.amountToApprove.eq(0)) {
      return {
        contractToApprove: null,
        unsignedTx: null,
      };
    }

    // Encode the approve function call data for the ERC20 contract
    const data: string = await withBridgeError<string>(async () => resGetAllowance.erc20Contract.interface
      .encodeFunctionData('approve', [
        resGetAllowance.contractToApprove,
        resGetAllowance.amountToApprove,
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
      contractToApprove: resGetAllowance.contractToApprove,
      unsignedTx,
    };
  }

  private async getAllowance(sourceChainId:string, token: string, senderAddress: string, amount: ethers.BigNumber):
  Promise<GetAllowanceResponse> {
    let sourceProvider:ethers.providers.Provider;
    let sourceBridgeAddress: string;
    if (sourceChainId === this.config.bridgeInstance.rootChainID) {
      sourceProvider = this.config.rootProvider;
      sourceBridgeAddress = this.config.bridgeContracts.rootERC20BridgeFlowRate;
    } else {
      sourceProvider = this.config.childProvider;
      sourceBridgeAddress = this.config.bridgeContracts.childERC20Bridge;
    }

    const erc20Contract: ethers.Contract = await withBridgeError<ethers.Contract>(
      async () => new ethers.Contract(token, ERC20, sourceProvider),
      BridgeErrorType.PROVIDER_ERROR,
    );

    // Get the current approved allowance of the RootERC20Predicate
    const allowance: ethers.BigNumber = await withBridgeError<ethers.BigNumber>(() => erc20Contract
      .allowance(
        senderAddress,
        sourceBridgeAddress,
      ), BridgeErrorType.PROVIDER_ERROR);

    // If the allowance is greater than or equal to the deposit amount, no approval is required
    if (allowance.gte(amount)) {
      return {
        erc20Contract,
        allowance,
        amount,
        amountToApprove: ethers.BigNumber.from(0),
        contractToApprove: sourceBridgeAddress,
      };
    }

    return {
      erc20Contract,
      allowance,
      amount,
      amountToApprove: amount,
      contractToApprove: sourceBridgeAddress,
    };
  }

  private async getBridgeContract(sourceChainId: string) {
    let contract: ethers.Contract;
    let contractMethods: Record<string, string>;
    let contractAddress: string;
    let contractAction: BridgeFeeActions;
    if (sourceChainId === this.config.bridgeInstance.rootChainID) {
      contractAction = BridgeFeeActions.DEPOSIT;
      contractMethods = bridgeMethods.deposit;
      contractAddress = this.config.bridgeContracts.rootERC20BridgeFlowRate;
      contract = await withBridgeError<ethers.Contract>(
        async () => {
          const rootContract = new ethers.Contract(
            this.config.bridgeContracts.rootERC20BridgeFlowRate,
            ROOT_ERC20_BRIDGE_FLOW_RATE,
            this.config.rootProvider,
          );
          return rootContract;
        },
        BridgeErrorType.INTERNAL_ERROR,
      );
    } else {
      contractAction = BridgeFeeActions.WITHDRAW;
      contractMethods = bridgeMethods.withdraw;
      contractAddress = this.config.bridgeContracts.childERC20Bridge;
      contract = await withBridgeError<ethers.Contract>(
        async () => {
          const childContract = new ethers.Contract(
            this.config.bridgeContracts.childERC20Bridge,
            CHILD_ERC20_BRIDGE,
            this.config.childProvider,
          );
          return childContract;
        },
        BridgeErrorType.INTERNAL_ERROR,
      );
    }
    return {
      contract,
      contractAction,
      contractMethods,
      contractAddress,
    };
  }

  private async getTxData(
    sourceChainId: string,
    sender: string,
    recipient: string,
    amount: ethers.BigNumber,
    token: string,
  ) {
    const getContractRes = await this.getBridgeContract(sourceChainId);
    // Handle return if it is a native token
    if (token.toUpperCase() === 'NATIVE') {
      // Encode the function data into a payload
      let data: string;
      if (sender === recipient) {
        data = await withBridgeError<string>(async () => getContractRes.contract.interface.encodeFunctionData(
          getContractRes.contractMethods.native,
          [amount],
        ), BridgeErrorType.INTERNAL_ERROR);
      } else {
        data = await withBridgeError<string>(async () => getContractRes.contract.interface.encodeFunctionData(
          getContractRes.contractMethods.nativeTo,
          [recipient, amount],
        ), BridgeErrorType.INTERNAL_ERROR);
      }

      return data;
    }

    // Handle return for ERC20
    const erc20Token = ethers.utils.getAddress(token);

    // Encode the function data into a payload
    let data: string;
    if (sender === recipient) {
      data = await withBridgeError<string>(async () => getContractRes.contract.interface.encodeFunctionData(
        getContractRes.contractMethods.token,
        [erc20Token, amount],
      ), BridgeErrorType.INTERNAL_ERROR);
    } else {
      data = await withBridgeError<string>(async () => getContractRes.contract.interface.encodeFunctionData(
        getContractRes.contractMethods.tokenTo,
        [erc20Token, recipient, amount],
      ), BridgeErrorType.INTERNAL_ERROR);
    }
    return data;
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

    return this.getBridgeTx(
      sender,
      receipient,
      req.amount,
      req.token,
      req.sourceChainId,
      req.destinationChainId,
      this.config.rootProvider,
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
    sourceChainId: string,
    destinationChainId: string,
    provider: ethers.providers.Provider,
    gasMultiplier: number = 1.1,
  ): Promise<BridgeTxResponse> {
    const canReceive:boolean = await this.checkReceiver(provider, recipient);

    if (!canReceive) {
      throw new BridgeError(
        `address ${recipient} is not a valid receipient`,
        BridgeErrorType.INVALID_RECIPIENT,
      );
    }

    const getContractRes = await this.getBridgeContract(sourceChainId);

    const fees:BridgeFeeResponse = await this.getFeePrivate({
      action: getContractRes.contractAction,
      gasMultiplier,
      sourceChainId,
      destinationChainId,
      token,
      amount,
      senderAddress: sender,
      recipientAddress: recipient,
    });

    const data = await this.getTxData(
      sourceChainId,
      sender,
      recipient,
      amount,
      token,
    );

    const txValue = (token.toUpperCase() !== 'NATIVE')
      ? fees.bridgeFee.toString() : amount.add(fees.bridgeFee).toString();

    return {
      feeData: fees,
      unsignedTx: {
        data,
        to: getContractRes.contractAddress,
        value: txValue,
        chainId: parseInt(sourceChainId, 10),
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

  private getTenderlyEndpoint(source:string) {
    let tenderlyAPIEndpoint:string;
    if (source === ETH_MAINNET_TO_ZKEVM_MAINNET.rootChainID
      || source === ETH_MAINNET_TO_ZKEVM_MAINNET.childChainID) {
      tenderlyAPIEndpoint = tenderlyAPIEndpoints.mainnet;
    } else if (source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID
      || source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID) {
      tenderlyAPIEndpoint = tenderlyAPIEndpoints.testnet;
    } else {
      tenderlyAPIEndpoint = tenderlyAPIEndpoints.devnet;
    }
    return tenderlyAPIEndpoint;
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
        `Estimating Axelar Gas failed with the reason: ${axiosResponse.data.error.message}`,
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
    const txStatusResponse:TxStatusResponse = {
      transactions: [],
    };

    const txStatusItems = await this.getAxelarStatus(req.transactions, req.sourceChainId);

    const uniqueReceivers = await this.getUniqueReceivers(txStatusItems, req.sourceChainId);

    const pendingWithdrawalPromises:Array<Promise<PendingWithdrawalsResponse>> = [];

    for (const address of uniqueReceivers) {
      pendingWithdrawalPromises.push(this.getPendingWithdrawals({ recipient: address }));
    }

    let pendingWithdrawalResponses:Array<PendingWithdrawalsResponse> = [];

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
    txStatusItems:Array<TxStatusResponseItem>,
    sourceChainId: string,
  ): Promise<Array<string>> {
    const uniqueReceivers:Array<string> = [];

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
    transactions:Array<TxStatusRequestItem>,
    sourceChainId:string,
  ): Promise<Array<TxStatusResponseItem>> {
    const txStatusItems:Array<TxStatusResponseItem> = [];
    const statusPromises:Array<Promise<GMPStatusResponse>> = [];
    const axelarAPIEndpoint:string = this.getAxelarEndpoint(sourceChainId);
    const unpaidGasStatus = [GasPaidStatus.GAS_UNPAID, GasPaidStatus.GAS_PAID_NOT_ENOUGH_GAS];
    const abiCoder = new ethers.utils.AbiCoder();

    for (const transaction of transactions) {
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

    const contractPromises: Array<Promise<any>> = [];
    contractPromises.push(rootBridge.withdrawalQueueActivated());
    contractPromises.push(rootBridge.withdrawalDelay());

    for (let token of req.tokens) {
      if (token.toUpperCase() === 'NATIVE') {
        token = ETHEREUM_NATIVE_TOKEN_ADDRESS;
      }
      contractPromises.push(rootBridge.flowRateBuckets(token));
      contractPromises.push(rootBridge.largeTransferThresholds(token));
    }
    let contractPromisesRes:Array<any>;
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

    const indices: Array<number> = [];
    for (let i = 0; i < pendingLength.toNumber(); i++) {
      indices.push(i);
    }

    const pending:Array<RootBridgePendingWithdrawal> = await rootBridge.getPendingWithdrawals(req.recipient, indices);

    const timestampNow = Math.floor(Date.now() / 1000);

    const withdrawalDelay:ethers.BigNumber = await rootBridge.withdrawalDelay();

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

    const withdrawalDelay:ethers.BigNumber = await rootBridge.withdrawalDelay();
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

    const data:string = await withBridgeError<string>(async () => rootBridge.interface.encodeFunctionData(
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

    if (req.rootToken.toUpperCase() === 'NATIVE'
    || req.rootToken === this.config.bridgeContracts.rootChainWrappedETH) {
      const childBridge = await withBridgeError<ethers.Contract>(
        async () => {
          const contract = new ethers.Contract(
            this.config.bridgeContracts.childERC20Bridge,
            CHILD_ERC20_BRIDGE,
            this.config.childProvider,
          );
          return contract;
        },
        BridgeErrorType.INTERNAL_ERROR,
      );
      const childETHToken = await childBridge.childETHToken();

      return {
        rootToken: req.rootToken,
        childToken: childETHToken,
      };
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
        childToken: 'NATIVE',
      };
    }
    return {
      rootToken: req.rootToken,
      childToken: rootTokenChildAddress,
    };
  }
}
