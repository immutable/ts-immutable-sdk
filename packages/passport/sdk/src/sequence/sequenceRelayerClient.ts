import { PassportConfiguration } from '../config';
import { Relayer } from '@0xsequence/relayer';
import { Address, Hex } from 'ox';
import { JsonRpcError, RpcErrorCode } from '../zkEvm/JsonRpcError';
import { EvmChain } from '../types';
import { getChainConfig, ChainConfig } from './chainConfig';
import { Flow } from '@imtbl/metrics';
import { Environment } from '@imtbl/config';

export type RelayerClientInput = {
  config: PassportConfiguration,
};

export class SequenceRelayerClient {
  private readonly config: PassportConfiguration;
  private readonly relayers: Map<EvmChain, Relayer.RpcRelayer> = new Map();

  constructor({ config }: RelayerClientInput) {
    this.config = config;
  }

  private getRelayer(chain: EvmChain, chainConfig: ChainConfig): Relayer.RpcRelayer {
    let relayer = this.relayers.get(chain);
    
    if (!relayer) {
      relayer = new Relayer.RpcRelayer(
        chainConfig.relayerUrl,
        chainConfig.chainId,
        chainConfig.nodeUrl,
        fetch,
        this.config.sequenceProjectAccessKey,
      );
      
      this.relayers.set(chain, relayer);
    }
    
    return relayer;
  }

  async postToRelayer(
    chain: EvmChain,
    environment: Environment,
    to: Address.Address,
    data: Hex.Hex,
    flow: Flow,
  ): Promise<string> {
    flow.addEvent('startSubmitToRelayer');
    
    const chainConfig = getChainConfig(chain, environment);

    const relayer = this.getRelayer(chain, chainConfig);
    console.log(`postToRelayer relayer ${JSON.stringify(relayer)}`);
    const { opHash } = await relayer.relay(to, data, chainConfig.chainId);
    console.log(`postToRelayer opHash ${opHash}`);

    const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

    let transactionHash: string;
    while (true) {
      const status = await relayer.status(opHash, chainConfig.chainId);
      console.log(`postToRelayer status ${JSON.stringify(status)}`);
      if (status.status === "confirmed") {
        transactionHash = `${status.transactionHash}`;
        flow.addEvent('endSubmitToRelayer');
        break;
      } else if (status.status === "failed") {
        let errorMessage = `Transaction failed to submit with status ${status.reason}.`;
        throw new JsonRpcError(RpcErrorCode.RPC_SERVER_ERROR, errorMessage);
      }
      process.stdout.write(".");
      await wait(1500);
    }

    return transactionHash;
  }
}

