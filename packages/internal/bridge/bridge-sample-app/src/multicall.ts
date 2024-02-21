/* eslint-disable no-console */
import 'dotenv/config';

// @ts-ignore
import { setupForBridge } from './lib/utils.ts';

// @ts-ignore
import { MULTICALL_ADDRESS, MULTICALL_ABI_ETHERS, ERC20_ABI } from './lib/constants.ts';

// @ts-ignore
import { ERC20 } from './lib/ERC20.js';

// @ts-ignore
import { ROOT_ERC20_BRIDGE_FLOW_RATE } from './lib/RootERC20BridgeFlowRate.js';

import { ethers } from 'ethers';

async function multicall() {

  const params = await setupForBridge();

  const provider = params.rootProvider;

  // Get Multicall contract instance.
  const multicall = new ethers.Contract(MULTICALL_ADDRESS, MULTICALL_ABI_ETHERS, provider);

  type Aggregate3Response = { success: boolean; returnData: string };

  console.log('define user address');

  // Define the user address.

  const userAddress = '0xEac347177DbA4a190B632C7d9b8da2AbfF57c772';

  // Setup the contract addresses and contracts that we'll need.

  const rootBridgeAddress = '0x0D3C59c779Fd552C27b23F723E80246c840100F5';
  const depositAmount = ethers.BigNumber.from(1000);

  const rootBridgeContract = new ethers.Contract(
    rootBridgeAddress, 
    ROOT_ERC20_BRIDGE_FLOW_RATE,
    provider
  );

  const tokenAddr = "0x40b87d235A5B010a20A241F15797C9debf1ecd01"; // Sepolia USDC
  const tokenContract = new ethers.Contract(
    tokenAddr, 
    ERC20,
    provider
  );


  console.log('prepare allowance and deposit calls');
  
  // prepare the allowance and deposit calls
  const allowanceAndDeposit = [
    // {
    //   target: tokenContract,
    //   allowFailure: true, // We allow failure for all calls.
    //   callData: tokenContract.interface.encodeFunctionData('name'),
    // },
    {
      target: tokenContract,
      allowFailure: true, // We allow failure for all calls.
      callData: tokenContract.interface.encodeFunctionData('allowance', [
        ethers.utils.getAddress(userAddress), 
        params.rootBridgeAddress,
        ]),
    },
    // {
    //   target: rootBridgeContract,
    //   allowFailure: true, // We allow failure for all calls.
    //   callData: rootBridgeContract.interface.encodeFunctionData('deposit', [tokenAddr, depositAmount]),
    // }
  ];

  console.log('allowanceAndDeposit',allowanceAndDeposit);

  console.log('execute allowance and deposit calls');

  // Execute those calls.
  const results: Aggregate3Response[] = await multicall.callStatic.aggregate3(
    allowanceAndDeposit
  );

  console.log('results', results);

}

(async () => {
  try {
      await multicall();
      console.log('Exiting successfully');
      return;
  } catch(err) {
      console.error('Exiting with error', err);
      return;
  }
})();