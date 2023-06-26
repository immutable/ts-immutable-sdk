import { ethGasPrice } from './eth_gasPrice';
import { EthMethodParams } from './types';

describe('eth_getPrice', () => {
  it('should return the gas price', async () => {
    const jsonRpcProvider = {
      getGasPrice: jest.fn().mockResolvedValueOnce(0x46da),
    } as Partial<EthMethodParams>;
    const result = await ethGasPrice({ jsonRpcProvider } as EthMethodParams);
    expect(result).toEqual('18138');
  });
});
