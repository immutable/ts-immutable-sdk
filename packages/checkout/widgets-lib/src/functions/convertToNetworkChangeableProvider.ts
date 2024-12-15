import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

export const convertToNetworkChangeableProvider = async (
  provider: Web3Provider,
): Promise<Web3Provider> => new ethers.providers.Web3Provider(provider.provider, 'any');
