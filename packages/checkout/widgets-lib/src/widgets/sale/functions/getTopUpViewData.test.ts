import {
  ItemType,
  TokenBalance,
  TransactionRequirement,
} from '@imtbl/checkout-sdk';
import { getTopUpViewData } from './getTopUpViewData';

describe('getTopUpViewData', () => {
  const erc20Balance: TokenBalance = {
    type: ItemType.ERC20,
    token: {
      name: 'ERC20',
      symbol: 'ERC20Symbol',
      address: 'ERC20TokenAddress',
      decimals: 18,
      icon: 'ERC20Icon',
    },
    balance: BigInt(100),
    formattedBalance: '100',
  };

  const nativeBalance: TokenBalance = {
    type: ItemType.NATIVE,
    token: {
      name: 'NATIVE',
      symbol: 'NATIVESymbol',
      address: 'NATIVETokenAddress',
      decimals: 18,
      icon: 'NATIVEIcon',
    },
    balance: BigInt(50),
    formattedBalance: '50',
  };

  const sufficientERC20: TransactionRequirement = {
    type: ItemType.ERC20,
    sufficient: true,
    current: erc20Balance,
    required: {
      ...erc20Balance,
      balance: BigInt(50),
      formattedBalance: '50',
    },
    delta: {
      ...erc20Balance,
      balance: BigInt(50),
      formattedBalance: '50',
    },
    isFee: false,
  };

  const insufficientERC20: TransactionRequirement = {
    type: ItemType.ERC20,
    sufficient: false,
    current: erc20Balance,
    required: {
      ...erc20Balance,
      balance: BigInt(200),
      formattedBalance: '200',
    },
    delta: {
      ...erc20Balance,
      balance: BigInt(100),
      formattedBalance: '100',
    },
    isFee: false,
  };

  const sufficientNative: TransactionRequirement = {
    type: ItemType.NATIVE,
    sufficient: true,
    current: nativeBalance,
    required: {
      ...nativeBalance,
      balance: BigInt(20),
      formattedBalance: '20',
    },
    delta: {
      ...nativeBalance,
      balance: BigInt(30),
      formattedBalance: '30',
    },
    isFee: false,
  };

  const insufficientNative: TransactionRequirement = {
    type: ItemType.NATIVE,
    sufficient: false,
    current: nativeBalance,
    required: {
      ...nativeBalance,
      balance: BigInt(70),
      formattedBalance: '70',
    },
    delta: {
      ...nativeBalance,
      balance: BigInt(20),
      formattedBalance: '20',
    },
    isFee: false,
  };

  it('should return correct data when both NATIVE and ERC20 are insufficient', () => {
    const expected = {
      heading: ['views.PAYMENT_METHODS.topUp.heading'],
      subheading: [
        'views.PAYMENT_METHODS.topUp.subheading.both',
        {
          erc20: { value: '100', symbol: 'ERC20Symbol' },
          native: { value: '20', symbol: 'NATIVESymbol' },
        },
      ],
      amount: '100',
      tokenAddress: 'ERC20TokenAddress',
    };
    const result = getTopUpViewData([insufficientNative, insufficientERC20]);
    expect(result).toEqual(expected);
  });

  it('should return correct data when only NATIVE is insufficient', () => {
    const expected = {
      heading: ['views.PAYMENT_METHODS.topUp.heading'],
      subheading: [
        'views.PAYMENT_METHODS.topUp.subheading.native',
        {
          erc20: { value: '50', symbol: 'ERC20Symbol' },
          native: { value: '20', symbol: 'NATIVESymbol' },
        },
      ],
      amount: '20',
      tokenAddress: 'NATIVETokenAddress',
    };
    const result = getTopUpViewData([sufficientERC20, insufficientNative]);
    expect(result).toEqual(expected);
  });

  it('should return correct data when only ERC20 is insufficient', () => {
    const expected = {
      heading: ['views.PAYMENT_METHODS.topUp.heading'],
      subheading: [
        'views.PAYMENT_METHODS.topUp.subheading.erc20',
        {
          erc20: { value: '100', symbol: 'ERC20Symbol' },
          native: { value: '30', symbol: 'NATIVESymbol' },
        },
      ],
      amount: '100',
      tokenAddress: 'ERC20TokenAddress',
    };
    const result = getTopUpViewData([insufficientERC20, sufficientNative]);
    expect(result).toEqual(expected);
  });

  it('should return correct data when both NATIVE and ERC20 are sufficient', () => {
    const expected = {
      heading: ['views.PAYMENT_METHODS.topUp.heading'],
      subheading: [
        'views.PAYMENT_METHODS.topUp.subheading.erc20',
        {
          erc20: { value: '50', symbol: 'ERC20Symbol' },
          native: { value: '30', symbol: 'NATIVESymbol' },
        },
      ],
      amount: '50',
      tokenAddress: 'ERC20TokenAddress',
    };
    const result = getTopUpViewData([sufficientERC20, sufficientNative]);
    expect(result).toEqual(expected);
  });

  it('should return correct data when both NATIVE and ERC20 are sufficient with zero balances', () => {
    const zeroBalances: TransactionRequirement[] = [
      {
        type: ItemType.NATIVE,
        sufficient: true,
        current: {
          ...nativeBalance,
          balance: BigInt(0),
          formattedBalance: '0',
        },
        required: {
          ...nativeBalance,
          balance: BigInt(30),
          formattedBalance: '30',
        },
        delta: {
          ...nativeBalance,
          balance: BigInt(30),
          formattedBalance: '30',
        },
        isFee: true,
      },
      {
        type: ItemType.ERC20,
        sufficient: true,
        current: {
          ...erc20Balance,
          balance: BigInt(0),
          formattedBalance: '0',
        },
        required: {
          ...erc20Balance,
          balance: BigInt(50),
          formattedBalance: '50',
        },
        delta: {
          ...erc20Balance,
          balance: BigInt(50),
          formattedBalance: '50',
        },
        isFee: false,
      },
    ];

    const expected = {
      heading: ['views.PAYMENT_METHODS.topUp.heading'],
      subheading: [
        'views.PAYMENT_METHODS.topUp.subheading.erc20',
        {
          erc20: { value: '50', symbol: 'ERC20Symbol' },
          native: { value: '30', symbol: 'NATIVESymbol' },
        },
      ],
      amount: '50',
      tokenAddress: 'ERC20TokenAddress',
    };
    const result = getTopUpViewData(zeroBalances);
    expect(result).toEqual(expected);
  });
});
