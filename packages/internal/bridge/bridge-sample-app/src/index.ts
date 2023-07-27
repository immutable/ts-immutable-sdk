/* eslint-disable no-console */
import { ImmutableConfiguration, Environment } from '@imtbl/config';
import { ethers } from 'ethers';
import {
  TokenBridge,
  BridgeConfiguration,
  BridgeFeeRequest,
  ApproveBridgeRequest,
  ApproveBridgeResponse,
  BridgeFeeResponse,
  BridgeDepositRequest,
  BridgeDepositResponse,
  WaitForDepositRequest,
  WaitForDepositResponse,
  CompletionStatus,
  BridgeWithdrawRequest,
  ETH_SEPOLIA_TO_ZKEVM_TESTNET,
  CHILD_CHAIN_NATIVE_TOKEN_ADDRESS,
  WaitForWithdrawalRequest,
  WaitForWithdrawalResponse,
  ExitRequest,
} from '@imtbl/bridge-sdk';

/**
 * Deposit function to handle the deposit process from L1 to L2.
 * It uses environment variables for configuration values.
 * It creates a token bridge instance, gets the bridge fee, calculates the deposit amount,
 * approves the deposit, and waits for the deposit to complete on L2.
 */
async function deposit() {
  // Check and throw errors if required environment variables are not set
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
  // Parse deposit amount from environment variable
  const depositAmountBeforeFee = ethers.utils.parseUnits(
    process.env.DEPOSIT_AMOUNT,
    18,
  );

  // Create providers for root and child chains
  const rootChainProvider = new ethers.providers.JsonRpcProvider(
    process.env.ROOT_PROVIDER,
  );
  const childChainProvider = new ethers.providers.JsonRpcProvider(
    process.env.CHILD_PROVIDER,
  );

  // Create a wallet instance to simulate the user's wallet
  const checkout = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    rootChainProvider,
  );

  // Create a wallet instance to simulate the user's wallet
  const checkoutChildChain = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    childChainProvider,
  );

  // Create a bridge configuration instance
  const bridgeConfig = new BridgeConfiguration({
    baseConfig: new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    }),
    bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
    rootProvider: rootChainProvider,
    childProvider: childChainProvider,
  });

  // Create a token bridge instance using the bridge configuration
  const tokenBridge = new TokenBridge(bridgeConfig);

  // Get the bridge fee and calculate the total deposit amount
  const bridgeFeeReq: BridgeFeeRequest = { token: process.env.TOKEN_ADDRESS };
  const bridgeFeeResponse: BridgeFeeResponse = await tokenBridge.getFee(
    bridgeFeeReq,
  );

  // Calculate the total deposit amount required to ensure the user gets the amount they expect on L2
  const depositAmount = bridgeFeeResponse.feeAmount.add(depositAmountBeforeFee);
  console.log(`Deposit Amount inclusive of fees is ${depositAmount}`);

  const approveReq: ApproveBridgeRequest = {
    depositorAddress: process.env.DEPOSITOR_ADDRESS,
    token: process.env.TOKEN_ADDRESS,
    depositAmount,
  };

  // Get the unsigned approval transaction for the deposit
  const approveResp: ApproveBridgeResponse = await tokenBridge.getUnsignedApproveBridgeTx(approveReq);

  // If approval is required, sign and send the approval transaction
  if (approveResp.required) {
    if (!approveResp.unsignedTx) {
      throw new Error('tx is null');
    }
    console.log('Sending Approve Tx');
    const txResponseApprove = await checkout.sendTransaction(
      approveResp.unsignedTx,
    );
    const txApprovalReceipt = await txResponseApprove.wait();
    console.log(
      `Approval Tx Completed with hash: ${txApprovalReceipt.transactionHash}`,
    );
  } else {
    console.log('Approval not required');
  }

  // Get the unsigned deposit transaction and send it on L1
  const depositArgs: BridgeDepositRequest = {
    depositorAddress: process.env.DEPOSITOR_ADDRESS,
    recipientAddress: process.env.RECIPIENT_ADDRESS,
    token: process.env.TOKEN_ADDRESS,
    depositAmount,
  };

  const unsignedDepositResult: BridgeDepositResponse = await tokenBridge.getUnsignedDepositTx(depositArgs);
  console.log('Sending Deposit Tx');
  // Sign and Send the signed transaction


  const txResponse = await checkout.sendTransaction(
    unsignedDepositResult.unsignedTx,
  );
  console.log('Sent Deposit Transaction...waiting for L1 completion');

  // Wait for the deposit transaction to be included on L1
  const txReceipt = await txResponse.wait();
  console.log(
    'Transaction successful on L1 with hash:',
    txReceipt.transactionHash,
  );
  console.log('MUST BE CONNECTED TO VPN to connect to zkEVM');
  console.log('Waiting for Deposit to complete on L2...');
  // Wait for the deposit to complete on L2
  const waitReq: WaitForDepositRequest = {
    transactionHash: txReceipt.transactionHash,
  };
  const bridgeResult: WaitForDepositResponse = await tokenBridge.waitForDeposit(
    waitReq,
  );
  if (bridgeResult.status === CompletionStatus.SUCCESS) {
    console.log('Deposit Successful');
  } else {
    // Alert condition. Shouldn't happen
    console.log(
      `Deposit Failed on L2 with status ${bridgeResult.status}`,
    );
    return;
  }

  console.log(`Starting WITHDRAWAL`);
  console.log(`Approving Bridge`);
  // Approval
  const childApproveReq: ApproveBridgeRequest = {
    depositorAddress: process.env.DEPOSITOR_ADDRESS,
    token: "0x0000000000000000000000000000000000001010",
    depositAmount,
  };

  // Get the unsigned approval transaction for the deposit
  const childApproveResp: ApproveBridgeResponse = await tokenBridge.getUnsignedApproveChildBridgeTx(childApproveReq);

  // If approval is required, sign and send the approval transaction
  if (childApproveResp.required) {
    if (!childApproveResp.unsignedTx) {
      throw new Error('tx is null');
    }
    console.log('Sending Approve Tx');
    // childApproveResp.unsignedTx.gasLimit = ethers.utils.hexlify(500000); 
    const txResponseApprove = await checkoutChildChain.sendTransaction(
      childApproveResp.unsignedTx,
    );
    const txApprovalReceipt = await txResponseApprove.wait();
    console.log(
      `Approval Tx Completed with hash: ${txApprovalReceipt.transactionHash}`,
    );
  } else {
    console.log('Approval not required');
  }
  //

  const withdrawlReq: BridgeWithdrawRequest = {
    recipientAddress: process.env.DEPOSITOR_ADDRESS,
    token: CHILD_CHAIN_NATIVE_TOKEN_ADDRESS,
    withdrawAmount: depositAmount
  };
  
  const unsignedWithdrawReq = await tokenBridge.getUnsignedWithdrawTx(withdrawlReq);
  // const tx = { ...unsignedWithdrawReq.unsignedTx, gasLimit: ethers.utils.hexlify(500000)} 
  console.log("Sending withdraw tx");
  const txWithdraw = await checkoutChildChain.sendTransaction(unsignedWithdrawReq.unsignedTx);
  const txWithdrawReceipt = await txWithdraw.wait(1);
  console.log(`Withdrawal tx hash: ${txWithdrawReceipt.transactionHash}`)

  // TODO: Given a tx hash, wait till next epoch
  const withdrawalRequest: WaitForWithdrawalRequest = {
    transactionHash: txWithdrawReceipt.transactionHash,
  }
  const waitForWithdrawalResp: WaitForWithdrawalResponse = await tokenBridge.waitForWithdrawal(withdrawalRequest);
  console.log(waitForWithdrawalResp)

  // TODO: Exit on Layer 1
  console.log(`Exiting on Layer 1`)
  const exitRequest: ExitRequest = {
    transactionHash: txWithdrawReceipt.transactionHash,
  }
  const exitTxResponse = await tokenBridge.getUnsignedExitTx(exitRequest);

  const exitTx = await checkout.sendTransaction(exitTxResponse.unsignedTx);
  console.log(exitTx)
  const exitTxReceipt = await exitTx.wait(1);
  console.log(exitTxReceipt);
}

async function test() {
    // Check and throw errors if required environment variables are not set
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
    // Parse deposit amount from environment variable
    const depositAmountBeforeFee = ethers.utils.parseUnits(
      process.env.DEPOSIT_AMOUNT,
      18,
    );
  
    // Create providers for root and child chains
    const rootChainProvider = new ethers.providers.JsonRpcProvider(
      process.env.ROOT_PROVIDER,
    );
    const childChainProvider = new ethers.providers.JsonRpcProvider(
      process.env.CHILD_PROVIDER,
    );
  
    // Create a wallet instance to simulate the user's wallet
    const checkout = new ethers.Wallet(
      process.env.PRIVATE_KEY,
      rootChainProvider,
    );
  
    // Create a wallet instance to simulate the user's wallet
    const checkoutChildChain = new ethers.Wallet(
      process.env.PRIVATE_KEY,
      childChainProvider,
    );
  
    // Create a bridge configuration instance
    const bridgeConfig = new BridgeConfiguration({
      baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }),
      bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
      rootProvider: rootChainProvider,
      childProvider: childChainProvider,
    });
  
    // Create a token bridge instance using the bridge configuration
    const tokenBridge = new TokenBridge(bridgeConfig);
    
    const withdrawalRequest: WaitForWithdrawalRequest = {
      transactionHash: "0xf2a7bffa534719bf0b127d121fcb54d13a1f2d7bb9f5958e1a7866ab9a7b1993",
    }
    const waitForWithdrawalResp: WaitForWithdrawalResponse = await tokenBridge.waitForWithdrawal(withdrawalRequest);
    console.log(waitForWithdrawalResp)

    const exitRequest: ExitRequest = {
      transactionHash: "0xf2a7bffa534719bf0b127d121fcb54d13a1f2d7bb9f5958e1a7866ab9a7b1993",
    }
    const exitTx = await tokenBridge.getUnsignedExitTx(exitRequest);

    const txWithdraw = await checkout.sendTransaction(exitTx.unsignedTx);
    console.log(txWithdraw)
    const txWithdrawReceipt = await txWithdraw.wait(1);
    console.log(txWithdrawReceipt);
}

// Run the deposit function and exit the process when completed
(async () => {
  await deposit().then(() => {console.log(`Exiting Successfully`); process.exit(0)}).catch(e => {console.log(`Exiting with error: ${e.toString()}`); process.exit(1)});
})();
