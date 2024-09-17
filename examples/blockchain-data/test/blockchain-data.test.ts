import { describe, expect, test } from '@jest/globals';

import { verifySuccessfulMints } from '../api-examples-with-node/verify-successful-mints';

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;

describe('verifySuccessfulMints', () => {
  test('listing activities from a contract address returns mint activities', async () => {
    const result = await verifySuccessfulMints(CONTRACT_ADDRESS);
    expect(result.result.length).toBeGreaterThan(0);
  });
});
