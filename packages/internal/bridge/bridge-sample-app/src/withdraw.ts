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
    StatusResponse,
} from '@imtbl/bridge-sdk';

// @ts-ignore
import { setupForBridge } from './lib/utils.ts';
import { delay, getContract, waitForReceipt } from './lib/helpers.js';

async function withdraw() {

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
    console.log('token not mapped, please map token before withdrawing');
    return;
  }

  if (childBridgeChildAddress === ethers.constants.AddressZero) {
    console.log('token mappinng incomplete, please wait for token to map to childBridge before withdrawing');
    return;
  }

  const approvalReq: ApproveBridgeRequest = {
    senderAddress: params.sender,
    token: params.zkevmTestnetToken,
    amount: params.amount,
    sourceChainId: ZKEVM_TESTNET_CHAIN_ID,
    destinationChainId: ETH_SEPOLIA_CHAIN_ID,
  }

  console.log('approvalReq', approvalReq);

  let approvalRes: ApproveBridgeResponse;
  try {
    approvalRes = await tokenBridge.getUnsignedApproveBridgeTx(approvalReq);
    console.log('approvalRes', approvalRes);
  } catch(err) {
    console.log('approvalErr', err);
    return
  }

  if (approvalRes!.unsignedTx) {
    const approvalNonce = await params.childWallet.getTransactionCount();
    const approvalGasPrice = await params.childProvider.getGasPrice();

    console.log('approvalNonce', approvalNonce);
    console.log('approvalGasPrice', approvalGasPrice);

    approvalRes!.unsignedTx.gasLimit = 1000000;
    approvalRes!.unsignedTx.nonce = approvalNonce;
    approvalRes!.unsignedTx.gasPrice = approvalGasPrice.mul(2);

    console.log('approvalRes.unsignedTx');
    console.log(approvalRes!.unsignedTx);

    console.log('signing approval');
    const approvalTxSig = await params.childWallet.signTransaction(approvalRes!.unsignedTx);
    console.log('approvalTxSig', approvalTxSig);

    const sendApprovalRes = await params.childWallet.provider.sendTransaction(approvalTxSig);
    console.log('sendApprovalRes', sendApprovalRes);

    await waitForReceipt(sendApprovalRes.hash, params.childProvider);
  } else {
    console.log('no approval required');
  }

  const withdrawReq: BridgeTxRequest = {
    senderAddress: params.sender,
    recipientAddress: params.recipient,
    token: params.sepoliaToken,
    amount: params.amount,
    sourceChainId: ETH_SEPOLIA_CHAIN_ID,
    destinationChainId: ZKEVM_TESTNET_CHAIN_ID,
    gasMultiplier: 1.1,
  }

  console.log('withdrawReq', withdrawReq)
  let withdrawRes: BridgeTxResponse;
  try {
    withdrawRes = await tokenBridge.getUnsignedBridgeTx(withdrawReq);
    console.log('withdrawRes', withdrawRes);
  } catch(err) {
    console.log('withdrawErr', err);
    return
  }

  if (!withdrawRes!.unsignedTx) {
    console.log('unable to generate withdraw tx');
    return
  }

  const withdrawNonce = await params.childWallet.getTransactionCount();
  const withdrawGasPrice = await params.childProvider.getGasPrice();

  withdrawRes!.unsignedTx.gasLimit = 1000000;
  withdrawRes!.unsignedTx.nonce = withdrawNonce;
  withdrawRes!.unsignedTx.gasPrice = withdrawGasPrice.mul(2);

  withdrawRes!.unsignedTx.value = ethers.BigNumber.from(withdrawRes!.unsignedTx.value);

  console.log('withdrawRes.unsignedTx');
  console.log(withdrawRes!.unsignedTx);

  console.log('signing withdraw');
  const withdrawTxSig = await params.childWallet.signTransaction(withdrawRes!.unsignedTx);
  console.log('withdrawTxSig', withdrawTxSig);

  const sendWithdrawtRes = await params.childWallet.provider.sendTransaction(withdrawTxSig);
  console.log('sendWithdrawtRes', sendWithdrawtRes);

  await waitForReceipt(sendWithdrawtRes.hash, params.childProvider);
  
  console.log('Withdraw submitted txHash:',sendWithdrawtRes.hash);

  const txStatusReq:TxStatusRequest = {
    sourceChainId: ZKEVM_TESTNET_CHAIN_ID,
    transactions: [{
      txHash: sendWithdrawtRes.hash
    }]
  }

  let complete:boolean = false;
  let attempts = 0;
  while(!complete) {
    attempts++;
    const txStatusRes: TxStatusResponse = await tokenBridge.getTransactionStatus(txStatusReq);
    console.log(`TxStatusResponse attempt: ${attempts}`);
    console.log(util.inspect(txStatusRes, {showHidden: false, depth: null, colors: true}));
    if (txStatusRes.transactions[0].status === StatusResponse.COMPLETE) {
      complete = true;
    }
    await delay(10000);
  }
  
}

(async () => {
    try {
        await withdraw()
        console.log('Exiting successfully');
    } catch(err) {
        console.log('Exiting with error', err)
    }
})();