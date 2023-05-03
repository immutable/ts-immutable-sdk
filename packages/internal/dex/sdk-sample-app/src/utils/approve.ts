import { ethers } from 'ethers';

export const getERC20ApproveCalldata = (): string => {
  const ABI = ['function approve(address to, uint amount)'];
  const iface = new ethers.utils.Interface(ABI);
  return iface.encodeFunctionData('approve', [
    process.env.NEXT_PUBLIC_PERIPHERY_ROUTER_DEV,
    ethers.constants.MaxUint256,
  ]);
};
