import { Wallet } from 'ethers';
import { ethers } from 'hardhat';
import { BigNumber } from '@ethersproject/bignumber';

import { ERC721Client, ERC721MintByIDClient } from '@imtbl/contracts';
import {defaultGasOverrides} from "./utils";

export const BASE_URI = 'https://api.hv-mtl.com/hv';
export const CONTRACT_URI =
  'https://gist.githubusercontent.com/hysmio/2fd05aac1c8646932fa8a1a6d0bbb62c/raw/b7fb15e35722455597d96c1223febb1e90effd45/contract.json';

export interface IERC721HybridPermissionedMintable {
  sdk: ERC721Client;
  address: string;
}

export interface IERC721PermissionedMintable {
  sdk: ERC721MintByIDClient;
  address: string;
}

export const deployCollection = async (
  deployer: Wallet,
  name: string,
  symbol: string,
  operatorAllowlist: string,
): Promise<IERC721PermissionedMintable> => {
  const contractFactory = await ethers.getContractFactory('MyERC721');

  const contract = await contractFactory.connect(deployer).deploy(
    deployer.address, // owner
    name,
    symbol,
    BASE_URI,
    CONTRACT_URI,
    operatorAllowlist, // operator allowlist
    deployer.address, // royalty recipient
    BigNumber.from('2000'), // fee numerator
    defaultGasOverrides
  );

  await contract.deployed();

  return {
    sdk: new ERC721MintByIDClient(contract.address),
    address: contract.address,
  };
};

export const deployHybridCollection = async (
  deployer: Wallet,
  name: string,
  symbol: string,
  operatorAllowlist: string,
): Promise<IERC721HybridPermissionedMintable> => {
  const contractFactory = await ethers.getContractFactory('MyERC721Hybrid');

  const contract = await contractFactory.connect(deployer).deploy(
    deployer.address, // owner
    name,
    symbol,
    BASE_URI,
    CONTRACT_URI,
    operatorAllowlist, // operator allowlist
    deployer.address, // royalty recipient
    BigNumber.from('2000'), // fee numerator
    defaultGasOverrides
  );

  await contract.deployed();

  return {
    sdk: new ERC721Client(contract.address),
    address: contract.address,
  };
};

export const deployReceiver = async (deployer: Wallet): Promise<string> => {
  const contractFactory = await ethers.getContractFactory('MyERC721Receiver');

  const contract = await contractFactory.connect(deployer).deploy(defaultGasOverrides);

  await contract.deployed();

  return contract.address;
};
