pragma solidity ^0.8.19;

import "@imtbl/contracts/contracts/token/erc721/preset/ImmutableERC721MintByID.sol";

contract TestERC721Token is ImmutableERC721MintByID {
    constructor(
        address owner,
        string memory name,
        string memory symbol,
        string memory baseURI,
        string memory contractURI,
        address operatorAllowlist,
        address receiver,
        uint96 feeNumerator
    ) ImmutableERC721MintByID(
        owner,
        name,
        symbol,
        baseURI,
        contractURI,
        operatorAllowlist,
        receiver,
        feeNumerator
    )
    {
    }
}
