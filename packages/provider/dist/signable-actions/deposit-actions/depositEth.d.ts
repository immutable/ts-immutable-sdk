import { ETHAmount } from "@imtbl/core-sdk";
import { Configuration } from "@imtbl/config";
import { TransactionResponse } from "@ethersproject/providers";
import { Signers } from "../types";
type DepositEthParams = {
    signers: Signers;
    deposit: ETHAmount;
    config: Configuration;
};
export declare function depositEth({ signers: { ethSigner }, deposit, config, }: DepositEthParams): Promise<TransactionResponse>;
export {};
