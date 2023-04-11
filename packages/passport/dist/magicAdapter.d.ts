import { ethers } from 'ethers';
import { PassportConfiguration } from './config';
export default class MagicAdapter {
    private readonly magicClient;
    private readonly config;
    constructor(config: PassportConfiguration);
    login(idToken: string): Promise<ethers.providers.Web3Provider>;
}
