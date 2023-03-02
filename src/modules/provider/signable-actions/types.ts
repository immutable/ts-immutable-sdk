import { EthSigner } from '@imtbl/core-sdk';
import { StarkSigner } from '../../../types';

export type Signers = {
  ethSigner: EthSigner;
  starkExSigner: StarkSigner;
};
