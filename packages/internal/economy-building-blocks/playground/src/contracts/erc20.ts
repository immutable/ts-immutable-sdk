import { ethers } from "ethers";

const abi = [
  {
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    constant: false,
    name: "approve",
    outputs: [{ name: "success", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

const contractInterface = new ethers.utils.Interface(abi);

export function encodeApprove(
  spender: string,
  value: string,
  decimals: number
) {
  // take amount as string, convert to number with decimals
  const amount = ethers.utils.parseUnits(value, decimals).toString();
  console.log("🚀 ~ file: erc20.ts:27 ~ amount:", amount)
  return contractInterface.encodeFunctionData("approve", [spender, amount]);
}
