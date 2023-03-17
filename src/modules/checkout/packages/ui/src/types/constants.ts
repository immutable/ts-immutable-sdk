
export enum NetworkName {
  MATIC = 'matic',
  HOMESTEAD = 'homestead',
  GOERLI = 'goerli',
}

export type NetworkNameMapType = {
  [key in NetworkName]: string;
};

export const NetworkNameMap:NetworkNameMapType = {
  [NetworkName.MATIC]: 'Polygon',
  [NetworkName.HOMESTEAD]: 'Ethereum',
  [NetworkName.GOERLI]: 'Goerli'
};
