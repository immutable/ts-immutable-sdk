import { Environment } from '@imtbl/config';
import { CheckoutConfiguration } from '../../../config';
import {
  ChainId,
  FundingStepType,
  ItemType,
} from '../../../types';
import { allowListCheckForOnRamp } from '../../allowList';
import { onRampRoute } from './onRampRoute';
import { BalanceERC20Requirement, BalanceERC721Requirement } from '../../balanceCheck/types';
import { HttpClient } from '../../../api/http';

jest.mock('../../allowList/allowListCheck');

describe('onRampRoute', () => {
  const mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
  const config = new CheckoutConfiguration({
    baseConfig: { environment: Environment.SANDBOX },
  }, mockedHttpClient);

  beforeEach(() => {
    (allowListCheckForOnRamp as jest.Mock).mockResolvedValue(
      [
        {
          address: '0x65AA7a21B0f3ce9B478aAC3408fE75b423939b1F',
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
        },
      ],
    );
  });

  it('should return the onRamp route if the ERC20 balance requirement is in the allowlist', async () => {
    const balanceRequirement: BalanceERC20Requirement = {
      type: ItemType.ERC20,
      required: {
        balance: BigInt(10),
        formattedBalance: '10',
        token: {
          address: '0x65AA7a21B0f3ce9B478aAC3408fE75b423939b1F',
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      },
      sufficient: false,
      current: {
        balance: BigInt(4),
        formattedBalance: '4',
        token: {
          address: '0x65AA7a21B0f3ce9B478aAC3408fE75b423939b1F',
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      },
      delta: {
        balance: BigInt(6),
        formattedBalance: '6',
      },
    } as BalanceERC20Requirement;

    const route = await onRampRoute(
      config,
      {
        onRamp: true,
      },
      balanceRequirement,
    );

    expect(route)
      .toEqual({
        type: FundingStepType.ONRAMP,
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        fundingItem: {
          type: ItemType.ERC20,
          fundsRequired: {
            amount: BigInt(6),
            formattedAmount: '6',
          },
          userBalance: {
            balance: BigInt(4),
            formattedBalance: '4',
          },
          token: {
            address: '0x65AA7a21B0f3ce9B478aAC3408fE75b423939b1F',
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
        },
      });
  });

  it('should return item type NATIVE', async () => {
    const balanceRequirement: BalanceERC20Requirement = {
      type: ItemType.ERC20,
      required: {
        balance: BigInt(10),
        formattedBalance: '10',
        token: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
        },
      },
      sufficient: false,
      current: {
        balance: BigInt(4),
        formattedBalance: '4',
        token: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
        },
      },
      delta: {
        balance: BigInt(6),
        formattedBalance: '6',
      },
    } as BalanceERC20Requirement;

    const route = await onRampRoute(
      config,
      {
        onRamp: true,
      },
      balanceRequirement,
    );

    expect(route)
      .toEqual({
        type: FundingStepType.ONRAMP,
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        fundingItem: {
          type: ItemType.NATIVE,
          fundsRequired: {
            amount: BigInt(6),
            formattedAmount: '6',
          },
          userBalance: {
            balance: BigInt(4),
            formattedBalance: '4',
          },
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
      });
  });

  it('should return undefined if the ERC20 balance requirement is not in the allowlist', async () => {
    const balanceRequirement: BalanceERC20Requirement = {
      type: ItemType.ERC20,
      required: {
        balance: BigInt(10),
        formattedBalance: '10',
        token: {
          address: '0x65AA7a21B0f3ce9B478aAC3408fE75b423939b1F',
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      },
      sufficient: false,
      current: {
        balance: BigInt(0),
        formattedBalance: '0',
        token: {
          address: '0x65AA7a21B0f3ce9B478aAC3408fE75b423939b1F',
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      },
      delta: {
        balance: BigInt(10),
        formattedBalance: '10',
      },
    } as BalanceERC20Requirement;

    (allowListCheckForOnRamp as jest.Mock).mockResolvedValue([]);

    const route = await onRampRoute(
      config,
      {
        onRamp: true,
      },
      balanceRequirement,
    );

    expect(route).toBeUndefined();
  });

  it('should return undefined if the balance requirement is an ERC721', async () => {
    const balanceRequirement: BalanceERC721Requirement = {
      type: ItemType.ERC721,
      required: {
        type: ItemType.ERC721,
        balance: BigInt(1),
        formattedBalance: '1',
        id: '1',
        contractAddress: '0xADDRESS',
      },
      sufficient: false,
      current: {
        type: ItemType.ERC721,
        balance: BigInt(0),
        formattedBalance: '0',
        id: '1',
        contractAddress: '0xADDRESS',
      },
      delta: {
        balance: BigInt(1),
        formattedBalance: '1',
      },
    } as BalanceERC721Requirement;

    (allowListCheckForOnRamp as jest.Mock).mockResolvedValue([]);

    const route = await onRampRoute(
      config,
      {
        onRamp: true,
      },
      balanceRequirement,
    );

    expect(route).toBeUndefined();
  });
});
