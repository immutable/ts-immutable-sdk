"use client";
import { Button, Heading } from "@biom3/react";
import NextLink from "next/link";

export default function Home() {
  return (
    <>
      <Heading size="medium" className="mb-1">
        Orderbook - Create Listing
      </Heading>
      <Button
        testId={"create-listing-with-erc721"}
        className="mb-1"
        size="medium"
        rc={<NextLink href="/create-listing-with-erc721" />}
      >
        Create ERC721 Listing
      </Button>
      <Button
        testId={"create-listing-with-erc1155"}
        className="mb-1"
        size="medium"
        rc={<NextLink href="/create-listing-with-erc1155" />}
      >
        Create ERC1155 Listing
      </Button>
    </>
  );
}
