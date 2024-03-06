import { EthSigner } from '@imtbl/core-sdk';
import { StarkSigner } from '@imtbl/x-client';

export type Signers = {
  ethSigner: EthSigner;
  starkSigner: StarkSigner;
};
