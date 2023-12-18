import {
  providers, Wallet, utils, BigNumber,
} from 'ethers';
import { NonceManager } from '@ethersproject/experimental';

import { assert } from 'chai';
import { env } from '../config/env';

const provider = new providers.JsonRpcProvider(env.rpcUrl);

export async function addIMX(address: string, amount: BigNumber) {
  if (!env.bankerPrivateKey) {
    throw new Error('Banker private key is not set');
  }
  const signer = new Wallet(env.bankerPrivateKey, provider);
  let retry = 0;

  const balance = await signer.getBalance();
  assert.ok(
    balance.gt(amount),
    `Banker balance is too low: ${utils.formatEther(
      balance.toString(),
    )} < ${utils.formatEther(amount)}`,
  );

  while (retry < 3) {
    const feeData = await provider.getFeeData();
    if (!feeData.maxPriorityFeePerGas) {
      throw new Error('maxPriorityFeePerGas is undefined');
    }

    if (!feeData.maxFeePerGas) {
      throw new Error('maxFeePerGas is undefined');
    }

    const tx: providers.TransactionRequest = {
      from: signer.address,
      to: address,
      value: amount,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      maxFeePerGas: feeData.maxFeePerGas,
    };

    try {
      const response = await signer.sendTransaction(tx);
      const receipt = await response.wait();
      console.log(
        `✅ Transferred ${utils.formatEther(amount)} -> ${address} - ${
          response.hash
        }`,
      );
      return receipt;
    } catch (ex: any) {
      console.log(
        `⛔ Banker got error: ${
          (ex.error && ex.error.reason) || ex.reason || ex.message
        }`,
      );
      if (
        ex.message.includes('transaction underpriced')
        || ex.message.includes('nonce has already been used')
      ) {
        // simply try again and noncemanager should get it correct
        retry++;
        const wait = Math.trunc(Math.random() * 2000);
        console.log(
          `Hit ${
            ex.message.includes('transaction underpriced')
              ? 'transaction underpriced'
              : 'nonce used'
          } error for ${address}, retrying in ${
            Math.round(wait * 100) / 100
          }ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, wait));
      } else {
        assert.fail(
          `Failed to transfer ${utils.formatEther(amount)} -> ${address}: ${
            ex.message
          }`,
        );
      }
    }
  }
}
