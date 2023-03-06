import { EthSigner } from 'types';
import { StarkSigner } from "../../../types";

export type Signers = {
  ethSigner: EthSigner;
  starkExSigner: StarkSigner;
};
