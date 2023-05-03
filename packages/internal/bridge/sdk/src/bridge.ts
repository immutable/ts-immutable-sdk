import { BridgeConfiguration } from 'config';
import { ethers } from 'ethers';

export class Bridge {
  constructor(configuration: BridgeConfiguration) {
    console.log(configuration);
    console.log(ethers.version);
  }
}
