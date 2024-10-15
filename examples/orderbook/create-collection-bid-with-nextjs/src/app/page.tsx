"use client";
import { Button, Heading } from "@biom3/react";
import NextLink from "next/link";

export default function Home() {
  return (
    <>
      <Heading size="medium" className="mb-1">
        Orderbook - Create Collection Bid
      </Heading>
      <Button
        testId={"create-collection-bid-with-erc721"}
        className="mb-1"
        size="medium"
        rc={<NextLink href="/create-collection-bid-with-erc721" />}
      >
        Create ERC721 Collection Bid
      </Button>
      <Button
        testId={"create-collection-bid-with-erc1155"}
        className="mb-1"
        size="medium"
        rc={<NextLink href="/create-collection-bid-with-erc1155" />}
      >
        Create ERC1155 Collection Bid
      </Button>
    </>
  );
}
