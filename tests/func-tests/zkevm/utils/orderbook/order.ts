import { orderbook } from '@imtbl/sdk';

export async function waitForOrderToBeOfStatus(
  sdk: orderbook.Orderbook,
  orderId: string,
  status: orderbook.OrderStatusName,
  attemps = 0,
): Promise<orderbook.Order> {
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
