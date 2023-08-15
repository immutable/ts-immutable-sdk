import { ethers } from 'ethers';

interface CheckpointData {
  blockRound: number;
  epochNumber: number;
  currentValidatorHash: string;
  nextValidatorHash: string;
  eventRoot: string;
}

interface BlockExtraData {
  validators: string[];
  parent: string[];
  committed: string[];
  checkpoint: CheckpointData
}

export function decodeExtraData(extraData: string): BlockExtraData {
  const decoded = ethers.utils.RLP.decode(`0x${extraData.substring(66)}`);

  const blockExtraData: BlockExtraData = {
    validators: decoded[0],
    parent: decoded[1],
    committed: decoded[2],
    checkpoint: {
      blockRound: decoded[3][0],
      epochNumber: parseInt(decoded[3][1], 16),
      currentValidatorHash: decoded[3][2],
      nextValidatorHash: decoded[3][3],
      eventRoot: decoded[3][4],
    },
  };

  return blockExtraData;
}
