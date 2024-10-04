"use client";
import { Button, Heading } from "@biom3/react";
import NextLink from "next/link";

export default function Home() {
  return (
    <>
      <Heading size="medium" className="mb-1">
        Orderbook - Fulfill collection bid
      </Heading>
      <Button
        testId={"fulfill-collection-bid-with-erc721"}
        className="mb-1"
        size="medium"
        rc={<NextLink href="/fulfill-collection-bid-with-erc721" />}
      >
        Fulfill collection bid - Complete fulfillment with ERC721
      </Button>
      <Button
        testId={"fulfill-collection-bid-with-erc1155"}
        className="mb-1"
        size="medium"
        rc={<NextLink href="/fulfill-collection-bid-with-erc1155" />}
      >
        Fulfill collection bid - Partial fulfillment with ERC1155
      </Button>
    </>
  );
}
