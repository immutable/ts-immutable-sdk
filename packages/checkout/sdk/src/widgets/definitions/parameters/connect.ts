import { Web3Provider } from '@ethersproject/providers';
import { Passport } from '@imtbl/passport';

export enum ConnectTargetLayer {
  LAYER1 = 'LAYER1',
  LAYER2 = 'LAYER2',
}

export type ConnectWidgetParams = {
  web3Provider?: Web3Provider;
  passport?: Passport;
};
