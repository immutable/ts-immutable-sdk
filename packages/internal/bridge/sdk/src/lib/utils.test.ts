import {
  ETH_MAINNET_TO_ZKEVM_MAINNET, ETH_SEPOLIA_CHAIN_ID, ETH_SEPOLIA_TO_ZKEVM_TESTNET, childWIMXs, rootIMXs,
} from '../constants/bridges';
import {
  BridgeDirection,
  BridgeFeeActions, BridgeInstance, FungibleToken, WithdrawERC20FeeRequest,
} from '../types';
import {
  exportedForTesting, isValidDeposit, isValidWithdraw, isWithdrawNativeIMX, isWithdrawWrappedIMX,
} from './utils';

describe('utils', () => {
  describe('getAddresses', () => {
    it('should return mainnet address', () => {
      const source = ETH_MAINNET_TO_ZKEVM_MAINNET.rootChainID;
      const addresses = { mainnet: 'mainnet', testnet: 'testnet', devnet: 'devnet' };
      const result = exportedForTesting.getAddresses(source, addresses);
      expect(result).toEqual('mainnet');
    });

    it('should return testnet address', () => {
      const source = ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID;
      const addresses = { mainnet: 'mainnet', testnet: 'testnet', devnet: 'devnet' };
      const result = exportedForTesting.getAddresses(source, addresses);
      expect(result).toEqual('testnet');
    });

    it('should return devnet address in all other cases', () => {
      const source = 'devnet';
      const addresses = { mainnet: 'mainnet', testnet: 'testnet', devnet: 'devnet' };
      const result = exportedForTesting.getAddresses(source, addresses);
      expect(result).toEqual('devnet');
    });
  });

  describe('isWithdrawNativeIMX', () => {
    it('should return false for native IMX but not withdraw', () => {
      const token: FungibleToken = rootIMXs.mainnet;
      const bridgeInstance: BridgeInstance = {
        rootChainID: '123',
        childChainID: ETH_SEPOLIA_CHAIN_ID,
      };

      const direction: BridgeDirection = {
        sourceChainId: bridgeInstance.childChainID,
        destinationChainId: bridgeInstance.rootChainID,
        action: BridgeFeeActions.DEPOSIT,
      };

      const result = isWithdrawNativeIMX(token, direction, bridgeInstance);
      expect(result).toEqual(false);
    });

    it('should return false for wrapped IMX', () => {
      const token: FungibleToken = childWIMXs.testnet;
      const bridgeInstance: BridgeInstance = {
        rootChainID: '123',
        childChainID: ETH_SEPOLIA_CHAIN_ID,
      };

      const direction: BridgeDirection = {
        sourceChainId: bridgeInstance.childChainID,
        destinationChainId: bridgeInstance.rootChainID,
        action: BridgeFeeActions.WITHDRAW,
      };

      const result = isWithdrawNativeIMX(token, direction, bridgeInstance);
      expect(result).toEqual(false);
    });

    it('should return true for not wrapped IMX', () => {
      const token: FungibleToken = rootIMXs.mainnet; // Anything that isn't a child chain WIMX.
      const bridgeInstance: BridgeInstance = {
        rootChainID: '123',
        childChainID: ETH_SEPOLIA_CHAIN_ID,
      };

      const direction: BridgeDirection = {
        sourceChainId: bridgeInstance.childChainID,
        destinationChainId: bridgeInstance.rootChainID,
        action: BridgeFeeActions.WITHDRAW,
      };

      const result = isWithdrawNativeIMX(token, direction, bridgeInstance);
      expect(result).toEqual(true);
    });
  });

  describe('isWithdrawWrappedIMX', () => {
    it('should return true for wrapped IMX', () => {
      const token: FungibleToken = childWIMXs.testnet;
      const bridgeInstance: BridgeInstance = {
        rootChainID: '123',
        childChainID: ETH_SEPOLIA_CHAIN_ID,
      };

      const request: WithdrawERC20FeeRequest = {
        action: BridgeFeeActions.WITHDRAW,
        sourceChainId: bridgeInstance.childChainID,
        destinationChainId: bridgeInstance.rootChainID,
        gasMultiplier: 1,
        amount: BigInt('10000'),
        token,
      };

      const result = isWithdrawWrappedIMX(token, request, bridgeInstance);
      expect(result).toEqual(true);
    });

    it('should return false for not wrapped IMX', () => {
      const token: FungibleToken = rootIMXs.mainnet; // Anything that isn't a child chain WIMX.
      const bridgeInstance: BridgeInstance = {
        rootChainID: '123',
        childChainID: ETH_SEPOLIA_CHAIN_ID,
      };

      const request: WithdrawERC20FeeRequest = {
        action: BridgeFeeActions.WITHDRAW,
        sourceChainId: bridgeInstance.childChainID,
        destinationChainId: bridgeInstance.rootChainID,
        gasMultiplier: 1,
        amount: BigInt('10000'),
        token,
      };

      const result = isWithdrawWrappedIMX(token, request, bridgeInstance);
      expect(result).toEqual(false);
    });
  });

  describe('isValidDeposit', () => {
    it('should return true for valid deposit', () => {
      const sourceChainId = '123';
      const destinationChainId = '456';
      const bridgeInstance: BridgeInstance = {
        rootChainID: sourceChainId,
        childChainID: destinationChainId,
      };
      const direction: BridgeDirection = {
        sourceChainId,
        destinationChainId,
        action: BridgeFeeActions.DEPOSIT,
      };

      expect(isValidDeposit(direction, bridgeInstance)).toEqual(true);
    });

    it('should return false for invalid root chain', () => {
      const sourceChainId = '123';
      const destinationChainId = '456';
      const bridgeInstance: BridgeInstance = {
        rootChainID: '45123123',
        childChainID: destinationChainId,
      };
      const direction: BridgeDirection = {
        sourceChainId,
        destinationChainId,
        action: BridgeFeeActions.DEPOSIT,
      };
      expect(isValidDeposit(direction, bridgeInstance)).toEqual(false);
    });

    it('should return false for invalid child chain', () => {
      const sourceChainId = '123';
      const destinationChainId = '456';
      const bridgeInstance: BridgeInstance = {
        rootChainID: sourceChainId,
        childChainID: '12312313',
      };

      const direction: BridgeDirection = {
        sourceChainId,
        destinationChainId,
        action: BridgeFeeActions.DEPOSIT,
      };
      expect(isValidDeposit(direction, bridgeInstance)).toEqual(false);
    });

    it('should return false for invalid action', () => {
      const sourceChainId = '123';
      const destinationChainId = '456';
      const bridgeInstance: BridgeInstance = {
        rootChainID: sourceChainId,
        childChainID: destinationChainId,
      };

      const direction: BridgeDirection = {
        sourceChainId,
        destinationChainId,
        action: BridgeFeeActions.WITHDRAW,
      };
      expect(isValidDeposit(direction, bridgeInstance)).toEqual(false);
    });
  });

  describe('isValidWithdraw', () => {
    it('should return true for valid withdraw', () => {
      const sourceChainId = '123';
      const destinationChainId = '456';
      const bridgeInstance: BridgeInstance = {
        rootChainID: destinationChainId,
        childChainID: sourceChainId,
      };
      const direction: BridgeDirection = {
        sourceChainId,
        destinationChainId,
        action: BridgeFeeActions.WITHDRAW,
      };

      expect(isValidWithdraw(direction, bridgeInstance)).toEqual(true);
    });

    it('should return false for invalid root chain', () => {
      const sourceChainId = '123';
      const destinationChainId = '456';
      const bridgeInstance: BridgeInstance = {
        rootChainID: '45123123',
        childChainID: sourceChainId,
      };

      const direction: BridgeDirection = {
        sourceChainId,
        destinationChainId,
        action: BridgeFeeActions.WITHDRAW,
      };

      expect(isValidDeposit(direction, bridgeInstance)).toEqual(false);
    });

    it('should return false for invalid child chain', () => {
      const sourceChainId = '123';
      const destinationChainId = '456';
      const bridgeInstance: BridgeInstance = {
        rootChainID: destinationChainId,
        childChainID: '12312313',
      };

      const direction: BridgeDirection = {
        sourceChainId,
        destinationChainId,
        action: BridgeFeeActions.WITHDRAW,
      };

      expect(isValidDeposit(direction, bridgeInstance)).toEqual(false);
    });

    it('should return false for invalid action', () => {
      const sourceChainId = '123';
      const destinationChainId = '456';
      const bridgeInstance: BridgeInstance = {
        rootChainID: destinationChainId,
        childChainID: sourceChainId,
      };

      const direction: BridgeDirection = {
        sourceChainId,
        destinationChainId,
        action: BridgeFeeActions.DEPOSIT,
      };

      expect(isValidDeposit(direction, bridgeInstance)).toEqual(false);
    });
  });
});
