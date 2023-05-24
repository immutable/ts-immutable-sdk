import { Order } from 'openapi/sdk';
import { Orderbook } from 'orderbook';

export async function waitForOrderToBeOfStatus(
  sdk: Orderbook,
  orderId: string,
  status: Order.status,
  attemps = 0,
): Promise<Order> {
  if (attemps > 20) {
    throw new Error('Order never became active');
  }

  const order = await sdk.getOrder(orderId);
  if (order.status === status) {
    return order;
  }

  // eslint-disable-next-line
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return waitForOrderToBeOfStatus(sdk, orderId, status, attemps + 1);
}
