import { OrderComponents } from '@opensea/seaport-js/lib/types';
import { getBulkOrderTree } from '@opensea/seaport-js/src/utils/eip712/bulk-orders';
import { BigNumber } from 'ethers';

export function getOrderComponentsFromMessage(orderMessage: string): OrderComponents {
  const data = JSON.parse(orderMessage);
  const orderComponents: OrderComponents = data.message;

  orderComponents.salt = BigNumber.from(orderComponents.salt).toHexString();

  return orderComponents;
}

export function getBulkOrderComponentsFromMessage(orderMessage: string): OrderComponents[] {
  const data = JSON.parse(orderMessage);
  const orderComponents: OrderComponents[] = data.message.tree;

  // eslint-disable-next-line no-restricted-syntax
  for (const orderComponent of orderComponents) {
    orderComponent.salt = BigNumber.from(orderComponent.salt).toHexString();
  }

  return orderComponents;
}

export function getBulkSeaportOrderSignatures(
  signature: string,
  orderComponents: OrderComponents[],
): string[] {
  const tree = getBulkOrderTree(orderComponents);
  return orderComponents.map((_, i) => tree.getEncodedProofAndSignature(i, signature));
}
