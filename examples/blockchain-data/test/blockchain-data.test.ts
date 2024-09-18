import { describe, expect, test } from "@jest/globals";

import { verifySuccessfulMints, getCollection, getMetadata, getNFT, listMetadata } from "../api-examples-with-node";

const CHAIN_NAME = "imtbl-zkevm-testnet";
const CONTRACT_ADDRESS = "0x21F0D60cfE554B6d5b7f9E799BDeBD97C5d64274";

describe("verifySuccessfulMints", () => {
  test("listing activities from a contract address returns mint activities", async () => {
    const result = await verifySuccessfulMints(CONTRACT_ADDRESS);
    expect(result.result.length).toBeGreaterThan(0);
  });
});

describe("getCollection", () => {
  test("returns a collection", async () => {
    const result = await getCollection(CONTRACT_ADDRESS);
    expect(result.result).not.toBe(null);
  });
});

describe("getMetadata", () => {
  test("returns metadata", async () => {
    const result = await getMetadata(CHAIN_NAME, CONTRACT_ADDRESS, "018dc943-03b1-549d-6ddf-17935bae0c0e");
    expect(result.result).not.toBe(null);
  });
});

describe("getNFT", () => {
  test("returns nft", async () => {
    const result = await getNFT(CHAIN_NAME, CONTRACT_ADDRESS, "199144");
    expect(result.result).not.toBe(null);
  });
});

describe("listMetadata", () => {
  test("lists metadata", async () => {
    const result = await listMetadata(CHAIN_NAME, CONTRACT_ADDRESS);
    expect(result.result.length).toBeGreaterThan(0);
  });
});
