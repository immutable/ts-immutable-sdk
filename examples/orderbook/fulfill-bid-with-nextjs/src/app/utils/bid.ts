import { orderbook } from "@imtbl/sdk";

export function unitsTotal(bid: orderbook.Bid): string {
  return bid.buy[0].type === "ERC1155" ? bid.buy[0].amount : "1";
}

export function unitsRemaining(bid: orderbook.Bid): string {
  const totalUnits = unitsTotal(bid);
  const hasUnitsSold = bid.fillStatus.denominator !== "0";
  const unitsSold = hasUnitsSold
    ? (BigInt(totalUnits) * BigInt(bid.fillStatus.numerator)) /
      BigInt(bid.fillStatus.denominator)
    : BigInt(0);
  return (BigInt(totalUnits) - unitsSold).toString();
}
