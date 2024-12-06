/* eslint-disable no-console */
import 'dotenv/config';

// @ts-ignore
import { setupForBridge } from './lib/utils.ts';
// @ts-ignore
import { waitForReceipt } from './lib/helpers.ts';
// @ts-ignore
import { USDC } from './lib/USDC.js';
import { Contract } from 'ethers';

async function issueUSDC() {

  const params = await setupForBridge();

  if (!process.env.SEPOLIA_USDC) {
    throw new Error('SEPOLIA_USDC not set');
  }

  if (!process.env.AMOUNT_10000) {
    throw new Error('AMOUNT_10000 not set');
  }

  let sepoliaUSDCAddress: string = process.env.SEPOLIA_USDC;
  let numberOfIssuances: number = parseInt(process.env.AMOUNT_10000);

  const usdcContract: Contract = new Contract(sepoliaUSDCAddress, USDC, params.rootProvider);

  let issuances = 0;
  while (issuances < numberOfIssuances) {
    issuances++;
    console.log('issuances: ',issuances);
    let resp = await (usdcContract.connect(params.rootWallet) as Contract).issueToken();
    console.log('resp: ',resp);
    await waitForReceipt(resp.hash, params.rootProvider);
  }

  console.log('done');

}

(async () => {
    try {
        await issueUSDC()
        console.log('Exiting successfully');
    } catch(err) {
        console.error('Exiting with error', err)
    }
})();