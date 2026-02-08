
import { Relayer } from '@0xsequence/relayer';
import { Address, Hex } from 'ox';
import { JsonRpcError, RpcErrorCode } from '../zkEvm/JsonRpcError';
import { ChainConfig } from '../types';
import { Flow } from '@imtbl/metrics';

export type RelayerClientInput = {
  config: ChainConfig,
};

export class SequenceRelayerClient {
  private readonly config: ChainConfig;
  private readonly relayer: Relayer.RpcRelayer;

  constructor({ config }: RelayerClientInput) {
    this.config = config;

    if (!this.config.sequenceProjectAccessKey) {
      throw new Error('sequenceProjectAccessKey is required');
    }

    if (!this.config.nodeUrl) {
      throw new Error('nodeUrl is required');
    }

    this.relayer = new Relayer.RpcRelayer(
      this.config.relayerUrl,
      this.config.chainId,
      this.config.nodeUrl,
      fetch,
      this.config.sequenceProjectAccessKey,
    );
  }

  async postToRelayer(
    to: Address.Address,
    data: Hex.Hex,
    flow: Flow,
  ): Promise<string> {
    flow.addEvent('startSubmitToRelayer');

    const { opHash } = await this.relayer.relay(to, data, this.config.chainId);
    console.log(`postToRelayer opHash ${opHash}`);

    const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

    let transactionHash: string;
    while (true) {
      const status = await this.relayer.status(opHash, this.config.chainId);
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

