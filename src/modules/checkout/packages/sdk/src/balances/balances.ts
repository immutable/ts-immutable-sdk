/* eslint-disable @typescript-eslint/no-explicit-any */
import { Web3Provider } from "@ethersproject/providers";
import { BigNumber } from "ethers";
import { BalanceError } from "./errors";

export const getBalance = async (provider: Web3Provider, walletAddress: string): Promise<BigNumber> => {
    try {
        return await provider.getBalance(walletAddress);
    } catch (err: any) {
        console.log(err.message);
        throw new BalanceError(`Error occurred while attempting to get the balance for ${walletAddress}`);
    }
}
