export const getEtherMailTypedPayload = (chainId: number, verifyingContract: string) => ({
  // Define our "domain separator" to ensure user signatures are unique across apps/chains
  domain: {
    name: 'Ether Mail',
    version: '1',
    chainId,
    verifyingContract,
  },
  // setup the message to be signed
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
  primaryType: 'Mail',
  // setup the types for displaying the message in the signing window
  types: {
    EIP712Domain: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'version',
        type: 'string',
      },
      {
        name: 'chainId',
        type: 'uint256',
      },
      {
        name: 'verifyingContract',
        type: 'address',
      },
    ],
    Person: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'wallet',
        type: 'address',
      },
    ],
    Mail: [
      {
        name: 'from',
        type: 'Person',
      },
      {
        name: 'to',
        type: 'Person',
      },
      {
        name: 'contents',
        type: 'string',
      },
    ],
  },
});
