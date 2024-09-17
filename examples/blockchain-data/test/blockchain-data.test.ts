import { describe, expect, test } from '@jest/globals';

import { verifySuccessfulMints } from '../api-examples-with-node/verify-successful-mints';
import { getCollection } from '../api-examples-with-node/get-collection';

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;

describe('verifySuccessfulMints', () => {
  test('listing activities from a contract address returns mint activities', async () => {
    const result = await verifySuccessfulMints(CONTRACT_ADDRESS);
    expect(result.result.length).toBeGreaterThan(0);
  });
});

describe('getCollection', () => {
  test('returns a collection', async () => {
    const result = await getCollection(CONTRACT_ADDRESS);
    expect(result.result).not.toBe(null);
  });
});
