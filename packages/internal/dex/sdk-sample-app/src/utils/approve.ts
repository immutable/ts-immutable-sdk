import { BigNumberish, utils } from 'ethers';

export const getERC20ApproveCalldata = (amount: BigNumberish): string => {
  const ABI = ['function approve(address to, uint amount)'];
  const approveInterface = new utils.Interface(ABI);

  return approveInterface.encodeFunctionData('approve', [
    process.env.NEXT_PUBLIC_PERIPHERY_ROUTER,
    amount,
  ]);
};
