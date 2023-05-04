import { ImmutableConfiguration, Environment } from '@imtbl/config';
import { ethers, utils } from 'ethers';
import {
  TokenBridge,
  BridgeConfiguration,
  ETH_SEPOLIA_TO_ZKEVM_DEVNET,
  BridgeFeeRequest,
} from '../../sdk/dist/index';

async function deposit() {
  if (!process.env.ROOT_PROVIDER) {
    console.log(process.env.ROOT_PROVIDER);
    throw new Error('ROOT_PROVIDER not set');
  }
  if (!process.env.CHILD_PROVIDER) {
    throw new Error('CHILD_PROVIDER not set');
  }
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not set');
  }
  if (!process.env.DEPOSITOR_ADDRESS) {
    throw new Error('DEPOSITOR_ADDRESS not set');
  }
  if (!process.env.RECIPIENT_ADDRESS) {
    throw new Error('RECIPIENT_ADDRESS not set');
  }
  if (!process.env.TOKEN_ADDRESS) {
    throw new Error('TOKEN_ADDRESS not set');
  }
  if (!process.env.DEPOSIT_AMOUNT) {
    throw new Error('DEPOSIT_AMOUNT not set');
  }

  const depositAmountBeforeFee = ethers.utils.parseUnits(
    process.env.DEPOSIT_AMOUNT,
    18
  );

  const rootChainProvider = new ethers.providers.JsonRpcProvider(
    process.env.ROOT_PROVIDER
  );
  const childChainProvider = new ethers.providers.JsonRpcProvider(
    process.env.CHILD_PROVIDER
  );

  // Create a fake checkout instance
  const checkout = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    rootChainProvider
  );

  const bridgeConfig = new BridgeConfiguration({
    baseConfig: new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    }),
    bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_DEVNET,
    rootProvider: rootChainProvider,
    childProvider: childChainProvider,
  });

  // Create a token bridge
  const tokenBridge = new TokenBridge(bridgeConfig);

  // Get the bridge fee
  const bridgeFeeReq: BridgeFeeRequest = { token: process.env.TOKEN_ADDRESS };
  const bridgeFeeResponse = await tokenBridge.getFee(bridgeFeeReq);

  // Calculate the total deposit amount required to ensure the user gets the amount they expect on L2
  const depositAmount = bridgeFeeResponse.feeAmount.add(
    process.env.DEPOSITOR_ADDRESS
  );
  console.log(`Deposit Amount inclusive of fees is ${depositAmount}`);
}

(async () => {
  await deposit();
})();
