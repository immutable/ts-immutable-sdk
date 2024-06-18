import { OrderComponents } from '@opensea/seaport-js/lib/types';
import { BigNumber } from 'ethers';
import { getBulkOrderTree } from './lib/bulk-orders';

export function getOrderComponentsFromMessage(orderMessage: string): OrderComponents {
  const data = JSON.parse(orderMessage);
  const orderComponents: OrderComponents = data.message;

  orderComponents.salt = BigNumber.from(orderComponents.salt).toHexString();

  return orderComponents;
}

export function getBulkOrderComponentsFromMessage(orderMessage: string): {
  components: OrderComponents[],
  types: any,
  value: any
} {
  const data = JSON.parse(orderMessage);
  const orderComponents: OrderComponents[] = data.message.tree.flat(Infinity)
    // Filter off the zero nodes in the tree. The will get rebuilt bu `getBulkOrderTree`
    // when creating the listings
    .filter((o: OrderComponents) => o.offerer !== '0x0000000000000000000000000000000000000000');

  // eslint-disable-next-line no-restricted-syntax
  for (const orderComponent of orderComponents) {
    orderComponent.salt = BigNumber.from(orderComponent.salt).toHexString();
  }

  return { components: orderComponents, types: data.types, value: data.message };
}

export function getBulkSeaportOrderSignatures(
  signature: string,
  orderComponents: OrderComponents[],
): string[] {
  const tree = getBulkOrderTree(orderComponents);
  return orderComponents.map((_, i) => tree.getEncodedProofAndSignature(i, signature));
}
