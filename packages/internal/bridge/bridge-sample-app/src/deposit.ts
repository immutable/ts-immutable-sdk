/* eslint-disable no-console */
import 'dotenv/config';
import { ethers } from "ethers";
import util from 'util';
import { ImmutableConfiguration, Environment } from '@imtbl/config';
import { 
    TokenBridge, 
    BridgeConfiguration, 
    ETH_SEPOLIA_TO_ZKEVM_TESTNET,
    ApproveBridgeRequest,
    ApproveBridgeResponse,
    ETH_SEPOLIA_CHAIN_ID,
    ZKEVM_TESTNET_CHAIN_ID,
    BridgeTxRequest,
    BridgeTxResponse,
    TxStatusResponse,
    TxStatusRequest,
} from '@imtbl/bridge-sdk';

// @ts-ignore
import { setupForBridge } from './lib/utils.ts';
import { delay, getContract, waitForReceipt } from './lib/helpers.js';

async function deposit() {

  const params = await setupForBridge();

  const bridgeConfig = new BridgeConfiguration({
    baseConfig: new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    }),
    bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
    rootProvider: params.rootProvider,
    childProvider: params.childProvider,
  });

  const tokenBridge = new TokenBridge(bridgeConfig);

  const rootBridge: ethers.Contract = getContract("RootERC20BridgeFlowRate", params.rootBridgeAddress, params.rootProvider);
  const childBridge: ethers.Contract = getContract("ChildERC20Bridge", params.childBridgeAddress, params.childProvider);

  let rootBridgeChildAddress = await rootBridge.rootTokenToChildToken(params.sepoliaToken);
  let childBridgeChildAddress = await childBridge.rootTokenToChildToken(params.sepoliaToken);

  if (rootBridgeChildAddress === ethers.constants.AddressZero
    || childBridgeChildAddress === ethers.constants.AddressZero) {
    console.log('token not mapped, please map token before depositing');
    return;
  }

  if (childBridgeChildAddress === ethers.constants.AddressZero) {
    console.log('token mappinng incomplete, please wait for token to map to childBridge before depositing');
    return;
  }

  const approvalReq: ApproveBridgeRequest = {
    senderAddress: params.depositor,
    token: params.sepoliaToken,
    amount: params.amount,
    sourceChainId: ETH_SEPOLIA_CHAIN_ID,
    destinationChainId: ZKEVM_TESTNET_CHAIN_ID,
  }

  console.log('approvalReq', approvalReq);

  let approvalRes: ApproveBridgeResponse;
  try {
    approvalRes = await tokenBridge.getUnsignedApproveBridgeTx(approvalReq);
    console.log('approvalRes', approvalRes);
  } catch(err) {
    console.log('approvalErr', err);
  }

  if (approvalRes!.unsignedTx) {
    const approvalNonce = await params.rootWallet.getTransactionCount();
    const approvalGasPrice = await params.rootProvider.getGasPrice();

    console.log('approvalNonce', approvalNonce);
    console.log('approvalGasPrice', approvalGasPrice);

    approvalRes!.unsignedTx.gasLimit = 1000000;
    approvalRes!.unsignedTx.nonce = approvalNonce;
    approvalRes!.unsignedTx.gasPrice = approvalGasPrice.mul(2);

    console.log('approvalRes.unsignedTx');
    console.log(approvalRes!.unsignedTx);

    console.log('signing approval');
    const approvalTxSig = await params.rootWallet.signTransaction(approvalRes!.unsignedTx);
    console.log('approvalTxSig', approvalTxSig);

    const sendApprovalRes = await params.rootWallet.provider.sendTransaction(approvalTxSig);
    console.log('sendApprovalRes', sendApprovalRes);

    await waitForReceipt(sendApprovalRes.hash, params.rootProvider);
  } else {
    console.log('no approval required');
  }

  const depositReq: BridgeTxRequest = {
    senderAddress: params.depositor,
    recipientAddress: params.recipient,
    token: params.sepoliaToken,
    amount: params.amount,
    sourceChainId: ETH_SEPOLIA_CHAIN_ID,
    destinationChainId: ZKEVM_TESTNET_CHAIN_ID,
    gasMultiplier: 1.1,
  }

  console.log('depositReq', depositReq)
  let depositRes: BridgeTxResponse;
  try {
    depositRes = await tokenBridge.getUnsignedBridgeTx(depositReq);
    console.log('depositRes', depositRes);
  } catch(err) {
    console.log('depositErr', err);
  }

  if (!depositRes!.unsignedTx) {
    console.log('unable to generate deposit tx');
    return
  }

  const depositNonce = await params.rootWallet.getTransactionCount();
  const depositGasPrice = await params.rootProvider.getGasPrice();

  depositRes!.unsignedTx.gasLimit = 1000000;
  depositRes!.unsignedTx.nonce = depositNonce;
  depositRes!.unsignedTx.gasPrice = depositGasPrice.mul(2);

  depositRes!.unsignedTx.value = ethers.BigNumber.from(depositRes!.unsignedTx.value);

  console.log('depositRes.unsignedTx');
  console.log(depositRes!.unsignedTx);

  console.log('signing deposit');
  const depositTxSig = await params.rootWallet.signTransaction(depositRes!.unsignedTx);
  console.log('depositTxSig', depositTxSig);

  const sendDepositRes = await params.rootWallet.provider.sendTransaction(depositTxSig);
  console.log('sendDepositRes', sendDepositRes);

  await waitForReceipt(sendDepositRes.hash, params.rootProvider);
  
  console.log('Deposit submitted txHash:',sendDepositRes.hash);

  const txStatusReq:TxStatusRequest = {
    sourceChainId: ETH_SEPOLIA_CHAIN_ID,
    transactions: [{
      txHash: sendDepositRes.hash
    }]
  }

  for(let i=0; i<100; i++) {
    const txStatusRes: TxStatusResponse = await tokenBridge.getTransactionStatus(txStatusReq);
    console.log('txStatusRes attempt ', i+1);
    console.log(util.inspect(txStatusRes, {showHidden: false, depth: null, colors: true}))

    await delay(10000);
  }
  
}

(async () => {
    try {
        await deposit()
        console.log('Exiting successfully');
    } catch(err) {
        console.log('Exiting with error', err)
    }
})();