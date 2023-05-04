import { defaultAbiCoder, getCreate2Address } from 'ethers/lib/utils';
import { keccak256 } from '@ethersproject/solidity';
import { FeeAmount } from '@uniswap/v3-sdk';
import { ERC20Pair } from './generateERC20Pairs';

// Hard-coded into factory contract
const POOL_INIT_CODE_HASH = '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54';

export function computePoolAddress({
  factoryAddress,
  erc20Pair,
  fee,
  initCodeHashManualOverride,
}: {
  factoryAddress: string;
  erc20Pair: ERC20Pair;
  fee: FeeAmount;
  initCodeHashManualOverride?: string;
}): string {
  // erc20 addresses need to be in alphabetical order to correctly identify a pool
  erc20Pair = ensureCorrectERC20AddressOrder(erc20Pair);
  return getCreate2Address(
    factoryAddress,
    keccak256(
      ['bytes'],
      [
        defaultAbiCoder.encode(
          ['address', 'address', 'uint24'],
          [erc20Pair[0].address, erc20Pair[1].address, fee],
        ),
      ],
    ),
    initCodeHashManualOverride ?? POOL_INIT_CODE_HASH,
  );
}

const ensureCorrectERC20AddressOrder = (erc20Pair: ERC20Pair): ERC20Pair => {
  if (erc20Pair[0].address.toLowerCase() > erc20Pair[1].address.toLowerCase()) {
    const temp = erc20Pair[0];
    erc20Pair[0] = erc20Pair[1];
    erc20Pair[1] = temp;
  }

  return erc20Pair;
};
