import { ethers } from 'ethers';

const abi = [
  {
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    constant: false,
    name: 'approve',
    outputs: [{ name: 'success', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const contractInterface = new ethers.utils.Interface(abi);

export function encodeApprove(spender: string, value: string, decimals = 6) {
  // take amount as string, convert to number with decimals
  const amount = ethers.utils.parseUnits(value, decimals).toString();
  return contractInterface.encodeFunctionData('approve', [spender, amount]);
}
