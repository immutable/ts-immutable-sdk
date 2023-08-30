import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { ActionType, SignablePurpose, constants } from '@imtbl/orderbook';
import { BigNumber } from 'ethers';
import { sell } from './sell';
import { CheckoutConfiguration } from '../../config';
import { GasTokenType, ItemType, TransactionOrGasType } from '../../types';
import { smartCheckout } from '../smartCheckout';
import { createOrderbookInstance } from '../../instance';

jest.mock('../../instance');
jest.mock('../smartCheckout');

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

  it('should call smart checkout', async () => {
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
        amount: '100',
      },
    );

    expect(result).toEqual({
      itemRequirements: [erc721ItemRequirement],
      gasToken: {
        type: GasTokenType.NATIVE,
        limit: BigNumber.from(constants.estimatedFulfillmentGasGwei),
      },
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
  });
});
