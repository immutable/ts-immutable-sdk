import { orderbook } from "@imtbl/sdk";

export function unitsTotal(listing: orderbook.Listing): string {
  return listing.sell[0].type === "ERC1155" ? listing.sell[0].amount : "1";
}

export function unitsRemaining(listing: orderbook.Listing): string {
  const totalUnits = unitsTotal(listing);
  const hasUnitsSold = listing.fillStatus.denominator !== "0";
  const unitsSold = hasUnitsSold
    ? (BigInt(totalUnits) * BigInt(listing.fillStatus.numerator)) /
      BigInt(listing.fillStatus.denominator)
    : BigInt(0);
  return (BigInt(totalUnits) - unitsSold).toString();
}
