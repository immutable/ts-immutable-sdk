import { Signers } from "../signable-actions/types";
import { Configuration } from "@imtbl/config";
export declare const privateKey1 = "d90915fa5bce418a23184c9asdfasfasdf5c8e900e3035cf34e2dd36";
export declare const privateKey2 = "013fe4a5265bc6deb3f3b524b987sdf987f8c7a8ec2a998ae0512f493d763c8f";
export declare const transactionResponse: {
    hash: string;
};
export declare const testConfig: Configuration;
export declare const getTokenAddress: (symbol: string) => string;
/**
 * Generate a ethSigner/starkSigner object from a private key.
 */
export declare const generateSigners: (privateKey: string) => Promise<Signers>;
