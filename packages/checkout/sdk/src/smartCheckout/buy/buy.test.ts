import { BigNumber, PopulatedTransaction } from 'ethers';
import { Environment } from '@imtbl/config';
import {
  ActionType, TransactionPurpose, constants,
} from '@imtbl/orderbook';
import { Web3Provider } from '@ethersproject/providers';
import {
  getItemRequirement, buy, getTransactionOrGas,
} from './buy';
import { createBlockchainDataInstance, createOrderbookInstance, getTokenContract } from '../../instance';
import { CheckoutConfiguration } from '../../config';
import { CheckoutErrorType } from '../../errors';
import {
  CheckoutStatus,
  FulfillmentTransaction, GasAmount, GasTokenType, ItemType, TransactionOrGasType,
} from '../../types/smartCheckout';
import { smartCheckout } from '..';
import {
  getUnsignedERC20ApprovalTransactions,
  getUnsignedERC721Transactions,
  getUnsignedFulfillmentTransactions,
  signApprovalTransactions,
  signFulfillmentTransactions,
} from '../actions';
import { BuyOrder, OrderFee } from '../../types';
import { SignTransactionStatusType } from '../actions/types';
import { INDEXER_ETH_ROOT_CONTRACT_ADDRESS } from '../routing/indexer/fetchL1Representation';
import { HttpClient } from '../../api/http';
import { sendTransaction } from '../../transaction';

jest.mock('../../instance');
jest.mock('../smartCheckout');
jest.mock('../actions');
jest.mock('../../transaction');

describe('buy', () => {
  const gasLimit = constants.estimatedFulfillmentGasGwei;
  const seaportContractAddress = '0xSEAPORT';
  let mockedHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {});
    mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
  });

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
      }, mockedHttpClient);
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
      (createOrderbookInstance as jest.Mock).mockReturnValue({
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
      (getUnsignedERC20ApprovalTransactions as jest.Mock).mockResolvedValue([{ from: '0xAPPROVAL' }]);
      (getUnsignedFulfillmentTransactions as jest.Mock).mockResolvedValue([{ from: '0xTRANSACTION' }]);
      (signApprovalTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.SUCCESS,
      });
      (signFulfillmentTransactions as jest.Mock).mockResolvedValue({
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

      const fulfillmentTransaction: FulfillmentTransaction = {
        type: TransactionOrGasType.TRANSACTION,
        transaction: { from: '0xTRANSACTION' },
      };

      const buyResult = await buy(config, mockProvider, [order]);
      expect(smartCheckout).toBeCalledWith(
        config,
        mockProvider,
        itemRequirements,
        fulfillmentTransaction,
      );

      expect(buyResult).toEqual({
        status: CheckoutStatus.SUCCESS,
        smartCheckoutResult,
      });
      expect(getUnsignedERC20ApprovalTransactions).toBeCalledTimes(1);
      expect(getUnsignedFulfillmentTransactions).toBeCalledTimes(1);
      expect(signApprovalTransactions).toBeCalledWith(mockProvider, [{ from: '0xAPPROVAL' }]);
      expect(signFulfillmentTransactions).toBeCalledWith(mockProvider, [{ from: '0xTRANSACTION' }]);
      expect(fulfillOrderMock).toBeCalledWith(
        order.id,
        '0xADDRESS',
        [
          {
            recipientAddress: '0xFEERECIPIENT',
            amount: '25000000000000000',
          },
        ],
      );
    });

    it('should call smart checkout with item requirements and execute transactions for ERC20 fulfillment', async () => {
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
        },
        {
          type: ItemType.ERC20,
          sufficient: true,
          required: {
            type: ItemType.ERC20,
            balance: BigNumber.from(1),
            formattedBalance: '1',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
          current: {
            type: ItemType.ERC20,
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
      (createBlockchainDataInstance as jest.Mock).mockReturnValue({
        getToken: jest.fn().mockResolvedValue({
          result: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            root_contract_address: INDEXER_ETH_ROOT_CONTRACT_ADDRESS,
          },
        }),
      });
      (createOrderbookInstance as jest.Mock).mockReturnValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            buy: [
              {
                type: 'ERC20',
                amount: '1000000000000000000',
                contractAddress: '0xCONTRACTADDRESS',
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
      (getTokenContract as jest.Mock).mockReturnValue(
        { decimals: jest.fn().mockResolvedValue(18) },
      );
      (getUnsignedERC20ApprovalTransactions as jest.Mock).mockResolvedValue([{ from: '0xAPPROVAL' }]);
      (getUnsignedFulfillmentTransactions as jest.Mock)
        .mockRejectedValueOnce(new Error('Cannot estimate gas - not enough ERC20 approval'))
        .mockResolvedValueOnce([{ from: '0xTRANSACTION' }]);
      (signApprovalTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.SUCCESS,
      });
      (signFulfillmentTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.SUCCESS,
      });

      const order: BuyOrder = {
        id: '1',
        takerFees: [{ amount: { percentageDecimal: 0.025 }, recipient: '0xFEERECIPIENT' }] as OrderFee[],
      };
      const itemRequirements = [
        {
          type: ItemType.ERC20,
          amount: BigNumber.from('2000000000000000000'),
          tokenAddress: '0xCONTRACTADDRESS',
          spenderAddress: '0xSEAPORT',
        },
      ];

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
        status: CheckoutStatus.SUCCESS,
        smartCheckoutResult,
      });
      expect(getUnsignedERC20ApprovalTransactions).toBeCalledTimes(1);
      expect(getUnsignedFulfillmentTransactions).toBeCalledTimes(2);
      expect(signApprovalTransactions).toBeCalledWith(mockProvider, [{ from: '0xAPPROVAL' }]);
      expect(signFulfillmentTransactions).toBeCalledWith(mockProvider, [{ from: '0xTRANSACTION' }]);
      expect(fulfillOrderMock).toBeCalledWith(
        order.id,
        '0xADDRESS',
        [
          {
            recipientAddress: '0xFEERECIPIENT',
            amount: '25000000000000000',
          },
        ],
      );
    });

    it('should return fulfillment transactions when waitFulfillmentSettlements override is false', async () => {
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
        },
        {
          type: ItemType.ERC20,
          sufficient: true,
          required: {
            type: ItemType.ERC20,
            balance: BigNumber.from(1),
            formattedBalance: '1',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
          current: {
            type: ItemType.ERC20,
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

      (sendTransaction as jest.Mock).mockResolvedValue({
        transactionResponse: { hash: '0xTRANSACTION' },
      });
      (smartCheckout as jest.Mock).mockResolvedValue(smartCheckoutResult);
      (createBlockchainDataInstance as jest.Mock).mockReturnValue({
        getToken: jest.fn().mockResolvedValue({
          result: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            root_contract_address: INDEXER_ETH_ROOT_CONTRACT_ADDRESS,
          },
        }),
      });
      (createOrderbookInstance as jest.Mock).mockReturnValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            buy: [
              {
                type: 'ERC20',
                amount: '1000000000000000000',
                contractAddress: '0xCONTRACTADDRESS',
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
      (getTokenContract as jest.Mock).mockReturnValue(
        { decimals: jest.fn().mockResolvedValue(18) },
      );
      (getUnsignedERC20ApprovalTransactions as jest.Mock).mockResolvedValue([{ from: '0xAPPROVAL' }]);
      (getUnsignedFulfillmentTransactions as jest.Mock)
        .mockRejectedValueOnce(new Error('Cannot estimate gas - not enough ERC20 approval'))
        .mockResolvedValueOnce([{ from: '0xTRANSACTION' }]);
      (signApprovalTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.SUCCESS,
      });

      const order: BuyOrder = {
        id: '1',
        takerFees: [{ amount: { percentageDecimal: 0.025 }, recipient: '0xFEERECIPIENT' }] as OrderFee[],
      };
      const itemRequirements = [
        {
          type: ItemType.ERC20,
          amount: BigNumber.from('2000000000000000000'),
          tokenAddress: '0xCONTRACTADDRESS',
          spenderAddress: '0xSEAPORT',
        },
      ];

      const gasTransaction: GasAmount = {
        type: TransactionOrGasType.GAS,
        gasToken: {
          type: GasTokenType.NATIVE,
          limit: BigNumber.from(constants.estimatedFulfillmentGasGwei),
        },
      };

      const buyResult = await buy(
        config,
        mockProvider,
        [order],
        { waitFulfillmentSettlements: false },
      );
      expect(smartCheckout).toBeCalledWith(
        config,
        mockProvider,
        itemRequirements,
        gasTransaction,
      );
      expect(buyResult).toEqual({
        status: CheckoutStatus.FULFILLMENTS_UNSETTLED,
        smartCheckoutResult,
        transactions: [{ hash: '0xTRANSACTION' }],
      });
      expect(getUnsignedERC20ApprovalTransactions).toBeCalledTimes(1);
      expect(getUnsignedFulfillmentTransactions).toBeCalledTimes(2);
      expect(signApprovalTransactions).toBeCalledWith(mockProvider, [{ from: '0xAPPROVAL' }]);
      expect(fulfillOrderMock).toBeCalledWith(
        order.id,
        '0xADDRESS',
        [
          {
            recipientAddress: '0xFEERECIPIENT',
            amount: '25000000000000000',
          },
        ],
      );
    });

    it(
      // eslint-disable-next-line max-len
      'should call smart checkout with item requirements and throw error if building fulfillment transaction fails after approving',
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
          },
          {
            type: ItemType.ERC20,
            sufficient: true,
            required: {
              type: ItemType.ERC20,
              balance: BigNumber.from(1),
              formattedBalance: '1',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
              },
            },
            current: {
              type: ItemType.ERC20,
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
        (createBlockchainDataInstance as jest.Mock).mockReturnValue({
          getToken: jest.fn().mockResolvedValue({
            result: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              root_contract_address: INDEXER_ETH_ROOT_CONTRACT_ADDRESS,
            },
          }),
        });
        (createOrderbookInstance as jest.Mock).mockReturnValue({
          getListing: jest.fn().mockResolvedValue({
            result: {
              buy: [
                {
                  type: 'ERC20',
                  amount: '1000000000000000000',
                  contractAddress: '0xCONTRACTADDRESS',
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
        (getTokenContract as jest.Mock).mockReturnValue(
          { decimals: jest.fn().mockResolvedValue(18) },
        );
        (getUnsignedERC20ApprovalTransactions as jest.Mock).mockResolvedValue([{ from: '0xAPPROVAL' }]);
        (getUnsignedFulfillmentTransactions as jest.Mock)
          .mockRejectedValue(new Error('Cannot estimate gas - not enough ERC20 approval'));
        (signApprovalTransactions as jest.Mock).mockResolvedValue({
          type: SignTransactionStatusType.SUCCESS,
        });
        (signFulfillmentTransactions as jest.Mock).mockResolvedValue({
          type: SignTransactionStatusType.SUCCESS,
        });

        const order: BuyOrder = {
          id: '1',
          takerFees: [{ amount: { percentageDecimal: 0.025 }, recipient: '0xFEERECIPIENT' }] as OrderFee[],
        };
        const itemRequirements = [
          {
            type: ItemType.ERC20,
            amount: BigNumber.from('2000000000000000000'),
            tokenAddress: '0xCONTRACTADDRESS',
            spenderAddress: '0xSEAPORT',
          },
        ];

        const gasTransaction: GasAmount = {
          type: TransactionOrGasType.GAS,
          gasToken: {
            type: GasTokenType.NATIVE,
            limit: BigNumber.from(constants.estimatedFulfillmentGasGwei),
          },
        };
        let errorMessage;
        let errorType;
        let errorData;
        try {
          await buy(config, mockProvider, [order]);
        } catch (err: any) {
          errorType = err.type;
          errorMessage = err.message;
          errorData = err.data;
        }

        expect(errorMessage).toEqual('Error fetching fulfillment transaction');
        expect(errorType).toEqual(CheckoutErrorType.FULFILL_ORDER_LISTING_ERROR);
        expect(errorData).toEqual({ message: 'Cannot estimate gas - not enough ERC20 approval' });

        expect(smartCheckout).toBeCalledWith(
          config,
          mockProvider,
          itemRequirements,
          gasTransaction,
        );

        expect(getUnsignedERC20ApprovalTransactions).toBeCalledTimes(1);
        expect(getUnsignedFulfillmentTransactions).toBeCalledTimes(2);
        expect(signApprovalTransactions).toBeCalledWith(mockProvider, [{ from: '0xAPPROVAL' }]);
      },
    );

    it(
      'should call smart checkout with item requirements and gas limit if fulfillOrder errors with balance error',
      async () => {
        (getUnsignedERC20ApprovalTransactions as jest.Mock).mockResolvedValue([{ from: '0xAPPROVAL' }]);
        (getUnsignedFulfillmentTransactions as jest.Mock).mockResolvedValue([]);
        (smartCheckout as jest.Mock).mockResolvedValue({});
        (createOrderbookInstance as jest.Mock).mockReturnValue({
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
          fulfillOrder: jest.fn().mockRejectedValue(
            new Error('The fulfiller does not have the balances needed to fulfill.'),
          ),
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

        await buy(config, mockProvider, [order]);
        expect(smartCheckout).toBeCalledWith(
          config,
          mockProvider,
          itemRequirements,
          gasAmount,
        );
      },
    );

    it('should call smart checkout with an erc20 requirement if fulfillOrder errors with balance error', async () => {
      (getUnsignedERC20ApprovalTransactions as jest.Mock).mockResolvedValue([{ from: '0xAPPROVAL' }]);
      (getUnsignedFulfillmentTransactions as jest.Mock).mockResolvedValue([]);
      (createOrderbookInstance as jest.Mock).mockReturnValue({
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
        fulfillOrder: jest.fn().mockRejectedValue(
          new Error('The fulfiller does not have the balances needed to fulfill.'),
        ),
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
      (signFulfillmentTransactions as jest.Mock).mockResolvedValue({
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
          tokenAddress: '0x123',
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

      await buy(config, mockProvider, [order]);
      expect(smartCheckout).toBeCalledWith(
        config,
        mockProvider,
        itemRequirements,
        gasAmount,
      );
    });

    it('should not sign actions and only return smart checkout result when sufficient false', async () => {
      (getUnsignedERC20ApprovalTransactions as jest.Mock).mockResolvedValue([{ from: '0xAPPROVAL' }]);
      (getUnsignedFulfillmentTransactions as jest.Mock).mockResolvedValue([{ from: '0xTRANSACTION' }]);
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
      (createOrderbookInstance as jest.Mock).mockReturnValue({
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
        fulfillmentTransactions: [{ from: '0xTRANSACTION' }],
      });
      (signApprovalTransactions as jest.Mock).mockResolvedValue({});
      (signFulfillmentTransactions as jest.Mock).mockResolvedValue({});
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
      const fulfillmentTransaction: FulfillmentTransaction = {
        type: TransactionOrGasType.TRANSACTION,
        transaction: { from: '0xTRANSACTION' },
      };

      const buyResult = await buy(config, mockProvider, [order]);
      expect(smartCheckout).toBeCalledWith(
        config,
        mockProvider,
        itemRequirements,
        fulfillmentTransaction,
      );
      expect(signApprovalTransactions).toBeCalledTimes(0);
      expect(signFulfillmentTransactions).toBeCalledTimes(0);
      expect(buyResult).toEqual({
        status: CheckoutStatus.INSUFFICIENT_FUNDS,
        smartCheckoutResult,
      });
    });

    it('should return a failed status when approval fails', async () => {
      (getUnsignedERC20ApprovalTransactions as jest.Mock).mockResolvedValue([{ from: '0xAPPROVAL' }]);
      (getUnsignedFulfillmentTransactions as jest.Mock).mockResolvedValue([{ from: '0xTRANSACTION' }]);
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
      (createOrderbookInstance as jest.Mock).mockReturnValue({
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
        fulfillmentTransactions: [{ from: '0xTRANSACTION' }],
      });
      (signApprovalTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.FAILED,
        transactionHash: '0xHASH',
        reason: 'approval error',
      });
      (signFulfillmentTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.SUCCESS,
      });

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
      const fulfillmentTransaction: FulfillmentTransaction = {
        type: TransactionOrGasType.TRANSACTION,
        transaction: { from: '0xTRANSACTION' },
      };

      const buyResult = await buy(config, mockProvider, [order]);
      expect(smartCheckout).toBeCalledWith(
        config,
        mockProvider,
        itemRequirements,
        fulfillmentTransaction,
      );
      expect(buyResult).toEqual({
        status: CheckoutStatus.FAILED,
        transactionHash: '0xHASH',
        reason: 'approval error',
        smartCheckoutResult,
      });
      expect(getUnsignedERC20ApprovalTransactions).toBeCalledTimes(1);
      expect(getUnsignedFulfillmentTransactions).toBeCalledTimes(1);
      expect(signApprovalTransactions).toBeCalledWith(mockProvider, [{ from: '0xAPPROVAL' }]);
      expect(signFulfillmentTransactions).toBeCalledTimes(0);
    });

    it('should return a failed status when fulfillment fails', async () => {
      (getUnsignedERC20ApprovalTransactions as jest.Mock).mockResolvedValue([{ from: '0xAPPROVAL' }]);
      (getUnsignedFulfillmentTransactions as jest.Mock).mockResolvedValue([{ from: '0xTRANSACTION' }]);
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
      (createOrderbookInstance as jest.Mock).mockReturnValue({
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
        fulfillmentTransactions: [{ from: '0xTRANSACTION' }],
      });
      (signApprovalTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.SUCCESS,
      });
      (signFulfillmentTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.FAILED,
        transactionHash: '0xHASH',
        reason: 'fulfillment error',
      });

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
      const fulfillmentTransaction: FulfillmentTransaction = {
        type: TransactionOrGasType.TRANSACTION,
        transaction: { from: '0xTRANSACTION' },
      };

      const buyResult = await buy(config, mockProvider, [order]);
      expect(smartCheckout).toBeCalledWith(
        config,
        mockProvider,
        itemRequirements,
        fulfillmentTransaction,
      );
      expect(buyResult).toEqual({
        status: CheckoutStatus.FAILED,
        transactionHash: '0xHASH',
        reason: 'fulfillment error',
        smartCheckoutResult,
      });
      expect(getUnsignedERC20ApprovalTransactions).toBeCalledTimes(1);
      expect(getUnsignedFulfillmentTransactions).toBeCalledTimes(1);
      expect(signApprovalTransactions).toBeCalledWith(mockProvider, [{ from: '0xAPPROVAL' }]);
      expect(signFulfillmentTransactions).toBeCalledWith(mockProvider, [{ from: '0xTRANSACTION' }]);
    });

    it('should throw error if orderbook returns erc721', async () => {
      (createOrderbookInstance as jest.Mock).mockReturnValue({
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
        fulfillOrder: jest.fn().mockReturnValue({
          actions: [],
        }),
      });

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
      (createOrderbookInstance as jest.Mock).mockReturnValue({
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
        fulfillOrder: jest.fn().mockReturnValue({
          actions: [],
        }),
      });

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

    it('should throw expired error if orderbook fulfillOrder returns expired error', async () => {
      (createOrderbookInstance as jest.Mock).mockReturnValue({
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
        fulfillOrder: jest.fn().mockRejectedValue(new Error(
          'Unable to prepare fulfillment date: order is not active: 1, actual status EXPIRED',
        )),
      });

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

      expect(message).toEqual('Order is expired');
      expect(type).toEqual(CheckoutErrorType.ORDER_EXPIRED_ERROR);
      expect(data).toEqual({
        orderId: '1',
      });
    });

    it('should throw error if orderbook fulfillOrder returns error other than expired or balances', async () => {
      (createOrderbookInstance as jest.Mock).mockReturnValue({
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
        fulfillOrder: jest.fn().mockRejectedValue(new Error(
          'error from orderbook',
        )),
      });

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

      expect(message).toEqual('Error occurred while trying to fulfill the order');
      expect(type).toEqual(CheckoutErrorType.FULFILL_ORDER_LISTING_ERROR);
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
      }, mockedHttpClient);
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
            recipientAddress: '0xFEERECIPIENT',
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
            recipientAddress: '0xFEERECIPIENT',
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
            recipientAddress: '0xFEERECIPIENT',
            amount: '100000000000000000',
          },
          {
            recipientAddress: '0xFEERECIPIENT',
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
            recipientAddress: '0xFEERECIPIENT',
            amount: '100000000000000000',
          },
          {
            recipientAddress: '0xFEERECIPIENT',
            amount: '100000000000000000',
          },
        ],
      },
    ];
    nativeOrderTakerFeeTestCases.forEach((testCase) => {
      it(`should add takerFees: ${testCase.name} (order in NATIVE)`, async () => {
        (getUnsignedERC20ApprovalTransactions as jest.Mock).mockResolvedValue([{ from: '0xAPPROVAL' }]);
        (getUnsignedFulfillmentTransactions as jest.Mock).mockResolvedValue([{ from: '0xTRANSACTION' }]);
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
        (createOrderbookInstance as jest.Mock).mockReturnValue({
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
        (signApprovalTransactions as jest.Mock).mockResolvedValue({
          type: SignTransactionStatusType.SUCCESS,
        });
        (signFulfillmentTransactions as jest.Mock).mockResolvedValue({
          type: SignTransactionStatusType.SUCCESS,
        });

        const itemRequirements = [
          {
            type: ItemType.NATIVE,
            amount: BigNumber.from('2000000000000000000'),
          },
        ];
        const fulfillmentTransaction: FulfillmentTransaction = {
          type: TransactionOrGasType.TRANSACTION,
          transaction: { from: '0xTRANSACTION' },
        };

        const buyResult = await buy(config, mockProvider, testCase.orders);
        expect(smartCheckout).toBeCalledWith(
          config,
          mockProvider,
          itemRequirements,
          fulfillmentTransaction,
        );
        expect(buyResult).toEqual({
          status: CheckoutStatus.SUCCESS,
          smartCheckoutResult,
        });
        expect(getUnsignedERC20ApprovalTransactions).toBeCalledTimes(1);
        expect(getUnsignedFulfillmentTransactions).toBeCalledTimes(1);
        expect(signApprovalTransactions).toBeCalledWith(mockProvider, [{ from: '0xAPPROVAL' }]);
        expect(signFulfillmentTransactions).toBeCalledWith(mockProvider, [{ from: '0xTRANSACTION' }]);
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
            recipientAddress: '0xFEERECIPIENT',
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
            recipientAddress: '0xFEERECIPIENT',
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
            recipientAddress: '0xFEERECIPIENT',
            amount: '100000',
          },
          {
            recipientAddress: '0xFEERECIPIENT',
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
            recipientAddress: '0xFEERECIPIENT',
            amount: '100000',
          },
          {
            recipientAddress: '0xFEERECIPIENT',
            amount: '100000',
          },
        ],
      },
    ];
    erc20OrderTakerFeeTestCases.forEach((testCase) => {
      it(`should add takerFees: ${testCase.name} (order in ERC20 6 decimals)`, async () => {
        (getUnsignedERC20ApprovalTransactions as jest.Mock).mockResolvedValue([{ from: '0xAPPROVAL' }]);
        (getUnsignedFulfillmentTransactions as jest.Mock).mockResolvedValue([{ from: '0xTRANSACTION' }]);
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
        (createOrderbookInstance as jest.Mock).mockReturnValue({
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
        (createBlockchainDataInstance as jest.Mock).mockReturnValue({
          getToken: jest.fn().mockResolvedValue({
            result: {
              decimals: 6,
            },
          }),
        });
        (signApprovalTransactions as jest.Mock).mockResolvedValue({
          type: SignTransactionStatusType.SUCCESS,
        });
        (signFulfillmentTransactions as jest.Mock).mockResolvedValue({
          type: SignTransactionStatusType.SUCCESS,
        });

        const itemRequirements = [
          {
            type: ItemType.ERC20,
            amount: BigNumber.from('2000000'),
            tokenAddress: '0xCONTRACTADDRESS',
            spenderAddress: '0xSEAPORT',
          },
        ];
        const fulfillmentTransaction: FulfillmentTransaction = {
          type: TransactionOrGasType.TRANSACTION,
          transaction: { from: '0xTRANSACTION' },
        };

        const buyResult = await buy(config, mockProvider, testCase.orders);
        expect(smartCheckout).toBeCalledWith(
          config,
          mockProvider,
          itemRequirements,
          fulfillmentTransaction,
        );
        expect(buyResult).toEqual({
          status: CheckoutStatus.SUCCESS,
          smartCheckoutResult,
        });
        expect(getUnsignedERC20ApprovalTransactions).toBeCalledTimes(1);
        expect(getUnsignedFulfillmentTransactions).toBeCalledTimes(1);
        expect(signApprovalTransactions).toBeCalledWith(mockProvider, [{ from: '0xAPPROVAL' }]);
        expect(signFulfillmentTransactions).toBeCalledWith(mockProvider, [{ from: '0xTRANSACTION' }]);
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
      const tokenAddress = '';
      const result = getItemRequirement(type, tokenAddress, amount, seaportContractAddress);
      expect(result).toEqual({
        type,
        amount,
      });
    });

    it('should return type of erc20 and amount', () => {
      const type = ItemType.ERC20;
      const amount = BigNumber.from('1');
      const tokenAddress = '0x123';
      const result = getItemRequirement(type, tokenAddress, amount, seaportContractAddress);
      expect(result).toEqual({
        type,
        amount,
        tokenAddress,
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
      const tokenAddress = '';
      const result = getItemRequirement('default' as ItemType, tokenAddress, amount, seaportContractAddress);
      expect(result).toEqual({
        type: ItemType.NATIVE,
        amount,
      });
    });
  });

  describe('getTransactionOrGas', () => {
    it('should get fulfillment transaction if defined', () => {
      expect(getTransactionOrGas(
        gasLimit,
        [{ from: '0x123' }],
      )).toEqual(
        {
          type: TransactionOrGasType.TRANSACTION,
          transaction: {
            from: '0x123',
          },
        },
      );
    });

    it('should get gas amount if no fulfillment transaction', () => {
      expect(getTransactionOrGas(
        gasLimit,
        [],
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
