/* eslint-disable no-console */
import 'dotenv/config';
import { ethers } from "ethers";
import util from 'util';
import { ImmutableConfiguration, Environment } from '@imtbl/config';
import { 
    TokenBridge, 
    BridgeConfiguration, 
    ApproveBridgeRequest,
    ApproveBridgeResponse,
    BridgeTxRequest,
    BridgeTxResponse,
    TxStatusResponse,
    TxStatusRequest,
    StatusResponse,
    bridgeGasPerAction,
    bridgeMethodsGasPerToken,
} from '@imtbl/bridge-sdk';

// @ts-ignore
import { setupForBridge } from './lib/utils.ts';
import { delay, getContract, waitForReceipt } from './lib/helpers.js';

async function deposit() {

  const params = await setupForBridge();

  const bridgeConfig = new BridgeConfiguration({
    baseConfig: new ImmutableConfiguration({
      environment: params.environment,
    }),
    bridgeInstance: params.bridgeInstance,
    rootProvider: params.rootProvider,
    childProvider: params.childProvider,
  });

  const tokenBridge = new TokenBridge(bridgeConfig);

  const rootBridge: ethers.Contract = getContract("RootERC20BridgeFlowRate", params.rootBridgeAddress, params.rootProvider);
  const childBridge: ethers.Contract = getContract("ChildERC20Bridge", params.childBridgeAddress, params.childProvider);

  if (params.childToken.toUpperCase() !== 'NATIVE' && params.rootToken.toUpperCase() !== 'NATIVE') {
    let rootBridgeChildAddress = await rootBridge.rootTokenToChildToken(params.rootToken);
    let childBridgeChildAddress = await childBridge.rootTokenToChildToken(params.rootToken);
    
    if (rootBridgeChildAddress === ethers.constants.AddressZero) {
      throw new Error('token not mapped, please map token before depositing');
    }
  
    if (childBridgeChildAddress === ethers.constants.AddressZero) {
      throw new Error('token mapping incomplete, please wait for token to map to childBridge before depositing');
    }
  
    if (rootBridgeChildAddress !== childBridgeChildAddress) {
      throw new Error(`token mappings mismatch on rootBridge (${rootBridgeChildAddress}) & childBridge (${childBridgeChildAddress}).`, );
    }
  }

  const approvalReq: ApproveBridgeRequest = {
    senderAddress: params.sender,
    token: params.rootToken,
    amount: params.amount,
    sourceChainId: bridgeConfig.bridgeInstance.rootChainID,
    destinationChainId: bridgeConfig.bridgeInstance.childChainID,
  }

  console.log('approvalReq', approvalReq);

  let approvalRes: ApproveBridgeResponse;
  try {
    approvalRes = await tokenBridge.getUnsignedApproveBridgeTx(approvalReq);
    console.log('approvalRes', approvalRes);
  } catch(err) {
    console.error('approvalErr', err);
    return
  }

  if (approvalRes!.unsignedTx) {
    const approvalNonce = await params.rootWallet.getTransactionCount();
    const approvalGasPrice = await params.rootProvider.getGasPrice();

    console.log('approvalNonce', approvalNonce);
    console.log('approvalGasPrice', approvalGasPrice);

    approvalRes!.unsignedTx.gasLimit = bridgeGasPerAction.approveToken*3;
    approvalRes!.unsignedTx.nonce = approvalNonce;
    approvalRes!.unsignedTx.gasPrice = approvalGasPrice.mul(3);

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
    senderAddress: params.sender,
    recipientAddress: params.recipient,
    token: params.rootToken,
    amount: params.amount,
    sourceChainId: bridgeConfig.bridgeInstance.rootChainID,
    destinationChainId: bridgeConfig.bridgeInstance.childChainID,
    gasMultiplier: params.gasMultiplier,
  }

  console.log('depositReq', depositReq)
  let depositRes: BridgeTxResponse;
  try {
    depositRes = await tokenBridge.getUnsignedBridgeTx(depositReq);
    console.log('depositRes', depositRes);
  } catch(err) {
    console.error('depositErr', err);
    return
  }

  if (!depositRes!.unsignedTx) {
    console.log('unable to generate deposit tx');
    return
  }

  const depositNonce = await params.rootWallet.getTransactionCount();
  const depositGasPrice = await params.rootProvider.getGasPrice();

  console.log('bridgeMethodsGasPerToken.DEFAULT.deposit.sourceGas', bridgeMethodsGasPerToken.DEFAULT.deposit.sourceGas);

  depositRes!.unsignedTx.gasLimit = bridgeMethodsGasPerToken.DEFAULT.deposit.sourceGas*3;
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
    sourceChainId: bridgeConfig.bridgeInstance.rootChainID,
    transactions: [{
      txHash: sendDepositRes.hash
    }]
  }

  let complete:boolean = false;
  let attempts = 0;
  while(!complete) {
    attempts++;
    const txStatusRes: TxStatusResponse = await tokenBridge.getTransactionStatus(txStatusReq);
    console.log(`TxStatusResponse attempt: ${attempts}`);
    console.log(util.inspect(txStatusRes, {showHidden: false, depth: null, colors: true}));
    if (txStatusRes.transactions[0].status === StatusResponse.COMPLETE
      || txStatusRes.transactions[0].status === StatusResponse.ERROR) {
      complete = true;
    } else {
      await delay(10000);
    }
  }
  
}

(async () => {
    try {
        await deposit()
        console.log('Exiting successfully');
    } catch(err) {
        console.error('Exiting with error', err)
    }
})();