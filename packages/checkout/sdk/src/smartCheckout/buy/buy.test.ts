import { BigNumber, PopulatedTransaction } from 'ethers';
import { Environment } from '@imtbl/config';
import {
  ActionType, TransactionPurpose, constants,
} from '@imtbl/orderbook';
import { Web3Provider } from '@ethersproject/providers';
import {
  getItemRequirement, buy, getTransactionOrGas,
} from './buy';
import { createOrderbookInstance, getTokenContract } from '../../instance';
import { CheckoutConfiguration } from '../../config';
import { CheckoutErrorType } from '../../errors';
import {
  FulfilmentTransaction, GasAmount, GasTokenType, ItemType, TransactionOrGasType,
} from '../../types/smartCheckout';
import { smartCheckout } from '..';
import {
  getUnsignedERC20ApprovalTransactions,
  getUnsignedERC721Transactions,
  getUnsignedFulfilmentTransactions,
  signApprovalTransactions,
  signFulfilmentTransactions,
} from '../actions';
import { BuyOrder, BuyStatusType, OrderFee } from '../../types';
import { SignTransactionStatusType } from '../actions/types';

jest.mock('../../instance');
jest.mock('../smartCheckout');
jest.mock('../actions');

describe('buy', () => {
  const gasLimit = constants.estimatedFulfillmentGasGwei;
  const seaportContractAddress = '0xSEAPORT';

  describe('buy', () => {
    let config: CheckoutConfiguration;
    let mockProvider: Web3Provider;

    beforeEach(() => {
      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
        }),
      } as unknown as Web3Provider;

      config = new CheckoutConfiguration({
        baseConfig: { environment: Environment.SANDBOX },
      });
    });

    it('should call smart checkout with item requirements and execute transactions', async () => {
      const smartCheckoutResult = {
        sufficient: true,
        transactionRequirements: [{
          type: ItemType.NATIVE,
          sufficient: true,
          required: {
            type: ItemType.NATIVE,
            balance: BigNumber.from(1),
            formattedBalance: '1',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
          current: {
            type: ItemType.NATIVE,
            balance: BigNumber.from(1),
            formattedBalance: '1',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
          delta: {
            balance: BigNumber.from(0),
            formattedBalance: '0',
          },
        }],
      };
      const fulfillOrderMock = jest.fn().mockReturnValue({
        actions: [
          {
            type: ActionType.TRANSACTION,
            purpose: TransactionPurpose.FULFILL_ORDER,
            buildTransaction: jest.fn().mockResolvedValue({ from: '0xTRANSACTION' } as PopulatedTransaction),
          },
          {
            type: ActionType.TRANSACTION,
            purpose: TransactionPurpose.APPROVAL,
            buildTransaction: jest.fn().mockResolvedValue({ from: '0xAPPROVAL' } as PopulatedTransaction),
          },
        ],
      });

      (smartCheckout as jest.Mock).mockResolvedValue(smartCheckoutResult);
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            buy: [
              {
                type: 'NATIVE',
                amount: '1000000000000000000',
              },
            ],
            fees: [
              {
                amount: '1000000000000000000',
              },
            ],
          },
        }),
        config: jest.fn().mockReturnValue({
          seaportContractAddress,
        }),
        fulfillOrder: fulfillOrderMock,
      });
      // (getUnsignedERC721Transactions as jest.Mock).mockResolvedValue({
      //   approvalTransactions: [{ from: '0xAPPROVAL' }],
      //   fulfilmentTransactions: [{ from: '0xTRANSACTION' }],
      // });
      (getUnsignedERC20ApprovalTransactions as jest.Mock).mockResolvedValue([{ from: '0xAPPROVAL' }]);
      (getUnsignedFulfilmentTransactions as jest.Mock).mockResolvedValue([{ from: '0xTRANSACTION' }]);
      (signApprovalTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.SUCCESS,
      });
      (signFulfilmentTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.SUCCESS,
      });

      const order: BuyOrder = {
        id: '1',
        takerFees: [{ amount: { percentageDecimal: 0.025 }, recipient: '0xFEERECIPIENT' }] as OrderFee[],
      };
      const itemRequirements = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from('2000000000000000000'),
        },
      ];
      // TODO: CHat to Mikhala about fixing this test, what to assert on now

      // const fulfilmentTransaction: FulfilmentTransaction = {
      //   type: TransactionOrGasType.TRANSACTION,
      //   transaction: { from: '0xTRANSACTION' },
      // };
      const gasTransaction: GasAmount = {
        type: TransactionOrGasType.GAS,
        gasToken: {
          type: GasTokenType.NATIVE,
          limit: BigNumber.from(constants.estimatedFulfillmentGasGwei),
        },
      };

      const buyResult = await buy(config, mockProvider, [order]);
      expect(smartCheckout).toBeCalledWith(
        config,
        mockProvider,
        itemRequirements,
        gasTransaction,
      );
      expect(buyResult).toEqual({
        smartCheckoutResult,
        orderId: order.id,
        status: {
          type: BuyStatusType.SUCCESS,
        },
      });
      expect(getUnsignedERC20ApprovalTransactions).toBeCalledTimes(1);
      expect(getUnsignedFulfilmentTransactions).toBeCalledTimes(1);
      expect(signApprovalTransactions).toBeCalledWith(mockProvider, [{ from: '0xAPPROVAL' }]);
      expect(signFulfilmentTransactions).toBeCalledWith(mockProvider, [{ from: '0xTRANSACTION' }]);
      expect(fulfillOrderMock).toBeCalledWith(
        order.id,
        '0xADDRESS',
        [
          {
            recipient: '0xFEERECIPIENT',
            amount: '25000000000000000',
          },
        ],
      );
    });

    it('should call smart checkout with item requirements and gas limit', async () => {
      (smartCheckout as jest.Mock).mockResolvedValue({});
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            buy: [
              {
                type: 'NATIVE',
                amount: '1000000000000000000',
              },
            ],
            fees: [
              {
                amount: '1000000000000000000',
              },
            ],
          },
        }),
        config: jest.fn().mockReturnValue({
          seaportContractAddress,
        }),
        fulfillOrder: jest.fn().mockRejectedValue({}),
      });

      const order:BuyOrder = {
        id: '1',
        takerFees: [{ amount: { percentageDecimal: 0.01 }, recipient: '0xFEERECIPIENT' }],
      };
      const itemRequirements = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from('2000000000000000000'),
        },
      ];
      const gasAmount: GasAmount = {
        type: TransactionOrGasType.GAS,
        gasToken: {
          type: GasTokenType.NATIVE,
          limit: BigNumber.from(gasLimit),
        },
      };

      const result = await buy(config, mockProvider, [order]);
      expect(smartCheckout).toBeCalledWith(
        config,
        mockProvider,
        itemRequirements,
        gasAmount,
      );
      expect(result).toEqual({
        smartCheckoutResult: {},
        orderId: order.id,
      });
    });

    it('should call smart checkout with an erc20 requirement', async () => {
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            buy: [
              {
                type: 'ERC20',
                amount: '1000000000000000000',
                contractAddress: '0x123',
              },
            ],
            fees: [
              {
                amount: '1000000000000000000',
              },
            ],
          },
        }),
        config: jest.fn().mockReturnValue({
          seaportContractAddress,
        }),
        fulfillOrder: jest.fn().mockRejectedValue({}),
      });
      const smartCheckoutResult = {
        sufficient: true,
        transactionRequirements: [{
          type: ItemType.ERC20,
          sufficient: true,
          required: {
            type: ItemType.ERC20,
            balance: BigNumber.from('1000000000000000000'),
            formattedBalance: '1',
            token: {
              name: 'ERC20',
              symbol: 'ERC20',
              decimals: 18,
              address: '0x123',
            },
          },
          current: {
            type: ItemType.ERC20,
            balance: BigNumber.from('1000000000000000000'),
            formattedBalance: '1',
            token: {
              name: 'ERC20',
              symbol: 'ERC20',
              decimals: 18,
              address: '0x123',
            },
          },
          delta: {
            balance: BigNumber.from(0),
            formattedBalance: '0',
          },
        }],
      };
      (smartCheckout as jest.Mock).mockResolvedValue(smartCheckoutResult);
      (signApprovalTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.SUCCESS,
      });
      (signFulfilmentTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.SUCCESS,
      });
      (getTokenContract as jest.Mock).mockReturnValue({
        decimals: jest.fn().mockResolvedValue(18),
      });

      const order:BuyOrder = {
        id: '1',
        takerFees: [{ amount: { percentageDecimal: 0.01 }, recipient: '0xFEERECIPIENT' }],
      };
      const itemRequirements = [
        {
          type: ItemType.ERC20,
          amount: BigNumber.from('2000000000000000000'),
          contractAddress: '0x123',
          spenderAddress: seaportContractAddress,
        },
      ];
      const gasAmount: GasAmount = {
        type: TransactionOrGasType.GAS,
        gasToken: {
          type: GasTokenType.NATIVE,
          limit: BigNumber.from(gasLimit),
        },
      };

      const result = await buy(config, mockProvider, [order]);
      expect(smartCheckout).toBeCalledWith(
        config,
        mockProvider,
        itemRequirements,
        gasAmount,
      );
      expect(result).toEqual({
        smartCheckoutResult,
        orderId: order.id,
        status: {
          type: BuyStatusType.SUCCESS,
        },
      });
    });

    it('should not sign actions and only return smart checkout result when sufficient false', async () => {
      const smartCheckoutResult = {
        sufficient: false,
        transactionRequirements: [{
          type: ItemType.NATIVE,
          sufficient: false,
          required: {
            type: ItemType.NATIVE,
            balance: BigNumber.from(2),
            formattedBalance: '2',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
          current: {
            type: ItemType.NATIVE,
            balance: BigNumber.from(1),
            formattedBalance: '1',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
          delta: {
            balance: BigNumber.from(1),
            formattedBalance: '1',
          },
        }],
      };
      (smartCheckout as jest.Mock).mockResolvedValue(smartCheckoutResult);
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            buy: [
              {
                type: 'NATIVE',
                amount: '1',
              },
            ],
            fees: [
              {
                amount: '1',
              },
            ],
          },
        }),
        config: jest.fn().mockReturnValue({
          seaportContractAddress,
        }),
        fulfillOrder: jest.fn().mockReturnValue({
          actions: [
            {
              type: ActionType.TRANSACTION,
              purpose: TransactionPurpose.FULFILL_ORDER,
              buildTransaction: jest.fn().mockResolvedValue({ from: '0xTRANSACTION' } as PopulatedTransaction),
            },
            {
              type: ActionType.TRANSACTION,
              purpose: TransactionPurpose.APPROVAL,
              buildTransaction: jest.fn().mockResolvedValue({ from: '0xAPPROVAL' } as PopulatedTransaction),
            },
          ],
        }),
      });
      (getUnsignedERC721Transactions as jest.Mock).mockResolvedValue({
        approvalTransactions: [{ from: '0xAPPROVAL' }],
        fulfilmentTransactions: [{ from: '0xTRANSACTION' }],
      });
      (signApprovalTransactions as jest.Mock).mockResolvedValue({});
      (signFulfilmentTransactions as jest.Mock).mockResolvedValue({});
      // const orderId = '1';
      const order = {
        id: '1',
        takerFees: [],
      };
      const itemRequirements = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from('2'),
        },
      ];
      const fulfilmentTransaction: FulfilmentTransaction = {
        type: TransactionOrGasType.TRANSACTION,
        transaction: { from: '0xTRANSACTION' },
      };

      const buyResult = await buy(config, mockProvider, [order]);
      expect(smartCheckout).toBeCalledWith(
        config,
        mockProvider,
        itemRequirements,
        fulfilmentTransaction,
      );
      expect(signApprovalTransactions).toBeCalledTimes(0);
      expect(signFulfilmentTransactions).toBeCalledTimes(0);
      expect(buyResult).toEqual({
        smartCheckoutResult,
        orderId: order.id,
      });
    });

    it('should return a failed status when approval fails', async () => {
      const smartCheckoutResult = {
        sufficient: true,
        transactionRequirements: [{
          type: ItemType.NATIVE,
          sufficient: true,
          required: {
            type: ItemType.NATIVE,
            balance: BigNumber.from(1),
            formattedBalance: '1',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
          current: {
            type: ItemType.NATIVE,
            balance: BigNumber.from(1),
            formattedBalance: '1',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
          delta: {
            balance: BigNumber.from(0),
            formattedBalance: '0',
          },
        }],
      };
      (smartCheckout as jest.Mock).mockResolvedValue(smartCheckoutResult);
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            buy: [
              {
                type: 'NATIVE',
                amount: '1',
              },
            ],
            fees: [
              {
                amount: '1',
              },
            ],
          },
        }),
        config: jest.fn().mockReturnValue({
          seaportContractAddress,
        }),
        fulfillOrder: jest.fn().mockReturnValue({
          actions: [
            {
              type: ActionType.TRANSACTION,
              purpose: TransactionPurpose.FULFILL_ORDER,
              buildTransaction: jest.fn().mockResolvedValue({ from: '0xTRANSACTION' } as PopulatedTransaction),
            },
            {
              type: ActionType.TRANSACTION,
              purpose: TransactionPurpose.APPROVAL,
              buildTransaction: jest.fn().mockResolvedValue({ from: '0xAPPROVAL' } as PopulatedTransaction),
            },
          ],
        }),
      });
      (getUnsignedERC721Transactions as jest.Mock).mockResolvedValue({
        approvalTransactions: [{ from: '0xAPPROVAL' }],
        fulfilmentTransactions: [{ from: '0xTRANSACTION' }],
      });
      (signApprovalTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.FAILED,
        transactionHash: '0xHASH',
        reason: 'approval error',
      });
      (signFulfilmentTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.SUCCESS,
      });

      // const orderId = '1';
      const order = {
        id: '1',
        takerFees: [],
      };
      const itemRequirements = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from('2'),
        },
      ];
      const fulfilmentTransaction: FulfilmentTransaction = {
        type: TransactionOrGasType.TRANSACTION,
        transaction: { from: '0xTRANSACTION' },
      };

      const buyResult = await buy(config, mockProvider, [order]);
      expect(smartCheckout).toBeCalledWith(
        config,
        mockProvider,
        itemRequirements,
        fulfilmentTransaction,
      );
      expect(buyResult).toEqual({
        smartCheckoutResult,
        orderId: order.id,
        status: {
          type: BuyStatusType.FAILED,
          transactionHash: '0xHASH',
          reason: 'approval error',
        },
      });
      expect(getUnsignedERC721Transactions).toBeCalledTimes(1);
      expect(signApprovalTransactions).toBeCalledWith(mockProvider, [{ from: '0xAPPROVAL' }]);
      expect(signFulfilmentTransactions).toBeCalledTimes(0);
    });

    it('should return a failed status when fulfilment fails', async () => {
      const smartCheckoutResult = {
        sufficient: true,
        transactionRequirements: [{
          type: ItemType.NATIVE,
          sufficient: true,
          required: {
            type: ItemType.NATIVE,
            balance: BigNumber.from(1),
            formattedBalance: '1',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
          current: {
            type: ItemType.NATIVE,
            balance: BigNumber.from(1),
            formattedBalance: '1',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
          delta: {
            balance: BigNumber.from(0),
            formattedBalance: '0',
          },
        }],
      };
      (smartCheckout as jest.Mock).mockResolvedValue(smartCheckoutResult);
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            buy: [
              {
                type: 'NATIVE',
                amount: '1',
              },
            ],
            fees: [
              {
                amount: '1',
              },
            ],
          },
        }),
        config: jest.fn().mockReturnValue({
          seaportContractAddress,
        }),
        fulfillOrder: jest.fn().mockReturnValue({
          actions: [
            {
              type: ActionType.TRANSACTION,
              purpose: TransactionPurpose.FULFILL_ORDER,
              buildTransaction: jest.fn().mockResolvedValue({ from: '0xTRANSACTION' } as PopulatedTransaction),
            },
            {
              type: ActionType.TRANSACTION,
              purpose: TransactionPurpose.APPROVAL,
              buildTransaction: jest.fn().mockResolvedValue({ from: '0xAPPROVAL' } as PopulatedTransaction),
            },
          ],
        }),
      });
      (getUnsignedERC721Transactions as jest.Mock).mockResolvedValue({
        approvalTransactions: [{ from: '0xAPPROVAL' }],
        fulfilmentTransactions: [{ from: '0xTRANSACTION' }],
      });
      (signApprovalTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.SUCCESS,
      });
      (signFulfilmentTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.FAILED,
        transactionHash: '0xHASH',
        reason: 'fulfilment error',
      });

      // const orderId = '1';
      const order = {
        id: '1',
        takerFees: [],
      };
      const itemRequirements = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from('2'),
        },
      ];
      const fulfilmentTransaction: FulfilmentTransaction = {
        type: TransactionOrGasType.TRANSACTION,
        transaction: { from: '0xTRANSACTION' },
      };

      const buyResult = await buy(config, mockProvider, [order]);
      expect(smartCheckout).toBeCalledWith(
        config,
        mockProvider,
        itemRequirements,
        fulfilmentTransaction,
      );
      expect(buyResult).toEqual({
        smartCheckoutResult,
        orderId: order.id,
        status: {
          type: BuyStatusType.FAILED,
          transactionHash: '0xHASH',
          reason: 'fulfilment error',
        },
      });
      expect(getUnsignedERC721Transactions).toBeCalledTimes(1);
      expect(signApprovalTransactions).toBeCalledWith(mockProvider, [{ from: '0xAPPROVAL' }]);
      expect(signFulfilmentTransactions).toBeCalledWith(mockProvider, [{ from: '0xTRANSACTION' }]);
    });

    it('should throw error if orderbook returns erc721', async () => {
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            buy: [
              {
                type: 'ERC721',
                tokenId: '1',
                contractAddress: '0x123',
              },
            ],
            fees: [
              {
                amount: '1',
              },
            ],
          },
        }),
        config: jest.fn().mockReturnValue({
          seaportContractAddress,
        }),
        fulfillOrder: jest.fn().mockRejectedValue({}),
      });

      // const orderId = '1';
      const order = {
        id: '1',
        takerFees: [],
      };
      let message;
      let type;
      let data;
      try {
        await buy(config, mockProvider, [order]);
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('Purchasing token type is unsupported');
      expect(type).toEqual(CheckoutErrorType.UNSUPPORTED_TOKEN_TYPE_ERROR);
      expect(data).toEqual({ orderId: '1' });
    });

    it('should throw error if orderbook returns unsupported item type', async () => {
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            buy: [
              {
                type: 'UNSUPPORTED',
                amount: '1',
              },
            ],
            fees: [
              {
                amount: '1',
              },
            ],
          },
        }),
        config: jest.fn().mockReturnValue({
          seaportContractAddress,
        }),
        fulfillOrder: jest.fn().mockRejectedValue({}),
      });

      // const orderId = '1';
      const order = {
        id: '1',
        takerFees: [],
      };
      let message;
      let type;
      let data;
      try {
        await buy(config, mockProvider, [order]);
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('Purchasing token type is unsupported');
      expect(type).toEqual(CheckoutErrorType.UNSUPPORTED_TOKEN_TYPE_ERROR);
      expect(data).toEqual({ orderId: '1' });
    });

    it('should throw error if orderbook returns error', async () => {
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        getListing: jest.fn().mockRejectedValue(new Error('error from orderbook')),
      });

      const provider = {} as any;
      // const orderId = '1';
      const order = {
        id: '1',
        takerFees: [],
      };

      let message;
      let type;
      let data;

      try {
        await buy(config, provider, [order]);
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('An error occurred while getting the order listing');
      expect(type).toEqual(CheckoutErrorType.GET_ORDER_LISTING_ERROR);
      expect(data).toEqual({
        orderId: '1',
        message: 'error from orderbook',
      });
    });
  });

  describe('taker fees', () => {
    let config: CheckoutConfiguration;
    let mockProvider: Web3Provider;

    beforeEach(() => {
      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
        }),
      } as unknown as Web3Provider;

      config = new CheckoutConfiguration({
        baseConfig: { environment: Environment.SANDBOX },
      });
    });
    const nativeOrderTakerFeeTestCases = [
      {
        name: 'percentageDecimal taker fee',
        orders: [{
          id: '1',
          takerFees: [{ amount: { percentageDecimal: 0.025 }, recipient: '0xFEERECIPIENT' }] as OrderFee[],
        }],
        expectedTakerFee: [
          {
            recipient: '0xFEERECIPIENT',
            amount: '25000000000000000',
          },
        ],
      },
      {
        name: 'token taker fee',
        orders: [{
          id: '1',
          takerFees: [{ amount: { token: '0.1' }, recipient: '0xFEERECIPIENT' }] as OrderFee[],
        }],
        expectedTakerFee: [
          {
            recipient: '0xFEERECIPIENT',
            amount: '100000000000000000',
          },
        ],
      },
      {
        name: 'undefined taker fee applies empty array',
        orders: [{
          id: '1',
        }],
        expectedTakerFee: [],
      },
      {
        name: 'multiple taker fees applies only the first',
        orders: [{
          id: '1',
          takerFees: [
            { amount: { token: '0.1' }, recipient: '0xFEERECIPIENT' },
            { amount: { token: '0.1' }, recipient: '0xFEERECIPIENT' },
          ] as OrderFee[],
        }],
        expectedTakerFee: [
          {
            recipient: '0xFEERECIPIENT',
            amount: '100000000000000000',
          },
          {
            recipient: '0xFEERECIPIENT',
            amount: '100000000000000000',
          },
        ],
      },
      {
        name: 'multiple orders and multiple taker fees applies only the first taker fee to first order',
        orders: [{
          id: '1',
          takerFees: [
            { amount: { token: '0.1' }, recipient: '0xFEERECIPIENT' },
            { amount: { token: '0.1' }, recipient: '0xFEERECIPIENT' },
          ] as OrderFee[],
        },
        {
          id: '2',
          takerFees: [
            { amount: { token: '0.1' }, recipient: '0xFEERECIPIENT' },
            { amount: { token: '0.1' }, recipient: '0xFEERECIPIENT' },
          ] as OrderFee[],
        }],
        expectedTakerFee: [
          {
            recipient: '0xFEERECIPIENT',
            amount: '100000000000000000',
          },
          {
            recipient: '0xFEERECIPIENT',
            amount: '100000000000000000',
          },
        ],
      },
    ];
    nativeOrderTakerFeeTestCases.forEach((testCase) => {
      it(`should add takerFees: ${testCase.name} (order in NATIVE)`, async () => {
        const smartCheckoutResult = {
          sufficient: true,
          transactionRequirements: [{
            type: ItemType.NATIVE,
            sufficient: true,
            required: {
              type: ItemType.NATIVE,
              balance: BigNumber.from(1),
              formattedBalance: '1',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
              },
            },
            current: {
              type: ItemType.NATIVE,
              balance: BigNumber.from(1),
              formattedBalance: '1',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
              },
            },
            delta: {
              balance: BigNumber.from(0),
              formattedBalance: '0',
            },
          }],
        };
        const fulfillOrderMock = jest.fn().mockReturnValue({
          actions: [
            {
              type: ActionType.TRANSACTION,
              purpose: TransactionPurpose.FULFILL_ORDER,
              buildTransaction: jest.fn().mockResolvedValue({ from: '0xTRANSACTION' } as PopulatedTransaction),
            },
            {
              type: ActionType.TRANSACTION,
              purpose: TransactionPurpose.APPROVAL,
              buildTransaction: jest.fn().mockResolvedValue({ from: '0xAPPROVAL' } as PopulatedTransaction),
            },
          ],
        });

        (smartCheckout as jest.Mock).mockResolvedValue(smartCheckoutResult);
        (createOrderbookInstance as jest.Mock).mockResolvedValue({
          getListing: jest.fn().mockResolvedValue({
            result: {
              buy: [
                {
                  type: 'NATIVE',
                  amount: '1000000000000000000',
                },
              ],
              fees: [
                {
                  amount: '1000000000000000000',
                },
              ],
            },
          }),
          config: jest.fn().mockReturnValue({
            seaportContractAddress,
          }),
          fulfillOrder: fulfillOrderMock,
        });
        (getUnsignedERC721Transactions as jest.Mock).mockResolvedValue({
          approvalTransactions: [{ from: '0xAPPROVAL' }],
          fulfilmentTransactions: [{ from: '0xTRANSACTION' }],
        });
        (signApprovalTransactions as jest.Mock).mockResolvedValue({
          type: SignTransactionStatusType.SUCCESS,
        });
        (signFulfilmentTransactions as jest.Mock).mockResolvedValue({
          type: SignTransactionStatusType.SUCCESS,
        });

        const itemRequirements = [
          {
            type: ItemType.NATIVE,
            amount: BigNumber.from('2000000000000000000'),
          },
        ];
        const fulfilmentTransaction: FulfilmentTransaction = {
          type: TransactionOrGasType.TRANSACTION,
          transaction: { from: '0xTRANSACTION' },
        };

        const buyResult = await buy(config, mockProvider, testCase.orders);
        expect(smartCheckout).toBeCalledWith(
          config,
          mockProvider,
          itemRequirements,
          fulfilmentTransaction,
        );
        expect(buyResult).toEqual({
          smartCheckoutResult,
          orderId: testCase.orders[0].id,
          status: {
            type: BuyStatusType.SUCCESS,
          },
        });
        expect(getUnsignedERC721Transactions).toBeCalledTimes(1);
        expect(signApprovalTransactions).toBeCalledWith(mockProvider, [{ from: '0xAPPROVAL' }]);
        expect(signFulfilmentTransactions).toBeCalledWith(mockProvider, [{ from: '0xTRANSACTION' }]);
        expect(fulfillOrderMock).toBeCalledWith(
          testCase.orders[0].id,
          '0xADDRESS',
          testCase.expectedTakerFee,
        );
      });
    });

    const erc20OrderTakerFeeTestCases = [
      {
        name: 'percentageDecimal taker fee',
        orders: [{
          id: '1',
          takerFees: [{ amount: { percentageDecimal: 0.025 }, recipient: '0xFEERECIPIENT' }] as OrderFee[],
        }],
        expectedTakerFee: [
          {
            recipient: '0xFEERECIPIENT',
            amount: '25000',
          },
        ],
      },
      {
        name: 'token taker fee',
        orders: [{
          id: '1',
          takerFees: [{ amount: { token: '0.1' }, recipient: '0xFEERECIPIENT' }] as OrderFee[],
        }],
        expectedTakerFee: [
          {
            recipient: '0xFEERECIPIENT',
            amount: '100000',
          },
        ],
      },
      {
        name: 'undefined taker fee applies empty array',
        orders: [{
          id: '1',
        }],
        expectedTakerFee: [],
      },
      {
        name: 'multiple taker fees',
        orders: [{
          id: '1',
          takerFees: [
            { amount: { token: '0.1' }, recipient: '0xFEERECIPIENT' },
            { amount: { token: '0.1' }, recipient: '0xFEERECIPIENT' },
          ] as OrderFee[],
        }],
        expectedTakerFee: [
          {
            recipient: '0xFEERECIPIENT',
            amount: '100000',
          },
          {
            recipient: '0xFEERECIPIENT',
            amount: '100000',
          },
        ],
      },
      {
        name: 'multiple orders and multiple taker fees applies only the first order',
        orders: [{
          id: '1',
          takerFees: [
            { amount: { token: '0.1' }, recipient: '0xFEERECIPIENT' },
            { amount: { token: '0.1' }, recipient: '0xFEERECIPIENT' },
          ] as OrderFee[],
        },
        {
          id: '2',
          takerFees: [
            { amount: { token: '0.1' }, recipient: '0xFEERECIPIENT' },
            { amount: { token: '0.1' }, recipient: '0xFEERECIPIENT' },
          ] as OrderFee[],
        }],
        expectedTakerFee: [
          {
            recipient: '0xFEERECIPIENT',
            amount: '100000',
          },
          {
            recipient: '0xFEERECIPIENT',
            amount: '100000',
          },
        ],
      },
    ];
    erc20OrderTakerFeeTestCases.forEach((testCase) => {
      it(`should add takerFees: ${testCase.name} (order in ERC20 6 decimals)`, async () => {
        (getTokenContract as jest.Mock).mockReturnValue({
          decimals: jest.fn().mockResolvedValue(6),
        });
        const smartCheckoutResult = {
          sufficient: true,
          transactionRequirements: [{
            type: ItemType.ERC20,
            sufficient: true,
            required: {
              type: ItemType.ERC20,
              balance: BigNumber.from('1000000'),
              formattedBalance: '1',
              token: {
                name: 'USDC',
                symbol: 'USDC',
                decimals: 6,
                address: '0xCONTRACTADDRESS',
              },
            },
            current: {
              type: ItemType.ERC20,
              balance: BigNumber.from('1000000'),
              formattedBalance: '1',
              token: {
                name: 'USDC',
                symbol: 'USDC',
                decimals: 6,
                address: '0xCONTRACTADDRESS',
              },
            },
            delta: {
              balance: BigNumber.from(0),
              formattedBalance: '0',
            },
          }],
        };
        const fulfillOrderMock = jest.fn().mockReturnValue({
          actions: [
            {
              type: ActionType.TRANSACTION,
              purpose: TransactionPurpose.FULFILL_ORDER,
              buildTransaction: jest.fn().mockResolvedValue({ from: '0xTRANSACTION' } as PopulatedTransaction),
            },
            {
              type: ActionType.TRANSACTION,
              purpose: TransactionPurpose.APPROVAL,
              buildTransaction: jest.fn().mockResolvedValue({ from: '0xAPPROVAL' } as PopulatedTransaction),
            },
          ],
        });

        (smartCheckout as jest.Mock).mockResolvedValue(smartCheckoutResult);
        (createOrderbookInstance as jest.Mock).mockResolvedValue({
          getListing: jest.fn().mockResolvedValue({
            result: {
              buy: [
                {
                  type: 'ERC20',
                  amount: '1000000',
                  contractAddress: '0xCONTRACTADDRESS',
                },
              ],
              fees: [
                {
                  amount: '1000000',
                },
              ],
            },
          }),
          config: jest.fn().mockReturnValue({
            seaportContractAddress,
          }),
          fulfillOrder: fulfillOrderMock,
        });
        (getUnsignedERC721Transactions as jest.Mock).mockResolvedValue({
          approvalTransactions: [{ from: '0xAPPROVAL' }],
          fulfilmentTransactions: [{ from: '0xTRANSACTION' }],
        });
        (signApprovalTransactions as jest.Mock).mockResolvedValue({
          type: SignTransactionStatusType.SUCCESS,
        });
        (signFulfilmentTransactions as jest.Mock).mockResolvedValue({
          type: SignTransactionStatusType.SUCCESS,
        });

        const itemRequirements = [
          {
            type: ItemType.ERC20,
            amount: BigNumber.from('2000000'),
            contractAddress: '0xCONTRACTADDRESS',
            spenderAddress: '0xSEAPORT',
          },
        ];
        const fulfilmentTransaction: FulfilmentTransaction = {
          type: TransactionOrGasType.TRANSACTION,
          transaction: { from: '0xTRANSACTION' },
        };

        const buyResult = await buy(config, mockProvider, testCase.orders);
        expect(smartCheckout).toBeCalledWith(
          config,
          mockProvider,
          itemRequirements,
          fulfilmentTransaction,
        );
        expect(buyResult).toEqual({
          smartCheckoutResult,
          orderId: testCase.orders[0].id,
          status: {
            type: BuyStatusType.SUCCESS,
          },
        });
        expect(getUnsignedERC721Transactions).toBeCalledTimes(1);
        expect(signApprovalTransactions).toBeCalledWith(mockProvider, [{ from: '0xAPPROVAL' }]);
        expect(signFulfilmentTransactions).toBeCalledWith(mockProvider, [{ from: '0xTRANSACTION' }]);
        expect(fulfillOrderMock).toBeCalledWith(
          testCase.orders[0].id,
          '0xADDRESS',
          testCase.expectedTakerFee,
        );
      });
    });
  });

  describe('getItemRequirement', () => {
    it('should return type of native and amount', () => {
      const type = ItemType.NATIVE;
      const amount = BigNumber.from('1');
      const contractAddress = '';
      const result = getItemRequirement(type, contractAddress, amount, seaportContractAddress);
      expect(result).toEqual({
        type,
        amount,
      });
    });

    it('should return type of erc20 and amount', () => {
      const type = ItemType.ERC20;
      const amount = BigNumber.from('1');
      const contractAddress = '0x123';
      const result = getItemRequirement(type, contractAddress, amount, seaportContractAddress);
      expect(result).toEqual({
        type,
        amount,
        contractAddress,
        spenderAddress: seaportContractAddress,
      });
    });

    it('should return type of native and amount if erc721', () => {
      const type = ItemType.ERC721;
      const amount = BigNumber.from('1');
      const contractAddress = '0x123';
      const result = getItemRequirement(type, contractAddress, amount, seaportContractAddress);
      expect(result).toEqual({
        type: ItemType.NATIVE,
        amount,
      });
    });

    it('should return type of native and amount for default case', () => {
      const amount = BigNumber.from('1');
      const contractAddress = '';
      const result = getItemRequirement('default' as ItemType, contractAddress, amount, seaportContractAddress);
      expect(result).toEqual({
        type: ItemType.NATIVE,
        amount,
      });
    });
  });

  describe('getTransactionOrGas', () => {
    it('should get fulfilment transaction if defined', () => {
      expect(getTransactionOrGas(
        gasLimit,
        {
          fulfilmentTransactions: [{ from: '0x123' }],
          approvalTransactions: [{ from: '0x234' }],
        },
      )).toEqual(
        {
          type: TransactionOrGasType.TRANSACTION,
          transaction: {
            from: '0x123',
          },
        },
      );
    });

    it('should get gas amount if no fulfilment transaction', () => {
      expect(getTransactionOrGas(
        gasLimit,
        {
          fulfilmentTransactions: [],
          approvalTransactions: [{ from: '0x234' }],
        },
      )).toEqual(
        {
          type: TransactionOrGasType.GAS,
          gasToken: {
            type: GasTokenType.NATIVE,
            limit: BigNumber.from(gasLimit),
          },
        },
      );
    });
  });
});
