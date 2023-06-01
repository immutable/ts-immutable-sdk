import { BigNumberish } from '@ethersproject/bignumber';
import { CallOverrides, PopulatedTransaction } from '@ethersproject/contracts';
import { ImmutableERC721PermissionedMintable, ImmutableERC721PermissionedMintable__factory } from '@imtbl/contracts';
import { PromiseOrValue } from '@imtbl/contracts/dist/typechain/types/common';

export class ERC721PermissionedMintable {
  private readonly contract: ImmutableERC721PermissionedMintable;

  constructor(contractAddress: string) {
    const factory = new ImmutableERC721PermissionedMintable__factory();
    this.contract = factory.attach(contractAddress);
  }

  public async mint(
    to: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return await this.contract.populateTransaction.mint(to, amount, overrides);
  }
}
