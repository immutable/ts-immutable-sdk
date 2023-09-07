import { JsonFragment } from '@ethersproject/abi';
import { FactoryConfiguration } from 'config';
import { PRESETS } from 'constants/presets';
import { FACTORY } from 'contracts/ABIs/Factory';
import { FactoryError, FactoryErrorType, withFactoryError } from 'errors';
import { ethers } from 'ethers';
import {
  GetDeployDetailsRequest,
  GetDeployDetailsResponse,
  GetPresetsRequest,
  GetPresetsResponse,
  GetUnsignedDeployPresetTxRequest,
  GetUnsignedDeployPresetTxResponse,
  Preset,
} from 'types';

/**
 * @class Factory
 *
 * The Factory SDK serves as an interface to a Factory smart contract on the blockchain. This smart contract facilitates the deployment
 * of other contracts based on preset configurations. This SDK provides a user-friendly way to deploy these contracts and
 * fetch details of deployments.
 *
 * @example
 * const factory = new Factory(config);
 * const presets = await factory.getPresets({});
 *
 * @property {FactoryConfiguration} config - The configuration settings used to connect to and interact with the blockchain.
 */
export class Factory {
  private config: FactoryConfiguration;

  /**
   * Constructs a new instance of the Factory SDK.
   *
   * @param {FactoryConfiguration} config - Configuration settings for this SDK instance.
   */
  constructor(config: FactoryConfiguration) {
    this.config = config;
  }

  /**
   * @method getPresets
   *
   * Retrieves the available contract presets from the smart contract factory.
   *
   * @param {GetPresetsRequest} req - Object containing parameters for fetching presets.
   * Currently unused, but can be extended for pagination or filtering.
   *
   * @returns {Promise<GetPresetsResponse>} A Promise that resolves to an object containing an array of available presets.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getPresets(req: GetPresetsRequest): Promise<GetPresetsResponse> {
    await this.validateChainConfiguration();
    return { presets: PRESETS };
  }

  /**
   * @method getUnsignedDeployPresetTx
   *
   * Creates an unsigned transaction object for deploying a contract based on a preset.
   *
   * @param {GetUnsignedDeployPresetTxRequest} req - Object containing the preset name and constructor arguments.
   *
   * @returns {Promise<GetUnsignedDeployPresetTxResponse>} A Promise that resolves to an object containing the unsigned transaction details.
   *
   * @throws {FactoryError} If the preset is not found or the chain configuration is invalid.
   */
  public async getUnsignedDeployPresetTx(
    req: GetUnsignedDeployPresetTxRequest,
  ): Promise<GetUnsignedDeployPresetTxResponse> {
    await this.validateChainConfiguration();

    const preset = PRESETS.find((p) => p.name === req.presetName);
    if (!preset) {
      throw new FactoryError(
        `Preset with name ${req.presetName} not found`,
        FactoryErrorType.NOT_FOUND,
      );
    }

    const factory: ethers.Contract = new ethers.Contract(this.config.factoryInstance.factory, FACTORY);

    const abiEncodedArgs = await Factory.abiEncodeArguments(preset, req.arguments);

    const data: string = factory.interface.encodeFunctionData(
      'deployPreset',
      [req.presetName, Factory.randomBytes32(), abiEncodedArgs],
    );

    // Create the unsigned transaction for the approval
    const unsignedTx: ethers.providers.TransactionRequest = {
      data,
      to: this.config.factoryInstance.factory,
      value: 0,
    };

    return { unsignedTx };
  }

  /**
   * @method getDeployDetails
   *
   * Retrieves the details of a deployed contract using the transaction receipt.
   *
   * @param {GetDeployDetailsRequest} req - Object containing the transaction receipt.
   *
   * @returns {Promise<GetDeployDetailsResponse>} A Promise that resolves to an object containing the deployed contract's address.
   *
   * @throws {FactoryError} If the transaction failed, if no logs are present in the receipt, or if the chain configuration is invalid.
   */
  public async getDeployDetails(req: GetDeployDetailsRequest): Promise<GetDeployDetailsResponse> {
    await this.validateChainConfiguration();
    if (req.receipt.status === 0) {
      throw new FactoryError(
        `The transaction with hash ${req.receipt.transactionHash} reverted`,
        FactoryErrorType.INVALID_ARGUMENT,
      );
    }
    if (!(req.receipt.logs.length >= 1)) {
      throw new FactoryError(
        `The transaction with hash ${req.receipt.transactionHash} has unexpected logs. Expected at least 1 log`,
        FactoryErrorType.INVALID_ARGUMENT,
      );
    }

    for (const log of req.receipt.logs) {
      // This signature "0x68cc5c99c3d3fc4545fc38c25e0c6974cc1f0c1d73cc822a9f376904e5117dd1" is derived from
      // keccak256(PresetDeployed(string,address,address,uint256,bytes32,bytes))
      if (log.topics[0] === '0x68cc5c99c3d3fc4545fc38c25e0c6974cc1f0c1d73cc822a9f376904e5117dd1') {
        return {
          deployedAddress: ethers.utils.getAddress(log.topics[2].slice(-40)),
        };
      }
    }
    throw new FactoryError(
      `Did not find any logs with expected topic for transaction with hash ${req.receipt.transactionHash}`,
      FactoryErrorType.INVALID_ARGUMENT,
    );
  }

  /**
   * Encodes ABI for contract arguments.
   * @param {Preset} preset - Preset object containing the ABI definition for contract creation.
   * @param {string[]} args - Contract arguments to be ABI-encoded.
   * @returns {Promise<string>} A Promise that resolves to ABI-encoded contract arguments.
   * @throws {FactoryError} If ABI encoding fails or non-constructor presets are provided.
   * @private
   */
  private static async abiEncodeArguments(preset: Preset, args: string[]): Promise<string> {
    const abiFragment: JsonFragment = {
      inputs: preset.creationABI.inputs,
      type: preset.creationABI.type,
      stateMutability: preset.creationABI.stateMutability,
    };
    const iface = new ethers.utils.Interface([abiFragment]);

    if (preset.creationABI.type === 'constructor') {
      return await withFactoryError<string>(
        async () => iface.encodeDeploy(args),
        FactoryErrorType.INVALID_ARGUMENT,
      );
    }
    throw new FactoryError(
      'Non-constructor presets are not supported yet in the SDK',
      FactoryErrorType.UNSUPPORTED_ERROR,
    );
  }

  /**
   * Generates a pseudorandom 32-byte hex string.
   * Note: This is not cryptographically secure.
   * @returns {string} A 32-byte hex string.
   * @private
   */
  private static randomBytes32() {
    return `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  }

  /**
   * Validates the chain configuration by comparing the chainID from the provider and config.
   * @returns {Promise<void>} A Promise that resolves if the validation is successful.
   * @throws {FactoryError} If the chainIDs do not match.
   * @private
   */
  private async validateChainConfiguration(): Promise<void> {
    const errMessage = 'Please upgrade to the latest version of the Factory SDK or provide valid configuration';

    const network = await withFactoryError<ethers.providers.Network>(
      async () => this.config.provider.getNetwork(),
      FactoryErrorType.PROVIDER_ERROR,
    );
    if (network.chainId.toString() !== this.config.factoryInstance.chainID) {
      throw new FactoryError(
        `Provider chainID ${network.chainId} does not match expected chainID ${this.config.factoryInstance.chainID}. ${errMessage}`,
        FactoryErrorType.UNSUPPORTED_ERROR,
      );
    }
  }
}
