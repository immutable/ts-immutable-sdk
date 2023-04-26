import { craft } from '.';

describe('craft', () => {
  it('should work', async () => {
    const input = { requiresWeb3: true, web3Assets: {} };
    const result = await craft(input, () => {
      /** */
    });
    expect(result).toEqual('COMPLETED');
  });
});
