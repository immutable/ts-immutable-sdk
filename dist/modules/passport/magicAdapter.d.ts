import { ethers } from 'ethers';
import { Networks } from './types';
export default class MagicAdapter {
    private readonly magicClient;
    constructor(network?: Networks);
    login(idToken: string): Promise<ethers.providers.Web3Provider>;
}
