import { ethers } from 'ethers';
import { MetamaskConnectParams } from './types';
export declare function connect({ chainID, }: MetamaskConnectParams): Promise<ethers.providers.Web3Provider>;
