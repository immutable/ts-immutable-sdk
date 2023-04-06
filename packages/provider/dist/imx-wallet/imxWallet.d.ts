import { ethers } from "ethers";
import { ImxSigner } from "./ImxSigner";
import { Environment } from "@imtbl/config";
export declare function connect(l1Provider: ethers.providers.Web3Provider, env: Environment): Promise<ImxSigner>;
export declare function disconnect(imxSigner: ImxSigner): Promise<void>;
