import { Orderbook } from '../../orderbook';
import { Order, OrderStatusName } from '../../types';

export async function waitForOrderToBeOfStatus(
  sdk: Orderbook,
  orderId: string,
  status: OrderStatusName,
  attemps = 0,
): Promise<Order> {
  if (attemps > 50) {
    throw new Error('Order never became active');
  }

  const { result: order } = await sdk.getListing(orderId);
  if (order.status.name === status) {
    return order;
  }

  // eslint-disable-next-line
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return waitForOrderToBeOfStatus(sdk, orderId, status, attemps + 1);
}
