export interface EligibilityResult {
  chainName: string;
  collectionAddress: string;
  maxTokenSupplyAcrossAllPhases: number;
  hasMinted: null;
  mintPhases: MintPhase[];
}

export interface MintPhase {
  name: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
  isAllowListed: boolean;
}
