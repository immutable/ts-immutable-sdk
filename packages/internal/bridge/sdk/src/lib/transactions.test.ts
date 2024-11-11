import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { Contract, JsonRpcProvider } from 'ethers';
import { BridgeConfiguration } from '../config';
import { ETH_SEPOLIA_TO_ZKEVM_TESTNET, bridgeMethods } from '../constants/bridges';
import { createContract } from '../contracts/createContract';
import { ROOT_ERC20_BRIDGE_FLOW_RATE } from '../contracts/ABIs/RootERC20BridgeFlowRate';
import { CHILD_ERC20_BRIDGE } from '../contracts/ABIs/ChildERC20Bridge';
import { getBridgeTxCalldata } from './transactions';

const sender = '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5';
const recipient = '0x220866B1A2219f40e72f5c628B65D54268cA3A9D';
const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const nativeToken = 'NATIVE';
const voidRootProvider = new JsonRpcProvider('x');
const voidChildProvider = new JsonRpcProvider('x');

const bridgeConfig = new BridgeConfiguration({
  baseConfig: new ImmutableConfiguration({
    environment: Environment.SANDBOX,
  }),
  bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
  rootProvider: voidRootProvider,
  childProvider: voidChildProvider,
});

function encodeFunctionData(contract: Contract, functionName: string, parameters: any[]) {
  return contract.interface.encodeFunctionData(functionName, parameters);
}

describe('transactions', () => {
  describe('getBridgeTxCalldata', () => {
    describe('native token', () => {
      describe('deposit', () => {
        it('should return calldata for depositing native token', async () => {
          const amount = BigInt(100);
          const token = nativeToken;
          const depositMethods = bridgeMethods.deposit;
          const bridgeAddress = bridgeConfig.bridgeContracts.rootERC20BridgeFlowRate;
          const bridgeContract = await createContract(bridgeAddress, ROOT_ERC20_BRIDGE_FLOW_RATE, voidRootProvider);

          // Sender is the recipient (deposit*, not deposit*To)
          const result = await getBridgeTxCalldata(sender, sender, amount, token, depositMethods, bridgeContract);

          const expectedCalldata2 = encodeFunctionData(bridgeContract, depositMethods.native, [amount]);
          expect(result).toEqual(expectedCalldata2);
        });
      });
      describe('depositTo', () => {
        it('should return calldata for depositing native token to recipient', async () => {
          const amount = BigInt(100);
          const token = nativeToken;
          const depositMethods = bridgeMethods.deposit;
          const bridgeAddress = bridgeConfig.bridgeContracts.rootERC20BridgeFlowRate;
          const bridgeContract = await createContract(bridgeAddress, ROOT_ERC20_BRIDGE_FLOW_RATE, voidRootProvider);

          // Sender is not the recipient (deposit*To, not deposit*)
          const result = await getBridgeTxCalldata(sender, recipient, amount, token, depositMethods, bridgeContract);

          const expectedCalldata = encodeFunctionData(
            bridgeContract,
            depositMethods.nativeTo,
            [recipient, amount],
          );
          expect(result).toEqual(expectedCalldata);
        });
      });
      describe('withdraw', () => {
        it('should return calldata for withdrawing native token', async () => {
          const amount = BigInt(100);
          const token = nativeToken;
          const withdrawMethods = bridgeMethods.withdraw;
          const bridgeAddress = bridgeConfig.bridgeContracts.childERC20Bridge;
          const bridgeContract = await createContract(bridgeAddress, CHILD_ERC20_BRIDGE, voidChildProvider);

          // Sender is the recipient (withdraw*, not withdraw*To)
          const result = await getBridgeTxCalldata(sender, sender, amount, token, withdrawMethods, bridgeContract);

          const expectedCalldata = encodeFunctionData(bridgeContract, withdrawMethods.native, [amount]);
          expect(result).toEqual(expectedCalldata);
        });
      });
      describe('withdrawTo', () => {
        it('should return calldata for withdrawing native token to recipient', async () => {
          const amount = BigInt(100);
          const token = nativeToken;
          const withdrawMethods = bridgeMethods.withdraw;
          const bridgeAddress = bridgeConfig.bridgeContracts.childERC20Bridge;
          const bridgeContract = await createContract(bridgeAddress, CHILD_ERC20_BRIDGE, voidChildProvider);

          // Sender is not the recipient (withdraw*To, not withdraw*)
          const result = await getBridgeTxCalldata(sender, recipient, amount, token, withdrawMethods, bridgeContract);

          const expectedCalldata = encodeFunctionData(
            bridgeContract,
            withdrawMethods.nativeTo,
            [recipient, amount],
          );
          expect(result).toEqual(expectedCalldata);
        });
      });
    });
    describe('ERC20', () => {
      describe('deposit', () => {
        it('should return calldata for depositing ERC20 token', async () => {
          const amount = BigInt(100);
          const depositMethods = bridgeMethods.deposit;
          const bridgeAddress = bridgeConfig.bridgeContracts.rootERC20BridgeFlowRate;
          const bridgeContract = await createContract(bridgeAddress, ROOT_ERC20_BRIDGE_FLOW_RATE, voidRootProvider);

          // Sender is the recipient (deposit*, not deposit*To)
          const result = await getBridgeTxCalldata(sender, sender, amount, usdc, depositMethods, bridgeContract);

          const expectedCalldata = encodeFunctionData(bridgeContract, depositMethods.token, [usdc, amount]);
          expect(result).toEqual(expectedCalldata);
        });
      });
      describe('depositTo', () => {
        it('should return calldata for depositing ERC20 token to recipient', async () => {
          const amount = BigInt(100);
          const depositMethods = bridgeMethods.deposit;
          const bridgeAddress = bridgeConfig.bridgeContracts.rootERC20BridgeFlowRate;
          const bridgeContract = await createContract(bridgeAddress, ROOT_ERC20_BRIDGE_FLOW_RATE, voidRootProvider);

          // Sender is not the recipient (deposit*To, not deposit*)
          const result = await getBridgeTxCalldata(sender, recipient, amount, usdc, depositMethods, bridgeContract);

          const expectedCalldata = encodeFunctionData(
            bridgeContract,
            depositMethods.tokenTo,
            [usdc, recipient, amount],
          );
          expect(result).toEqual(expectedCalldata);
        });
      });
      describe('withdraw', () => {
        it('should return calldata for withdrawing ERC20 token', async () => {
          const amount = BigInt(100);
          const withdrawMethods = bridgeMethods.withdraw;
          const bridgeAddress = bridgeConfig.bridgeContracts.childERC20Bridge;
          const bridgeContract = await createContract(bridgeAddress, CHILD_ERC20_BRIDGE, voidChildProvider);

          // Sender is the recipient (withdraw*, not withdraw*To)
          const result = await getBridgeTxCalldata(sender, sender, amount, usdc, withdrawMethods, bridgeContract);

          const expectedCalldata = encodeFunctionData(bridgeContract, withdrawMethods.token, [usdc, amount]);
          expect(result).toEqual(expectedCalldata);
        });
      });
      describe('withdrawTo', () => {
        it('should return calldata for withdrawing ERC20 token to recipient', async () => {
          const amount = BigInt(100);
          const withdrawMethods = bridgeMethods.withdraw;
          const bridgeAddress = bridgeConfig.bridgeContracts.childERC20Bridge;
          const bridgeContract = await createContract(bridgeAddress, CHILD_ERC20_BRIDGE, voidChildProvider);

          // Sender is not the recipient (withdraw*To, not withdraw*)
          const result = await getBridgeTxCalldata(sender, recipient, amount, usdc, withdrawMethods, bridgeContract);

          const expectedCalldata = encodeFunctionData(
            bridgeContract,
            withdrawMethods.tokenTo,
            [usdc, recipient, amount],
          );
          expect(result).toEqual(expectedCalldata);
        });
      });
    });
  });
});
