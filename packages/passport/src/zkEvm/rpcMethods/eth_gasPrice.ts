import { EthMethodParams } from './types';

export const ethGasPrice = async ({
  jsonRpcProvider,
}: EthMethodParams): Promise<string> => {
  const gasPrice = await jsonRpcProvider.getGasPrice();
  return gasPrice.toString();
};
