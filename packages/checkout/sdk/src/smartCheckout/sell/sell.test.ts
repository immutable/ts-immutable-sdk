import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { ActionType, SignablePurpose, constants } from '@imtbl/orderbook';
import { BigNumber } from 'ethers';
import { getBuyToken, getERC721Requirement, sell } from './sell';
import { CheckoutConfiguration } from '../../config';
import { GasTokenType, ItemType, TransactionOrGasType } from '../../types';
import { smartCheckout } from '../smartCheckout';
import { createOrderbookInstance } from '../../instance';
import { BuyToken } from '../../types/sell';
import { CheckoutErrorType } from '../../errors';
import { executeTransactions, getUnsignedTransactions } from '../transactions';

jest.mock('../../instance');
jest.mock('../smartCheckout');
jest.mock('../transactions');

describe('sell', () => {
  const seaportContractAddress = '0xSEAPORT';
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

  describe('sell', () => {
    it('should call smart checkout and not execute the transactions', async () => {
      const id = '0';
      const contractAddress = '0xERC721';

      const erc721ItemRequirement = {
        type: ItemType.ERC721,
        id,
        contractAddress,
        spenderAddress: seaportContractAddress,
      };

      const erc721TransactionRequirement = {
        type: ItemType.ERC721,
        sufficient: true,
        required: {
          type: ItemType.ERC721,
          balance: BigNumber.from(1),
          formattedBalance: '1',
          contractAddress: '0xab8bb5bc4FB1Cfc060f77f87B558c98abDa65130',
          id: '0',
        },
        current: {
          type: ItemType.ERC721,
          balance: BigNumber.from(1),
          formattedBalance: '1',
          contractAddress: '0xab8bb5bc4FB1Cfc060f77f87B558c98abDa65130',
          id: '0',
        },
        delta: {
          balance: BigNumber.from(0),
          formattedBalance: '0',
        },
      };

      (smartCheckout as jest.Mock).mockResolvedValue({
        sufficient: true,
        transactionRequirements: [
          erc721TransactionRequirement,
        ],
      });
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        config: jest.fn().mockReturnValue({
          seaportContractAddress,
        }),
        prepareListing: jest.fn().mockReturnValue({
          actions: [
            {
              type: ActionType.SIGNABLE,
              purpose: SignablePurpose.CREATE_LISTING,
              message: {
                domain: '',
                types: '',
                value: '',
              },
            },
          ],
        }),
      });
      (getUnsignedTransactions as jest.Mock).mockResolvedValue({
        approvalTransactions: [{ from: '0xAPPROVAL' }],
        fulfilmentTransactions: [],
        signableMessages: [{
          domain: '',
          types: '',
          value: '',
        }],
      });

      const result = await sell(
        config,
        mockProvider,
        id,
        contractAddress,
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
      );

      expect(result).toEqual({
        smartCheckoutResult: {
          sufficient: true,
          transactionRequirements: [erc721TransactionRequirement],
        },
        transactions: {
          approvalTransactions: [{ from: '0xAPPROVAL' }],
          fulfilmentTransactions: [],
          signableMessages: [{
            domain: '',
            types: '',
            value: '',
          }],
        },
      });

      expect(smartCheckout).toBeCalledTimes(1);
      expect(smartCheckout).toBeCalledWith(
        config,
        mockProvider,
        [erc721ItemRequirement],
        {
          type: TransactionOrGasType.GAS,
          gasToken: {
            type: GasTokenType.NATIVE,
            limit: BigNumber.from(constants.estimatedFulfillmentGasGwei),
          },
        },
      );
    });

    it('should call smart checkout and execute the transactions', async () => {
      const id = '0';
      const contractAddress = '0xERC721';

      const erc721ItemRequirement = {
        type: ItemType.ERC721,
        id,
        contractAddress,
        spenderAddress: seaportContractAddress,
      };

      const erc721TransactionRequirement = {
        type: ItemType.ERC721,
        sufficient: true,
        required: {
          type: ItemType.ERC721,
          balance: BigNumber.from(1),
          formattedBalance: '1',
          contractAddress: '0xab8bb5bc4FB1Cfc060f77f87B558c98abDa65130',
          id: '0',
        },
        current: {
          type: ItemType.ERC721,
          balance: BigNumber.from(1),
          formattedBalance: '1',
          contractAddress: '0xab8bb5bc4FB1Cfc060f77f87B558c98abDa65130',
          id: '0',
        },
        delta: {
          balance: BigNumber.from(0),
          formattedBalance: '0',
        },
      };

      (smartCheckout as jest.Mock).mockResolvedValue({
        sufficient: true,
        transactionRequirements: [
          erc721TransactionRequirement,
        ],
      });
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        config: jest.fn().mockReturnValue({
          seaportContractAddress,
        }),
        prepareListing: jest.fn().mockReturnValue({
          actions: [
            {
              type: ActionType.SIGNABLE,
              purpose: SignablePurpose.CREATE_LISTING,
              message: {
                domain: '',
                types: '',
                value: '',
              },
            },
          ],
        }),
      });
      (getUnsignedTransactions as jest.Mock).mockResolvedValue({
        approvalTransactions: [{ from: '0xAPPROVAL' }],
        fulfilmentTransactions: [],
        signableMessages: [{
          domain: '',
          types: '',
          value: '',
        }],
      });
      (executeTransactions as jest.Mock).mockResolvedValue({});

      const result = await sell(
        config,
        mockProvider,
        id,
        contractAddress,
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        true,
      );

      expect(result).toEqual({
        smartCheckoutResult: {
          sufficient: true,
          transactionRequirements: [erc721TransactionRequirement],
        },
      });

      expect(smartCheckout).toBeCalledTimes(1);
      expect(smartCheckout).toBeCalledWith(
        config,
        mockProvider,
        [erc721ItemRequirement],
        {
          type: TransactionOrGasType.GAS,
          gasToken: {
            type: GasTokenType.NATIVE,
            limit: BigNumber.from(constants.estimatedFulfillmentGasGwei),
          },
        },
      );
      expect(executeTransactions).toBeCalledTimes(1);
    });

    it('should call smart checkout and return no transactions when sufficient false', async () => {
      const id = '0';
      const contractAddress = '0xERC721';

      const erc721ItemRequirement = {
        type: ItemType.ERC721,
        id,
        contractAddress,
        spenderAddress: seaportContractAddress,
      };

      const erc721TransactionRequirement = {
        type: ItemType.ERC721,
        sufficient: false,
        required: {
          type: ItemType.ERC721,
          balance: BigNumber.from(1),
          formattedBalance: '1',
          contractAddress: '0xab8bb5bc4FB1Cfc060f77f87B558c98abDa65130',
          id: '0',
        },
        current: {
          type: ItemType.ERC721,
          balance: BigNumber.from(0),
          formattedBalance: '0',
          contractAddress: '0xab8bb5bc4FB1Cfc060f77f87B558c98abDa65130',
          id: '0',
        },
        delta: {
          balance: BigNumber.from(1),
          formattedBalance: '1',
        },
      };

      (smartCheckout as jest.Mock).mockResolvedValue({
        sufficient: false,
        transactionRequirements: [
          erc721TransactionRequirement,
        ],
      });
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        config: jest.fn().mockReturnValue({
          seaportContractAddress,
        }),
        prepareListing: jest.fn().mockReturnValue({
          actions: [
            {
              type: ActionType.SIGNABLE,
              purpose: SignablePurpose.CREATE_LISTING,
              message: {
                domain: '',
                types: '',
                value: '',
              },
            },
          ],
        }),
      });

      const result = await sell(
        config,
        mockProvider,
        id,
        contractAddress,
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
      );

      expect(result).toEqual({
        smartCheckoutResult: {
          sufficient: false,
          transactionRequirements: [erc721TransactionRequirement],
        },
      });

      expect(smartCheckout).toBeCalledTimes(1);
      expect(smartCheckout).toBeCalledWith(
        config,
        mockProvider,
        [erc721ItemRequirement],
        {
          type: TransactionOrGasType.GAS,
          gasToken: {
            type: GasTokenType.NATIVE,
            limit: BigNumber.from(constants.estimatedFulfillmentGasGwei),
          },
        },
      );
    });

    it('should throw error if prepare listing fails', async () => {
      const id = '0';
      const contractAddress = '0xERC721';

      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        config: jest.fn().mockReturnValue({
          seaportContractAddress,
        }),
        prepareListing: jest.fn().mockRejectedValue(new Error('error from orderbook')),
      });

      let message;
      let type;
      let data;

      try {
        await sell(
          config,
          mockProvider,
          id,
          contractAddress,
          {
            type: ItemType.NATIVE,
            amount: BigNumber.from(1),
          },
        );
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('An error occurred while preparing the listing');
      expect(type).toEqual(CheckoutErrorType.PREPARE_ORDER_LISTING_ERROR);
      expect(data).toEqual({
        message: 'error from orderbook',
        id,
        collectionAddress: contractAddress,
      });

      expect(smartCheckout).toBeCalledTimes(0);
    });

    it('should throw error if getSigner call errors', async () => {
      const id = '0';
      const contractAddress = '0xERC721';

      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        config: jest.fn().mockReturnValue({
          seaportContractAddress,
        }),
        prepareListing: jest.fn().mockReturnValue({
          actions: [
            {
              type: ActionType.SIGNABLE,
              purpose: SignablePurpose.CREATE_LISTING,
              message: {
                domain: '',
                types: '',
                value: '',
              },
            },
          ],
        }),
      });

      const rejectedProvider = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockRejectedValue(new Error('error from provider')),
        }),
      } as unknown as Web3Provider;

      let message;
      let type;
      let data;

      try {
        await sell(
          config,
          rejectedProvider,
          id,
          contractAddress,
          {
            type: ItemType.NATIVE,
            amount: BigNumber.from(1),
          },
        );
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('An error occurred while preparing the listing');
      expect(type).toEqual(CheckoutErrorType.PREPARE_ORDER_LISTING_ERROR);
      expect(data).toEqual({
        message: 'error from provider',
        id,
        collectionAddress: contractAddress,
      });

      expect(smartCheckout).toBeCalledTimes(0);
    });
  });

  describe('getBuyToken', () => {
    it('should return a native buy token', () => {
      const buyToken: BuyToken = {
        type: ItemType.NATIVE,
        amount: BigNumber.from(1),
      };

      const result = getBuyToken(buyToken);

      expect(result).toEqual({
        type: ItemType.NATIVE,
        amount: '1',
      });
    });

    it('should return an ERC20 buy token', () => {
      const buyToken: BuyToken = {
        type: ItemType.ERC20,
        amount: BigNumber.from(1),
        contractAddress: '0xERC20',
      };

      const result = getBuyToken(buyToken);

      expect(result).toEqual({
        type: ItemType.ERC20,
        amount: '1',
        contractAddress: '0xERC20',
      });
    });
  });

  describe('getERC721Requirement', () => {
    it('should return an ERC721 item requirement', () => {
      const id = '0';
      const contractAddress = '0xERC721';
      const spenderAddress = '0xSEAPORT';

      const result = getERC721Requirement(id, contractAddress, spenderAddress);

      expect(result).toEqual({
        type: ItemType.ERC721,
        id,
        contractAddress,
        spenderAddress,
      });
    });
  });
});
