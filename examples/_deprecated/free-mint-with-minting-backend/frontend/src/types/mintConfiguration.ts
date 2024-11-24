export interface MintConfigurationResult {
  chainName: string;
  collectionAddress: string;
  maxTokenSupplyAcrossAllPhases: number;
  totalMintedAcrossAllPhases: number;
  eoaMintMessage: string;
  mintPhases: MintPhase[];
}

export interface MintPhase {
  name: string;
  startTime: number;
  endTime: number;
}
