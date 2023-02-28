import { EthSigner } from "@imtbl/core-sdk";
import { StarkSigner } from "../../../types";

export type signableActionParams = {
  ethSigner: EthSigner;
  starkExSigner: StarkSigner;
};
