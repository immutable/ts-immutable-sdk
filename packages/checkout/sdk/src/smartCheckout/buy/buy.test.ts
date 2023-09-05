import { BigNumber, PopulatedTransaction } from 'ethers';
import { Environment } from '@imtbl/config';
import {
  ActionType, TransactionPurpose, constants,
} from '@imtbl/orderbook';
import { Web3Provider } from '@ethersproject/providers';
import {
  getItemRequirement, buy, getTransactionOrGas,
} from './buy';
import { createOrderbookInstance } from '../../instance';
import { CheckoutConfiguration } from '../../config';
import { CheckoutErrorType } from '../../errors';
import {
  FulfilmentTransaction, GasAmount, GasTokenType, ItemType, TransactionOrGasType,
} from '../../types/smartCheckout';
import { smartCheckout } from '..';
import { executeTransactions, getUnsignedActions } from '../actions';

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

    it(
      'should call smart checkout with item requirements and fulfilment transaction and not execute transactions',
      async () => {
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
        (getUnsignedActions as jest.Mock).mockResolvedValue({
          approvalTransactions: [{ from: '0xAPPROVAL' }],
          fulfilmentTransactions: [{ from: '0xTRANSACTION' }],
          signableMessages: [],
        });

        const orderId = '1';
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

        const buyResult = await buy(config, mockProvider, orderId);
        expect(smartCheckout).toBeCalledWith(
          config,
          mockProvider,
          itemRequirements,
          fulfilmentTransaction,
        );
        expect(buyResult).toEqual({
          smartCheckoutResult,
          unsignedActions: {
            approvalTransactions: [{ from: '0xAPPROVAL' }],
            fulfilmentTransactions: [{ from: '0xTRANSACTION' }],
            signableMessages: [],
          },
        });
        expect(executeTransactions).toBeCalledTimes(0);
      },
    );

    it('should call smart checkout with item requirements and gas limit', async () => {
      (smartCheckout as jest.Mock).mockResolvedValue({});
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
        fulfillOrder: jest.fn().mockRejectedValue({}),
      });

      const orderId = '1';
      const itemRequirements = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from('2'),
        },
      ];
      const gasAmount: GasAmount = {
        type: TransactionOrGasType.GAS,
        gasToken: {
          type: GasTokenType.NATIVE,
          limit: BigNumber.from(gasLimit),
        },
      };

      await buy(config, mockProvider, orderId);
      expect(smartCheckout).toBeCalledWith(
        config,
        mockProvider,
        itemRequirements,
        gasAmount,
      );
    });

    it('should call smart checkout with an erc20 requirement', async () => {
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            buy: [
              {
                type: 'ERC20',
                amount: '1',
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

      const orderId = '1';
      const itemRequirements = [
        {
          type: ItemType.ERC20,
          amount: BigNumber.from('2'),
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

      await buy(config, mockProvider, orderId);
      expect(smartCheckout).toBeCalledWith(
        config,
        mockProvider,
        itemRequirements,
        gasAmount,
      );
    });

    it('should execute transactions when execute transaction flag provided and sufficient true', async () => {
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
      (executeTransactions as jest.Mock).mockResolvedValue({});

      const orderId = '1';
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

      const buyResult = await buy(config, mockProvider, orderId, true);
      expect(smartCheckout).toBeCalledWith(
        config,
        mockProvider,
        itemRequirements,
        fulfilmentTransaction,
      );
      expect(executeTransactions).toBeCalledWith(
        mockProvider,
        {
          approvalTransactions: [{ from: '0xAPPROVAL' }],
          fulfilmentTransactions: [{ from: '0xTRANSACTION' }],
          signableMessages: [],
        },
      );
      expect(buyResult).toEqual({
        smartCheckoutResult,
      });
    });

    it(
      `should not execute transactions and only return smart checkout result when 
      execute transaction flag provided and sufficient false`,
      async () => {
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
        (executeTransactions as jest.Mock).mockResolvedValue({});

        const orderId = '1';
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

        const buyResult = await buy(config, mockProvider, orderId, true);
        expect(smartCheckout).toBeCalledWith(
          config,
          mockProvider,
          itemRequirements,
          fulfilmentTransaction,
        );
        expect(executeTransactions).toBeCalledTimes(0);
        expect(buyResult).toEqual({
          smartCheckoutResult,
        });
      },
    );

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

      const orderId = '1';
      let message;
      let type;
      let data;
      try {
        await buy(config, mockProvider, orderId);
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

      const orderId = '1';
      let message;
      let type;
      let data;
      try {
        await buy(config, mockProvider, orderId);
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
      const orderId = '1';

      let message;
      let type;
      let data;

      try {
        await buy(config, provider, orderId);
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
          signableMessages: [],
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
          signableMessages: [],
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
