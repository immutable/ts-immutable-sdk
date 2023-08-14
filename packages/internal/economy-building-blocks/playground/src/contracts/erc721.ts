import { ethers } from "ethers";

const abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const erc721Interface = new ethers.utils.Interface(abi);

export function encodeIsApprovedAll(owner: string, operator: string) {
  return erc721Interface.encodeFunctionData("isApprovedForAll", [owner, operator]);
}

export function encodeSetApprovalForAll(operator: string, approved: boolean) {
  return erc721Interface.encodeFunctionData("setApprovalForAll", [operator, approved]);
}
