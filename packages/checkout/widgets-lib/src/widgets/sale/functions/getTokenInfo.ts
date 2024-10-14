import { ItemType, TransactionRequirement } from '@imtbl/checkout-sdk';

export const getTokenInfo = (req?: TransactionRequirement) => {
  if (req && req.current.type !== ItemType.ERC721) {
    return req.current.token;
  }
  return undefined;
};
