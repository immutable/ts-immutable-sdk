import { orderbook } from "@imtbl/sdk";
import { reduceFraction } from "./math";
import { statusIsEqual } from "./order";
import { retry } from "./retry";

export async function waitForListingToBeOfStatus(
  orderBookSdk: orderbook.Orderbook,
  listingId: string,
  status: orderbook.Order["status"],
  fillStatus?: { numerator: number; denominator: number }
) {
  if (status.name === orderbook.OrderStatusName.FILLED) {
    fillStatus = fillStatus ?? { numerator: 1, denominator: 1 };
  }

  await retry(async () => {
    const { result } = await orderBookSdk.getListing(listingId);
    const equalStatus = statusIsEqual(result.status, status);
    let equalFillStatus = true;

    const reducedLastCheckedFillStatus = reduceFraction(
      Number(result.fillStatus.numerator),
      Number(result.fillStatus.denominator)
    );

    if (fillStatus) {
      const reducedFillStatus = reduceFraction(
        fillStatus.numerator,
        fillStatus.denominator
      );

      if (
        reducedFillStatus[0] !== reducedLastCheckedFillStatus[0] ||
        reducedFillStatus[1] !== reducedLastCheckedFillStatus[1]
      ) {
        equalFillStatus = false;
      }
    }
    if (!equalStatus || !equalFillStatus) {
      throw new Error(
        `Listing ${listingId} is of status [${JSON.stringify({
          status: result.status,
          fillStatus: {
            numerator: reducedLastCheckedFillStatus[0],
            denominator: reducedLastCheckedFillStatus[1],
          },
        })}] not expected status [${JSON.stringify({ status, fillStatus })}]`
      );
    }
  });
}
