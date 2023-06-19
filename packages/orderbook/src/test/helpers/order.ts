import { Order, OrderStatus } from 'openapi/sdk';
import { Orderbook } from 'orderbook';

export async function waitForOrderToBeOfStatus(
  sdk: Orderbook,
  orderId: string,
  status: OrderStatus,
  attemps = 0,
): Promise<Order> {
  if (attemps > 50) {
    throw new Error('Order never became active');
  }

  const { result: order } = await sdk.getListing(orderId);
  if (order.status === status) {
    return order;
  }

  // eslint-disable-next-line
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return waitForOrderToBeOfStatus(sdk, orderId, status, attemps + 1);
}
