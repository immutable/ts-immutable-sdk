export const getCreateListingPayload = ({ seaportContractAddress, walletAddress, chainId }:
{ seaportContractAddress: string, walletAddress: string, chainId: number }) => (
  {
    domain: {
      chainId,
      name: 'ImmutableSeaport',
      verifyingContract: seaportContractAddress,
      version: '1.5',
    },
    message: {
      conduitKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
      consideration: [
        {
          endAmount: '1000000000000000000',
          identifierOrCriteria: '0',
          itemType: '0',
          recipient: walletAddress,
          startAmount: '1000000000000000000',
          token: '0x0000000000000000000000000000000000000000',
        },
        {
          endAmount: '1000000000000000000',
          identifierOrCriteria: '0',
          itemType: '0',
          recipient: walletAddress,
          startAmount: '1000000000000000000',
          token: '0x0000000000000000000000000000000000000000',
        },
      ],
      counter: '0',
      endTime: '1772076852',
      offer: [
        {
          endAmount: '1',
          identifierOrCriteria: '842809524',
          itemType: '2',
          startAmount: '1',
          token: '0x114c1f0702547751a546661bc375d95fb2d281a8',
        },
      ],
      offerer: walletAddress,
      orderType: '2',
      salt: '14819419685848783759',
      startTime: '1709004852',
      zone: '0x8831867e347ab87fa30199c5b695f0a31604bb52',
      zoneHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    },
    primaryType: 'OrderComponents',
    types: {
      ConsiderationItem: [
        {
          name: 'itemType',
          type: 'uint8',
        },
        {
          name: 'token',
          type: 'address',
        },
        {
          name: 'identifierOrCriteria',
          type: 'uint256',
        },
        {
          name: 'startAmount',
          type: 'uint256',
        },
        {
          name: 'endAmount',
          type: 'uint256',
        },
        {
          name: 'recipient',
          type: 'address',
        },
      ],
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
      OfferItem: [
        {
          name: 'itemType',
          type: 'uint8',
        },
        {
          name: 'token',
          type: 'address',
        },
        {
          name: 'identifierOrCriteria',
          type: 'uint256',
        },
        {
          name: 'startAmount',
          type: 'uint256',
        },
        {
          name: 'endAmount',
          type: 'uint256',
        },
      ],
      OrderComponents: [
        {
          name: 'offerer',
          type: 'address',
        },
        {
          name: 'zone',
          type: 'address',
        },
        {
          name: 'offer',
          type: 'OfferItem[]',
        },
        {
          name: 'consideration',
          type: 'ConsiderationItem[]',
        },
        {
          name: 'orderType',
          type: 'uint8',
        },
        {
          name: 'startTime',
          type: 'uint256',
        },
        {
          name: 'endTime',
          type: 'uint256',
        },
        {
          name: 'zoneHash',
          type: 'bytes32',
        },
        {
          name: 'salt',
          type: 'uint256',
        },
        {
          name: 'conduitKey',
          type: 'bytes32',
        },
        {
          name: 'counter',
          type: 'uint256',
        },
      ],
    },
  }
);
