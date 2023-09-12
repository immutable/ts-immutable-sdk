import { BigNumber, ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import * as instance from '../../../instance';
import { CheckoutConfiguration } from '../../../config';
import { ChainId, ItemType } from '../../../types';
import { BalanceRequirement } from '../../balanceCheck/types';
import { estimateApprovalGas, estimateGasForBridgeApproval } from './estimateApprovalGas';
import { CheckoutErrorType } from '../../../errors';

jest.mock('../../../instance');
jest.mock('../../../config');

describe('estimateGasForBridgeApproval', () => {
  let providerMock: Web3Provider;
  const readOnlyProviders = new Map<ChainId, ethers.providers.JsonRpcProvider>();
  const config = new CheckoutConfiguration({
    baseConfig: { environment: Environment.SANDBOX },
  });

  beforeEach(() => {
    providerMock = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xaddress'),
      }),
      estimateGas: jest.fn().mockResolvedValue(BigNumber.from(123)),
    } as unknown as Web3Provider;
  });

  describe('estimateGasForBridgeApproval', () => {
    it('should estimate gas for bridge approval for ERC20 token', async () => {
      const balanceRequirement: BalanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: { balance: BigNumber.from(100), formattedBalance: '100' },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from(50),
          formattedBalance: '50',
          token: {
            address: '0xERC20',
            decimals: 18,
            symbol: 'ERC20',
            name: 'ERC20',
          },
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from(150),
          formattedBalance: '150',
          token: {
            address: '0xERC20',
            decimals: 18,
            symbol: 'ERC20',
            name: 'ERC20',
          },
        },
      };

      const tokenBridge = {
        getUnsignedApproveDepositBridgeTx: jest.fn().mockResolvedValue({
          unsignedTx: {},
        }),
      };
      (instance.createBridgeInstance as jest.Mock).mockResolvedValue(tokenBridge);

      const gasEstimation = await estimateGasForBridgeApproval(
        config,
        readOnlyProviders,
        providerMock,
        balanceRequirement,
      );

      expect(gasEstimation).toEqual(BigNumber.from(123));
    });

    it('should return zero for bridge approval if NATIVE token', async () => {
      const balanceRequirement: BalanceRequirement = {
        type: ItemType.NATIVE,
        sufficient: false,
        delta: { balance: BigNumber.from(100), formattedBalance: '100' },
        current: {
          type: ItemType.NATIVE,
          balance: BigNumber.from(50),
          formattedBalance: '50',
          token: {
            address: '0xIMX',
            decimals: 18,
            symbol: 'IMX',
            name: 'IMX',
          },
        },
        required: {
          type: ItemType.NATIVE,
          balance: BigNumber.from(150),
          formattedBalance: '150',
          token: {
            address: '0xIMX',
            decimals: 18,
            symbol: 'IMX',
            name: 'IMX',
          },
        },
      };

      const tokenBridge = {
        getUnsignedApproveDepositBridgeTx: jest.fn().mockResolvedValue({
          unsignedTx: {},
        }),
      };
      (instance.createBridgeInstance as jest.Mock).mockResolvedValue(tokenBridge);

      const gasEstimation = await estimateGasForBridgeApproval(
        config,
        readOnlyProviders,
        providerMock,
        balanceRequirement,
      );

      expect(gasEstimation).toEqual(BigNumber.from(0));
      expect(tokenBridge.getUnsignedApproveDepositBridgeTx).not.toHaveBeenCalled();
    });

    it('should throw error if trying to estimate an ERC20 with no address', async () => {
      const balanceRequirement: BalanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: { balance: BigNumber.from(100), formattedBalance: '100' },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from(50),
          formattedBalance: '50',
          token: {
            decimals: 18,
            symbol: 'ERC20',
            name: 'ERC20',
          },
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from(150),
          formattedBalance: '150',
          token: {
            decimals: 18,
            symbol: 'ERC20',
            name: 'ERC20',
          },
        },
      };

      let type;

      try {
        await estimateGasForBridgeApproval(
          config,
          readOnlyProviders,
          providerMock,
          balanceRequirement,
        );
      } catch (err: any) {
        type = err.type;
      }

      expect(type).toEqual(CheckoutErrorType.BRIDGE_GAS_ESTIMATE_ERROR);
    });

    it('should throw error if trying to estimate an ERC721', async () => {
      const balanceRequirement: BalanceRequirement = {
        type: ItemType.ERC721,
        sufficient: false,
        delta: { balance: BigNumber.from(1), formattedBalance: '1' },
        current: {
          type: ItemType.ERC721,
          balance: BigNumber.from(0),
          formattedBalance: '0',
          contractAddress: '0xERC721',
          id: '0',
        },
        required: {
          type: ItemType.ERC721,
          balance: BigNumber.from(1),
          formattedBalance: '1',
          contractAddress: '0xERC721',
          id: '0',
        },
      };

      let type;

      try {
        await estimateGasForBridgeApproval(
          config,
          readOnlyProviders,
          providerMock,
          balanceRequirement,
        );
      } catch (err: any) {
        type = err.type;
      }

      expect(type).toEqual(CheckoutErrorType.BRIDGE_GAS_ESTIMATE_ERROR);
    });
  });

  describe('estimateApprovalGas', () => {
    it('should return estimated gas', async () => {
      const tokenBridge = {
        getUnsignedApproveDepositBridgeTx: jest.fn().mockResolvedValue({
          unsignedTx: {},
        }),
      };
      (instance.createBridgeInstance as jest.Mock).mockResolvedValue(tokenBridge);

      const gasEstimation = await estimateApprovalGas(
        config,
        readOnlyProviders,
        providerMock,
        ChainId.SEPOLIA,
        ChainId.IMTBL_ZKEVM_TESTNET,
        '0xERC20',
        BigNumber.from(100),
      );

      expect(gasEstimation).toEqual(BigNumber.from(123));
    });

    it('should return zero for estimated gas', async () => {
      const tokenBridge = {
        getUnsignedApproveDepositBridgeTx: jest.fn().mockResolvedValue({
          unsignedTx: null,
        }),
      };
      (instance.createBridgeInstance as jest.Mock).mockResolvedValue(tokenBridge);

      const gasEstimation = await estimateApprovalGas(
        config,
        readOnlyProviders,
        providerMock,
        ChainId.SEPOLIA,
        ChainId.IMTBL_ZKEVM_TESTNET,
        '0xERC20',
        BigNumber.from(100),
      );

      expect(gasEstimation).toEqual(BigNumber.from(0));
    });

    it('should throw error if bridge errors', async () => {
      const tokenBridge = {
        getUnsignedApproveDepositBridgeTx: jest.fn().mockRejectedValue(new Error('error from bridge')),
      };
      (instance.createBridgeInstance as jest.Mock).mockResolvedValue(tokenBridge);

      let data;
      let type;

      try {
        await estimateApprovalGas(
          config,
          readOnlyProviders,
          providerMock,
          ChainId.SEPOLIA,
          ChainId.IMTBL_ZKEVM_TESTNET,
          '0xERC20',
          BigNumber.from(100),
        );
      } catch (err: any) {
        data = err.data;
        type = err.type;
      }

      expect(data).toEqual({ message: 'error from bridge' });
      expect(type).toEqual(CheckoutErrorType.BRIDGE_GAS_ESTIMATE_ERROR);
    });
  });
});
