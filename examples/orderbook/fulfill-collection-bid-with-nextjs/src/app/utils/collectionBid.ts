import { orderbook } from "@imtbl/sdk";

export function unitsTotal(collectionBid: orderbook.CollectionBid): string {
  return collectionBid.buy[0].amount;
}

export function unitsRemaining(collectionBid: orderbook.CollectionBid): string {
  const totalUnits = unitsTotal(collectionBid);
  const hasUnitsSold = collectionBid.fillStatus.denominator !== "0";
  const unitsSold = hasUnitsSold
    ? (BigInt(totalUnits) * BigInt(collectionBid.fillStatus.numerator)) /
      BigInt(collectionBid.fillStatus.denominator)
    : BigInt(0);
  return (BigInt(totalUnits) - unitsSold).toString();
}
