import { Order } from 'openapi/sdk';
import { Orderbook } from 'orderbook';

export async function waitForOrderToBeActive(
  sdk: Orderbook,
  orderId: string,
  attemps = 0,
): Promise<Order> {
  if (attemps > 20) {
    throw new Error('Order never became active');
  }

  const order = await sdk.getOrder(orderId);
  if (order.status === 'ACTIVE') {
    return order;
  }

  // eslint-disable-next-line
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return waitForOrderToBeActive(sdk, orderId, attemps + 1);
}
