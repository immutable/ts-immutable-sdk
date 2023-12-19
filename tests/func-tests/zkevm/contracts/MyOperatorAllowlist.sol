// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@imtbl/contracts/contracts/allowlist/OperatorAllowlist.sol';

contract MyOperatorAllowlist is OperatorAllowlist {
  constructor(address owner) OperatorAllowlist(owner) {}
}
