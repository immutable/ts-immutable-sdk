import { ERC20__factory } from 'contracts/types/factories/ERC20__factory';
import { Amount } from 'types';

const isERC20ApprovalRequired = () => {
};

const getUnsignedERC20ApproveTransaction = (fromAddress: string, tokenAmount: Amount, contractToApprove: string) => {
  const erc20Contract = ERC20__factory.createInterface();
  const callData = erc20Contract.encodeFunctionData('approve', [contractToApprove, tokenAmount.amount]);

  return {
    data: callData,
    to: tokenAmount.token.address,
    value: 0,
    from: fromAddress,
  };
};
