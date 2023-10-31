export const PRESETS = [
  {
    name: 'ImmutableERC721',
    group: 'NFT',
    description: 'A simple NFT Preset',
    link: 'https://github.com/immutable/contracts/blob/main/contracts/token/erc721/preset/ImmutableERC721.sol',
    creationABI: {
      inputs: [
        {
          name: 'owner_',
          type: 'address',
        },
        {
          name: 'name_',
          type: 'string',
        },
        {
          name: 'symbol_',
          type: 'string',
        },
        {
          name: 'baseURI_',
          type: 'string',
        },
        {
          name: 'contractURI_',
          type: 'string',
        },
        {
          name: 'operatorAllowlist_',
          type: 'address',
        },
        {
          name: 'royaltyReceiver_',
          type: 'address',
        },
        {
          name: 'feeNumerator_',
          type: 'uint96',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
  },
  {
    name: 'ImmutableERC721MintByID',
    group: 'NFT',
    description: 'A simple NFT Preset that lets you mint by ID',
    // eslint-disable-next-line max-len
    link: 'https://github.com/immutable/contracts/blob/main/contracts/token/erc721/preset/ImmutableERC721MintByID.sol',
    creationABI: {
      inputs: [
        {
          name: 'owner',
          type: 'address',
        },
        {
          name: 'name_',
          type: 'string',
        },
        {
          name: 'symbol_',
          type: 'string',
        },
        {
          name: 'baseURI_',
          type: 'string',
        },
        {
          name: 'contractURI_',
          type: 'string',
        },
        {
          internalType: 'address',
          name: '_operatorAllowlist',
          type: 'address',
        },
        {
          name: '_receiver',
          type: 'address',
        },
        {
          name: '_feeNumerator',
          type: 'uint96',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
  },
  {
    name: 'ERC721Psi',
    group: 'NFT',
    description: 'A simple NFT Preset called ERC721Psi',
    // eslint-disable-next-line max-len
    link: 'https://github.com/immutable/contracts/blob/main/contracts/token/erc721/erc721psi/ERC721Psi.sol',
    creationABI: {
      inputs: [
        {
          name: 'name_',
          type: 'string',
        },
        {
          name: 'symbol_',
          type: 'string',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
  },
];
