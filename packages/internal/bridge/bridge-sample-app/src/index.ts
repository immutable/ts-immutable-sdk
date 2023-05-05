import { ImmutableConfiguration, Environment } from '@imtbl/config';
import { ethers } from 'ethers';
import {
  TokenBridge,
  BridgeConfiguration,
  ETH_SEPOLIA_TO_ZKEVM_DEVNET,
  BridgeFeeRequest,
  ApproveBridgeRequest,
  ApproveBridgeResponse,
  BridgeFeeResponse,
  BridgeDepositRequest,
  BridgeDepositResponse,
  WaitForRequest,
  WaitForResponse,
  CompletionStatus,
} from '@imtbl/bridge-sdk';

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
  const bridgeFeeResponse: BridgeFeeResponse = await tokenBridge.getFee(
    bridgeFeeReq
  );

  // Calculate the total deposit amount required to ensure the user gets the amount they expect on L2
  const depositAmount = bridgeFeeResponse.feeAmount.add(depositAmountBeforeFee);
  console.log(`Deposit Amount inclusive of fees is ${depositAmount}`);

  const approveReq: ApproveBridgeRequest = {
    depositorAddress: process.env.DEPOSITOR_ADDRESS,
    token: process.env.TOKEN_ADDRESS,
    depositAmount: depositAmount,
  };

  console.log(`Getting unsigned approve bridge tx`);
  const approveResp: ApproveBridgeResponse =
    await tokenBridge.getUnsignedApproveBridgeTx(approveReq);

  if (approveResp.required) {
    if (!approveResp.unsignedTx) {
      throw new Error('tx is null');
    }
    console.log('Sending Approve Tx');
    const txResponseApprove = await checkout.sendTransaction(
      approveResp.unsignedTx
    );
    const txApprovalReceipt = await txResponseApprove.wait();
    console.log(
      `Approval Tx Completed with hash: ${txApprovalReceipt.transactionHash}`
    );
  } else {
    console.log(`Approval not required`);
  }

  // Get the unsigned deposit transaction
  const depositArgs: BridgeDepositRequest = {
    depositorAddress: process.env.DEPOSITOR_ADDRESS,
    recipientAddress: process.env.RECIPIENT_ADDRESS,
    token: process.env.TOKEN_ADDRESS,
    depositAmount: depositAmount,
  };

  const unsignedDepositResult: BridgeDepositResponse =
    await tokenBridge.getUnsignedDepositTx(depositArgs);
  console.log('Sending Deposit Tx');
  // Sign and Send the signed transaction
  const txResponse = await checkout.sendTransaction(
    unsignedDepositResult.unsignedTx
  );
  console.log('Sent Deposit Transaction...waiting for L1 completion');

  // Wait for the transaction to be included on L1
  const txReceipt = await txResponse.wait();
  console.log(
    'Transaction successful on L1 with hash:',
    txReceipt.transactionHash
  );
  console.log(`MUST BE CONNECTED TO VPN to connect to zkEVM`);
  console.log('Waiting for Deposit to complete on L2...');
  const waitReq: WaitForRequest = {
    transactionHash: txReceipt.transactionHash,
  };
  const bridgeResult: WaitForResponse = await tokenBridge.waitForDeposit(
    waitReq
  );
  if (bridgeResult.status === CompletionStatus.SUCCESS) {
    console.log('Deposit Successful');
  } else {
    // Alert condition. Shouldn't happen
    console.log(
      `Deposit Failed on L2 with status ${bridgeResult.status}`
    );
  }
}

(async () => {
  await deposit().finally(() => process.exit(0));
})();
