import { Signer } from "@ethersproject/abstract-signer";
import { TransactionResponse } from "@ethersproject/providers";
import { Configuration } from "@imtbl/config";
type CompleteEthWithdrawalActionParams = {
    ethSigner: Signer;
    starkPublicKey: string;
    config: Configuration;
};
export declare function completeEthWithdrawalAction({ ethSigner, starkPublicKey, config, }: CompleteEthWithdrawalActionParams): Promise<TransactionResponse>;
export {};
