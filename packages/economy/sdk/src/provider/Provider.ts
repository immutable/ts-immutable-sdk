/* eslint-disable no-await-in-loop */
import { Service } from 'typedi';
import { ethers } from 'ethers';

import { IMXProvider } from '@imtbl/provider';

import { igsItemAbi } from './abi';
import { Config } from '../Config';

const ITEM_CONTRACT_ADDRESS = '0x2F32Dfc90a5793b3709b6289Ff5c9FF48aa70fa9';

const ITEM_ESCROW_ADDRESS = '0xc5d7827f98E22C88187f7dd7c85203545DC95156';

@Service()
export class Provider {
  private imxProvider!: IMXProvider;

  private contract!: ethers.Contract;

  private signerAddress!: string;

  private signer!: ethers.providers.JsonRpcSigner;

  constructor(private config: Config) {
    const { imxProvider } = this.config.get();
    if (imxProvider) this.imxProvider = imxProvider;
    this.connect();
  }

  connect() {
    if (!this.imxProvider) {
      this.connectMetamask();
    }
  }

  public async transfer(txnId: string, tokenIds: number[]) {
    // TODO: use imx provider to transfer
    await this.transferToEscrow(txnId, tokenIds);
  }

  private async transferToEscrow(txnId: string, tokenIds: number[]) {
    const craftId = txnId.replaceAll('-', '');
    const refId = `0x${craftId.padEnd(64, '0')}`;
    const calldata = ethers.utils.defaultAbiCoder.encode(['bytes32'], [refId]);

    for (const tokenId of tokenIds) {
      await this.contract['safeTransferFrom(address,address,uint256,bytes)'](
        this.signerAddress,
        ITEM_ESCROW_ADDRESS,
        tokenId,
        calldata,
      );
      console.log(`NFT with token ID ${tokenId} transferred to escrow wallet`);
    }
  }

  private async connectMetamask() {
    const { ethereum } = window as any;

    if (!ethereum) return;

    const provider = new ethers.providers.Web3Provider(ethereum);
    await provider.send('eth_requestAccounts', []);
    this.signer = provider.getSigner();
    this.signerAddress = await provider.getSigner().getAddress();
    this.contract = new ethers.Contract(
      ITEM_CONTRACT_ADDRESS,
      igsItemAbi,
      this.signer,
    );
  }
}
