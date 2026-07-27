export const getCreateERC721ListingPayload = ({ seaportContractAddress, walletAddress, chainId }:
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
          token: '0xd46546c8d7ebe9c1b2afe299080eef374618eca2',
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

export const getCreateERC1155ListingPayload = ({ seaportContractAddress, walletAddress, chainId }:
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
          endAmount: '10000000000000000000',
          identifierOrCriteria: '0',
          itemType: '0',
          recipient: walletAddress,
          startAmount: '10000000000000000000',
          token: '0x0000000000000000000000000000000000000000',
        },
        {
          endAmount: '100000000000000000',
          identifierOrCriteria: '0',
          itemType: '0',
          recipient: walletAddress,
          startAmount: '100000000000000000',
          token: '0x0000000000000000000000000000000000000000',
        },
      ],
      counter: '0',
      endTime: '1772076852',
      offer: [
        {
          endAmount: '10',
          identifierOrCriteria: '3',
          itemType: '3',
          startAmount: '10',
          token: '0xd6ebeec5b52c4a237a4c64c6d3171e78b57a40f7',
        },
      ],
      offerer: walletAddress,
      orderType: '3',
      salt: '14819419685848783759',
      startTime: '1709004852',
      zone: '0x1004f9615e79462c711ff05a386bdba91a7628c3',
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
