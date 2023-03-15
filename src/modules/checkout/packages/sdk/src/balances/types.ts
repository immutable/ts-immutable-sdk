import { Web3Provider } from "@ethersproject/providers";

export interface GetBalanceParams {
    provider: Web3Provider;
    walletAddress: string;
}