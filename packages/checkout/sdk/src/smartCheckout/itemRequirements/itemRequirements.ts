import { Contract } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { parseUnits } from 'ethers/lib/utils';
import {
  ERC20ABI,
  ERC20Item,
  ERC20ItemRequirement,
  ERC721Item,
  ERC721ItemRequirement,
  ItemRequirement,
  ItemType,
  NativeItem,
  NativeItemRequirement,
} from '../../types';

export async function getItemRequirementsFromParams(
  provider: Web3Provider,
  itemRequirementParams: (NativeItemRequirement | ERC20ItemRequirement | ERC721ItemRequirement)[],
): Promise<ItemRequirement[]> {
  // Get all decimal values by calling contracts for each ERC20
  const decimalPromises:any = [];
  itemRequirementParams.forEach((itemRequirementParam) => {
    if (itemRequirementParam.type === ItemType.ERC20) {
      const { contractAddress } = (itemRequirementParam as ERC20ItemRequirement);
      decimalPromises.push(new Contract(contractAddress, ERC20ABI, provider).decimals());
    }
  });

  const decimals = await Promise.all(decimalPromises as any);

  // Map ItemRequirementsParam objects to ItemRequirement by parsing amounts from formatted string to BigNumebrs
  const itemRequirements = itemRequirementParams.map((itemRequirementParam, index) => {
    if (itemRequirementParam.type === ItemType.NATIVE) {
      return {
        ...itemRequirementParam,
        amount: parseUnits(itemRequirementParam.amount, 18),
      } as NativeItem;
    } if (itemRequirementParam.type === ItemType.ERC20) {
      return {
        ...itemRequirementParam,
        amount: parseUnits(itemRequirementParam.amount, decimals[index]),
      } as ERC20Item;
    }
    return itemRequirementParam as ERC721Item;
  });

  return itemRequirements;
}
