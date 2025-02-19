import { parseUnits } from 'ethers';
import {
  ERC1155Item,
  ERC1155ItemRequirement,
  ERC20Item,
  ERC20ItemRequirement,
  ERC721Item,
  ERC721ItemRequirement,
  ItemRequirement,
  ItemType,
  WrappedBrowserProvider,
  NativeItem,
  NativeItemRequirement,
} from '../../types';
import { getTokenContract } from '../../instance';
import { ERC20ABI } from '../../env';

export async function getItemRequirementsFromRequirements(
  provider: WrappedBrowserProvider,
  requirements: (NativeItemRequirement | ERC20ItemRequirement | ERC721ItemRequirement | ERC1155ItemRequirement)[],
): Promise<ItemRequirement[]> {
  // Get all decimal values by calling contracts for each ERC20
  const decimalPromises:any = [];
  requirements.forEach((itemRequirementParam) => {
    if (itemRequirementParam.type === ItemType.ERC20) {
      const { tokenAddress } = (itemRequirementParam as ERC20ItemRequirement);
      decimalPromises.push(getTokenContract(tokenAddress, ERC20ABI, provider).decimals());
    }
  });

  const decimals = await Promise.all(decimalPromises as any);

  // Map ItemRequirementsParam objects to ItemRequirement by parsing amounts from formatted string to BigNumebrs
  const itemRequirements = requirements.map((itemRequirementParam, index) => {
    if (itemRequirementParam.type === ItemType.NATIVE) {
      return {
        ...itemRequirementParam,
        amount: parseUnits(itemRequirementParam.amount, 18),
      } as NativeItem;
    }

    if (itemRequirementParam.type === ItemType.ERC20) {
      return {
        ...itemRequirementParam,
        amount: parseUnits(itemRequirementParam.amount, decimals[index]),
      } as ERC20Item;
    }

    // Amount for ERC1155s does not need unit parsing. Although 1155s can have amounts > 1,
    // there is no concept of decimals for ERC1155s
    return itemRequirementParam as ERC721Item | ERC1155Item;
  });

  return itemRequirements;
}
