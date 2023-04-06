import { ERC721Token } from "@imtbl/core-sdk";
import { TransactionResponse } from "@ethersproject/providers";
import { Configuration } from "@imtbl/config";
import { Signers } from "../types";
type DepositERC721Params = {
    signers: Signers;
    deposit: ERC721Token;
    config: Configuration;
};
export declare function depositERC721({ signers: { ethSigner }, deposit, config, }: DepositERC721Params): Promise<TransactionResponse>;
export {};
