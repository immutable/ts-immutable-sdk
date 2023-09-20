import { BigNumber, ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import * as instance from '../../../instance';
import { CheckoutConfiguration } from '../../../config';
import { ChainId } from '../../../types';
import { estimateApprovalGas, estimateGasForBridgeApproval } from './estimateApprovalGas';
import { CheckoutErrorType } from '../../../errors';
import { INDEXER_ETH_ROOT_CONTRACT_ADDRESS } from './constants';

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
      estimateGas: jest.fn().mockResolvedValue(BigNumber.from(123)),
    } as unknown as Web3Provider;
  });

  describe('estimateGasForBridgeApproval', () => {
    it('should estimate gas for bridge approval for ERC20 token', async () => {
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
        '0xADDRESS',
        '0xERC20',
        BigNumber.from(5),
      );

      expect(gasEstimation).toEqual(BigNumber.from(123));
      expect(tokenBridge.getUnsignedApproveDepositBridgeTx).toBeCalledWith({
        depositorAddress: '0xADDRESS',
        token: '0xERC20',
        depositAmount: BigNumber.from(5),
      });
    });

    it('should return zero for bridge approval if NATIVE token', async () => {
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
        '0xADDRESS',
        INDEXER_ETH_ROOT_CONTRACT_ADDRESS,
        BigNumber.from(5),
      );

      expect(gasEstimation).toEqual(BigNumber.from(0));
      expect(tokenBridge.getUnsignedApproveDepositBridgeTx).not.toHaveBeenCalled();
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
        '0xADDRESS',
        ChainId.SEPOLIA,
        ChainId.IMTBL_ZKEVM_TESTNET,
        '0xERC20',
        BigNumber.from(100),
      );

      expect(gasEstimation).toEqual(BigNumber.from(123));
    });

    it('should return zero for estimated gas if unsigned approval is null', async () => {
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
        '0xADDRESS',
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
          '0xADDRESS',
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
