import { MockProvider } from 'utils/mockProvider';
import { getERC20Decimals } from './utils';
import { Multicall__factory, UniswapV3Pool__factory } from 'contracts/types';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { IMX_TEST_CHAIN, WETH_TEST_CHAIN } from 'utils/testUtils';

const address = '0xebbf4C07a63986204C37cc5A188AaBF53564C583';

describe('getERC20Decimals', () => {
  it('calls decimals()', async () => {
    const provider = new MockProvider();
    provider.mock(address, 'decimals()', '12');
    const decimals = await getERC20Decimals(address, provider);
    expect(decimals).toEqual(18);
  });

  it.only('xxx', async () => {
    const provider = new MockProvider();
    const x = defaultAbiCoder.encode(
      ['address', 'address', 'uint24'],
      [WETH_TEST_CHAIN.address, IMX_TEST_CHAIN.address, '3000']
    );
    provider.mock(address, 'token0()', x);
    const uniswap = UniswapV3Pool__factory.connect(address, provider);
    console.log({ x });
    const abc = await uniswap.functions.token0();
    expect(abc).toEqual(['0x4F062A3EAeC3730560aB89b5CE5aC0ab2C5517aE']);
  });
});
