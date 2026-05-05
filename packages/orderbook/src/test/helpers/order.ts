import { Orderbook } from '../../orderbook';
import { MetadataBid, Order, OrderStatusName } from '../../types';

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

export async function waitForMetadataBidToBeOfStatus(
  sdk: Orderbook,
  metadataBidId: string,
  status: OrderStatusName,
  attempts = 0,
): Promise<MetadataBid> {
  if (attempts > 50) {
    throw new Error(`Metadata bid ${metadataBidId} never reached status ${status}`);
  }

  const { result: bid } = await sdk.getMetadataBid(metadataBidId);
  if (bid.status.name === status) {
    return bid;
  }

  // eslint-disable-next-line
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return waitForMetadataBidToBeOfStatus(sdk, metadataBidId, status, attempts + 1);
}
