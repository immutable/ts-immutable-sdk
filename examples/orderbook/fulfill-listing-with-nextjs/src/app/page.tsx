"use client";
import { Button, Heading } from "@biom3/react";
import NextLink from "next/link";

export default function Home() {
  return (
    <>
      <Heading size="medium" className="mb-1">
        Orderbook - Fulfill listing
      </Heading>
      <Button
        testId={"fulfill-listing-with-erc721"}
        className="mb-1"
        size="medium"
        rc={<NextLink href="/fulfill-listing-with-erc721" />}
      >
        Fulfill listing - Complete fulfillment with ERC721
      </Button>
      <Button
        testId={"fulfill-listing-with-erc1155"}
        className="mb-1"
        size="medium"
        rc={<NextLink href="/fulfill-listing-with-erc1155" />}
      >
        Fulfill listing - Partial fulfillment with ERC1155
      </Button>
    </>
  );
}
