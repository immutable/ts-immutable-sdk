import type {
  BigNumberish,
  BytesLike,
  CallOverrides,
  Overrides,
  PopulatedTransaction,
} from 'ethers';
import {
  ImmutableERC721PermissionedMintable,
  ImmutableERC721PermissionedMintable__factory,
} from '@imtbl/contracts';
import { PromiseOrValue } from '@imtbl/contracts/dist/typechain/types/common';

export class ERC721PermissionedMintable {
  private readonly contract: ImmutableERC721PermissionedMintable;

  constructor(contractAddress: string) {
    const factory = new ImmutableERC721PermissionedMintable__factory();
    this.contract = factory.attach(contractAddress);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async DEFAULT_ADMIN_ROLE(
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.DEFAULT_ADMIN_ROLE(
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async MINTER_ROLE(
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.MINTER_ROLE(overrides);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async approve(
    to: PromiseOrValue<string>,
    tokenId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    },
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.approve(
      to,
      tokenId,
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async balanceOf(
    owner: PromiseOrValue<string>,
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.balanceOf(owner, overrides);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async baseURI(
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.baseURI(overrides);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async burn(
    tokenId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    },
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.burn(tokenId, overrides);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async contractURI(
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.contractURI(overrides);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async getAdmins(
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.getAdmins(overrides);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async getApproved(
    tokenId: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.getApproved(
      tokenId,
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async getRoleAdmin(
    role: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.getRoleAdmin(
      role,
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async getRoleMember(
    role: PromiseOrValue<BytesLike>,
    index: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.getRoleMember(
      role,
      index,
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async getRoleMemberCount(
    role: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.getRoleMemberCount(
      role,
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async grantMinterRole(
    user: PromiseOrValue<string>,
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    },
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.grantMinterRole(
      user,
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async grantRole(
    role: PromiseOrValue<BytesLike>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    },
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.grantRole(
      role,
      account,
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async hasRole(
    role: PromiseOrValue<BytesLike>,
    account: PromiseOrValue<string>,
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.hasRole(
      role,
      account,
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async isApprovedForAll(
    owner: PromiseOrValue<string>,
    operator: PromiseOrValue<string>,
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.isApprovedForAll(
      owner,
      operator,
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async mint(
    to: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    },
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.mint(to, amount, overrides);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async name(overrides?: CallOverrides): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.name(overrides);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async ownerOf(
    tokenId: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.ownerOf(tokenId, overrides);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async renounceRole(
    role: PromiseOrValue<BytesLike>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    },
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.renounceRole(
      role,
      account,
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async revokeMinterRole(
    user: PromiseOrValue<string>,
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    },
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.revokeMinterRole(
      user,
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async revokeRole(
    role: PromiseOrValue<BytesLike>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    },
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.revokeRole(
      role,
      account,
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async royaltyAllowlist(
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.royaltyAllowlist(overrides);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async royaltyInfo(
    _tokenId: PromiseOrValue<BigNumberish>,
    _salePrice: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.royaltyInfo(
      _tokenId,
      _salePrice,
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async 'safeTransferFrom(address,address,uint256)'(
    from: PromiseOrValue<string>,
    to: PromiseOrValue<string>,
    tokenId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    },
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction[
      'safeTransferFrom(address,address,uint256)'
    ](from, to, tokenId, overrides);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async 'safeTransferFrom(address,address,uint256,bytes)'(
    from: PromiseOrValue<string>,
    to: PromiseOrValue<string>,
    tokenId: PromiseOrValue<BigNumberish>,
    data: PromiseOrValue<BytesLike>,
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    },
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction[
      'safeTransferFrom(address,address,uint256,bytes)'
    ](from, to, tokenId, data, overrides);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async setApprovalForAll(
    operator: PromiseOrValue<string>,
    approved: PromiseOrValue<boolean>,
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    },
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.setApprovalForAll(
      operator,
      approved,
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async setBaseURI(
    baseURI_: PromiseOrValue<string>,
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    },
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.setBaseURI(
      baseURI_,
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async setContractURI(
    _contractURI: PromiseOrValue<string>,
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    },
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.setContractURI(
      _contractURI,
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async setRoyaltyAllowlistRegistry(
    _royaltyAllowlist: PromiseOrValue<string>,
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    },
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.setRoyaltyAllowlistRegistry(
      _royaltyAllowlist,
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async symbol(
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.symbol(overrides);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async tokenByIndex(
    index: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.tokenByIndex(
      index,
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async tokenOfOwnerByIndex(
    owner: PromiseOrValue<string>,
    index: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.tokenOfOwnerByIndex(
      owner,
      index,
      overrides,
    );
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async tokenURI(
    tokenId: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.tokenURI(tokenId, overrides);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async totalSupply(
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.totalSupply(overrides);
  }
}
