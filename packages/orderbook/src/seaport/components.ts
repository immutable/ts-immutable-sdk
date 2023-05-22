import { OrderComponents } from '@opensea/seaport-js/lib/types';
import { BigNumber } from 'ethers';

export function getOrderComponentsFromMessage(orderMessage: string): OrderComponents {
  const data = JSON.parse(orderMessage);
  const orderComponents: OrderComponents = data.message;
  orderComponents.salt = BigNumber.from(orderComponents.salt).toHexString();

  return orderComponents;
}
