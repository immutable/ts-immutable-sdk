import { Order } from 'openapi/sdk';

export function determineFillableUnits(order: Order, amountToFill?: string): string | undefined {
  if (order.sell[0].type === 'ERC1155' && !amountToFill) {
    // fill status is expressed as a ratio
    const { numerator, denominator } = order.fill_status;
    const originalOfferAmt = BigInt(order.sell[0].amount);

    if (numerator === '0' || denominator === '0') {
      return originalOfferAmt.toString();
    }

    // calculate the remaining amount to fill
    // remaining = ((denominator - numerator) * originalOfferAmt) / denominator
    const remaining = ((BigInt(denominator) - BigInt(numerator)) * BigInt(originalOfferAmt))
        / BigInt(denominator);

    return remaining.toString();
  }

  return amountToFill;
}
