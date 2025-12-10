import { StarkSigner } from '@imtbl/x-client';
import { Signer as EthSigner } from 'ethers';

export type Signers = {
  ethSigner: EthSigner;
  starkSigner: StarkSigner;
};
