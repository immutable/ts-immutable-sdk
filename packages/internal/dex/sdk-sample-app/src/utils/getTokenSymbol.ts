import { ethers } from 'ethers';

export async function getTokenSymbol(tokenAddress: string): Promise<string> {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL,
  );
  const symbolFunctionSig = ethers.utils.id('symbol()').substring(0, 10);
  const returnValue = await provider.call({
    to: tokenAddress,
    data: symbolFunctionSig,
  });
  return ethers.utils.defaultAbiCoder.decode(['string'], returnValue)[0];
}
