pragma solidity ^0.8.0;

import "@imtbl/contracts/contracts/token/erc1155/preset/ImmutableERC1155.sol";

contract TestERC1155Token is ImmutableERC1155 {
    constructor(
        address owner,
        string memory name,
        string memory baseURI,
        string memory contractURI,
        address operatorAllowlist,
        address receiver,
        uint96 feeNumerator
    ) ImmutableERC1155(
    owner,
    name,
    baseURI,
    contractURI,
    operatorAllowlist,
    receiver,
    feeNumerator
    )
    {
    }
}