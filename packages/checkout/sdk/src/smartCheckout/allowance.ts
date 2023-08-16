import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract } from 'ethers';
import { ERC20ABI, ItemRequirement, ItemType } from '../types';
import { CheckoutError, CheckoutErrorType } from '../errors';

export const erc20Allowance = async (
  provider: Web3Provider,
  contractAddress: string,
  spenderAddress: string,
): Promise<BigNumber> => {
  try {
    const owner = await provider.getSigner().getAddress();
    const contract = new Contract(
      contractAddress,
      JSON.stringify(ERC20ABI),
      provider,
    );
    return await contract.allowance(owner, spenderAddress);
  } catch (err: any) {
    throw new CheckoutError(
      'Failed to get the allowance for ERC20',
      CheckoutErrorType.GET_ERC20_ALLOWANCE_ERROR,
      { contractAddress },
    );
  }
};

type SufficientAllowance = {
  sufficient: true,
  itemRequirement: ItemRequirement,
}
| {
  sufficient: false,
  delta: BigNumber,
  itemRequirement: ItemRequirement,
};

export const hasERC20Allowances = async (
  provider: Web3Provider,
  itemRequirements: ItemRequirement[],
): Promise<{
  sufficient: boolean,
  allowances: SufficientAllowance[]
}> => {
  let sufficient = true;
  const allowances: SufficientAllowance[] = [];

  for (const itemRequirement of itemRequirements) {
    /* eslint-disable-next-line no-continue */
    if (itemRequirement.type !== ItemType.ERC20) continue;

    const { contractAddress, spenderAddress } = itemRequirement;

    // eslint-disable-next-line no-await-in-loop
    const allowance = await erc20Allowance(provider, contractAddress, spenderAddress);
    if (allowance.gte(itemRequirement.amount)) {
      allowances.push({
        sufficient: true,
        itemRequirement,
      });
      /* eslint-disable-next-line no-continue */
      continue;
    }

    sufficient = false;
    allowances.push({
      sufficient: false,
      delta: itemRequirement.amount.sub(allowance),
      itemRequirement,
    });

    // eslint-disable-next-line no-console
    console.log({
      allowance: allowance.toString(),
      amount: itemRequirement.amount.toString(),
      delta: itemRequirement.amount.sub(allowance).toString(),
    });
  }

  return {
    sufficient,
    allowances,
  };
};
