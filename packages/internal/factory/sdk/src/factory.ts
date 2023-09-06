import { JsonFragment } from '@ethersproject/abi';
import { FactoryConfiguration } from 'config';
import { PRESETS } from 'constants/presets';
import { FACTORY } from 'contracts/ABIs/Factory';
import { FactoryError, FactoryErrorType, withFactoryError } from 'errors';
import { ethers } from 'ethers';
import {
  GetPresetsRequest,
  GetPresetsResponse,
  GetUnsignedDeployPresetTxRequest,
  GetUnsignedDeployPresetTxResponse,
  Preset,
} from 'types';

/**
 * Represents a factory
 */
export class Factory {
  private config: FactoryConfiguration;

  constructor(config: FactoryConfiguration) {
    this.config = config;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getPresets(req: GetPresetsRequest): Promise<GetPresetsResponse> {
    await this.validateChainConfiguration();
    return { presets: PRESETS };
  }

  public async getUnsignedDeployPresetTx(
    req: GetUnsignedDeployPresetTxRequest,
  ): Promise<GetUnsignedDeployPresetTxResponse> {
    await this.validateChainConfiguration();

    let preset = null;
    for (const p of PRESETS) {
      if (req.presetName === p.name) {
        preset = p;
        break;
      }
    }
    if (!preset) {
      throw new FactoryError(
        `Preset with name ${req.presetName} not found`,
        FactoryErrorType.NOT_FOUND,
      );
    }

    const factory: ethers.Contract = new ethers.Contract(this.config.factoryInstance.factory, FACTORY);

    const abiEncodedArgs = await Factory.abiEncodeArguments(preset, req.arguments);

    // eslint-disable-next-line no-console
    console.log('======================');
    // eslint-disable-next-line no-console
    console.log(abiEncodedArgs);
    // eslint-disable-next-line no-console
    console.log('======================');

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

  // pseudorandom. not cryptographically secure
  private static randomBytes32() {
    return `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  }

  // Query the chain providers to ensure the chainID is as expected by the SDK.
  // This is to prevent the SDK from being used on the wrong chain, especially after a chain reset.
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
