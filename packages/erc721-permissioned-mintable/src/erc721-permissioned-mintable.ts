// import { TransactionRequest } from '@ethersproject/providers';
import { ImmutableERC721PermissionedMintable, ImmutableERC721PermissionedMintable__factory } from '@imtbl/contracts';

export class ERC721PermissionedMintable {
  private readonly contract: ImmutableERC721PermissionedMintable;

  constructor(contractAddress: string) {
    this.contract = ImmutableERC721PermissionedMintable__factory.attach(contractAddress);
  }

  // // TODO add types to params
  // public async mint(params): Promise<TransactionRequest> {
  //   // TODO add hasRole check
  //   return await contract.populateTransaction.mint(...params);
  // }
}
