import { Signer } from "@ethersproject/abstract-signer";
import { ERC721Token } from "types";
import { TransactionResponse } from "@ethersproject/providers";
import { Configuration } from "@imtbl/config";
type CompleteERC721WithdrawalActionParams = {
    ethSigner: Signer;
    starkPublicKey: string;
    token: ERC721Token;
    config: Configuration;
};
export declare function completeERC721WithdrawalAction({ ethSigner, starkPublicKey, token, config, }: CompleteERC721WithdrawalActionParams): Promise<TransactionResponse>;
export {};
