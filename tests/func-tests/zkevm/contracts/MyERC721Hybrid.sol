// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ERC721Psi } from '@imtbl/contracts/contracts/token/erc721/erc721psi/ERC721Psi.sol';
import '@imtbl/contracts/contracts/token/erc721/preset/ImmutableERC721.sol';

contract MyERC721Hybrid is ImmutableERC721 {
  constructor(
    address owner,
    string memory name,
    string memory symbol,
    string memory baseURI,
    string memory contractURI,
    address operatorAllowlist,
    address receiver,
    uint96 feeNumerator
  )
    ImmutableERC721(
      owner,
      name,
      symbol,
      baseURI,
      contractURI,
      operatorAllowlist,
      receiver,
      feeNumerator
    )
  {}

  // For the purposes of testing, we set the bulk mint threshold to 5. This means that
  // tokens minted by amount will start at ID 5.
  function mintBatchByQuantityThreshold() public pure override returns (uint256) {
    return 5;
  }
}
