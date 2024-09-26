pragma solidity ^0.8.0;

import "@imtbl/contracts/contracts/token/erc20/preset/ImmutableERC20MinterBurnerPermit.sol";

contract TestERC20Token is ImmutableERC20MinterBurnerPermit {
    constructor(
        address owner,
        string memory name,
        string memory symbol,
        uint256 maxTokenSupply
    ) ImmutableERC20MinterBurnerPermit(
        owner,
        owner,
        owner,
        name,
        symbol,
        maxTokenSupply
    )
    {
    }

    function mintBatch(address[] memory to, uint256[] memory values) external {
        require(to.length == values.length, "Arrays must have the same length");
        for (uint256 i = 0; i < to.length; i++) {
            _mint(to[i], values[i]);
        }
    }

    function transferBatch(address[] memory to, uint256[] memory values) external {
        require(to.length == values.length, "Arrays must have the same length");
        for (uint256 i = 0; i < to.length; i++) {
            _transfer(msg.sender, to[i], values[i]);
        }
    }
}
