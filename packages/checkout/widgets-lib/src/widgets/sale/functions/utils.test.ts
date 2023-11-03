/* eslint-disable @typescript-eslint/naming-convention */
import { Item, SignResponse, SignApiResponse } from '../types';
import { toPascalCase, toStringifyTransactions, toSignResponse } from './utils';

const signApiResponseMock: SignApiResponse = {
  order: {
    currency: {
      decimals: 6,
      erc20_address: '0x21B51Ec6fB7654B7e59e...',
      name: 'USDC',
    },
    products: [
      {
        detail: [
          {
            amount: 1,
            collection_address: '0x88320B06E132Dc102...',
            token_id: '27790061',
          },
        ],
        product_id: 'P0001',
      },
      {
        detail: [
          {
            amount: 1,
            collection_address: '0x88320B06E132Dc102...',
            token_id: '33521177',
          },
        ],
        product_id: 'P0001',
      },
      {
        detail: [
          {
            amount: 1,
            collection_address: '0x88320B06E132Dc102...',
            token_id: '32777535',
          },
        ],
        product_id: 'P0001',
      },
      {
        detail: [
          {
            amount: 1,
            collection_address: '0x88320B06E132Dc102...',
            token_id: '77694199',
          },
        ],
        product_id: 'P0002',
      },
      {
        detail: [
          {
            amount: 1,
            collection_address: '0x88320B06E132Dc102...',
            token_id: '6055856',
          },
        ],
        product_id: 'P0002',
      },
      {
        detail: [
          {
            amount: 1,
            collection_address: '0x88320B06E132Dc102...',
            token_id: '76420745',
          },
        ],
        product_id: 'P0003',
      },
    ],
    total_amount: '6.00',
  },
  transactions: [
    {
      contract_address: '0x21B51Ec6fB7654B7e59e...',
      gas_estimate: 48536,
      method_call: 'approve(address spender,uint256 ...',
      params: {
        amount: 6000000,
        spender: '0xD2ae52A4ADD351F5F7124...',
      },
      raw_data: '0x095ea7b3...',
    },
    {
      contract_address: '0xD2ae52A4ADD351F5F7124...',
      gas_estimate: 397686,
      method_call: 'execute(address multicallSigner, ...',
      params: {
        data: [
          '0x23b872dd...',
          '0x40c10f19...',
        ],
        deadline: 1698969892553,
        multicallSigner: '0x08D30445495bbcb3ba...',
        reference: '0x64614159626a44674e7...',
        signature: '0x4e6e675545dec31279d...',
        targets: [
          '0x21B51Ec6fB7654B7e59e...',
          '0x88320B06E132Dc102...',
        ],
      },
      raw_data: '0xf6ad7342...',
    },
  ],
};

const signResponseMock: SignResponse = {
  order: {
    currency: {
      name: 'USDC',
      erc20Address: '0x21B51Ec6fB7654B7e59e...',
    },
    products: [
      {
        productId: 'P0001',
        image: 'https://pokemon.com/images/1.png',
        qty: 3,
        name: 'Bulbasaur',
        description: 'Bulbasaur',
        currency: 'USDC',
        collectionAddress: '0x88320B06E132Dc102...',
        amount: [1, 1, 1],
        tokenId: [27790061, 33521177, 32777535],
      },
      {
        productId: 'P0002',
        image: 'https://pokemon.com/images/2.png',
        qty: 2,
        name: 'Ivyasaur',
        description: 'Ivyasaur',
        currency: 'USDC',
        collectionAddress: '0x88320B06E132Dc102...',
        amount: [1, 1],
        tokenId: [77694199, 6055856],
      },
      {
        productId: 'P0003',
        image: 'https://pokemon.com/images/3.png',
        qty: 1,
        name: 'Venusaur',
        description: 'Venusaur',
        currency: 'USDC',
        collectionAddress: '0x88320B06E132Dc102...',
        amount: [1],
        tokenId: [76420745],
      },
    ],
    totalAmount: 6,
  },
  transactions: [
    {
      contractAddress: '0x21B51Ec6fB7654B7e59e...',
      gasEstimate: 48536,
      methodCall: 'approve(address spender,uint256 ...',
      params: {
        reference: '',
        amount: 6000000,
        spender: '0xD2ae52A4ADD351F5F7124...',
      },
      rawData: '0x095ea7b3...',
    },
    {
      contractAddress: '0xD2ae52A4ADD351F5F7124...',
      gasEstimate: 397686,
      methodCall: 'execute(address multicallSigner, ...',
      params: {
        reference: '0x64614159626a44674e7...',
        amount: 0,
        spender: '',
      },
      rawData: '0xf6ad7342...',
    },
  ],
};

const itemsMock: Item[] = [
  {
    productId: 'P0001',
    qty: 3,
    name: 'Bulbasaur',
    image: 'https://pokemon.com/images/1.png',
    description: 'Bulbasaur',
  },
  {
    productId: 'P0002',
    qty: 2,
    name: 'Ivyasaur',
    image: 'https://pokemon.com/images/2.png',
    description: 'Ivyasaur',
  },
  {
    productId: 'P0003',
    qty: 1,
    name: 'Venusaur',
    image: 'https://pokemon.com/images/3.png',
    description: 'Venusaur',
  },
];

describe('toPascalCase', () => {
  it('should transform a string to PascalCase', () => {
    expect(toPascalCase('foo_bar-baz')).toBe('FooBarBaz');
    expect(toPascalCase('foo bar baz')).toBe('FooBarBaz');
    expect(toPascalCase('fooBarBaz')).toBe('FooBarBaz');
  });
});

describe('toStringifyTransactions', () => {
  it('should transform a list of transactions to a string', () => {
    const transactions = [
      { method: 'approve', hash: '0x123' },
      { method: 'transfer', hash: '0x456' },
    ];
    const result = toStringifyTransactions(transactions);
    const expected = 'approve: 0x123 | transfer: 0x456';
    expect(result).toEqual(expected);
  });
});

describe('toSignResponse', () => {
  it('should transform the response from the sign api to the format expected by the sale widget', () => {
    const result = toSignResponse(signApiResponseMock, itemsMock);
    expect(result).toEqual(signResponseMock);
  });
});
