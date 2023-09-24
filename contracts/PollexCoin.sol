// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PollexCoin is ERC20 {
  constructor(uint256 initialSupply) ERC20("PollexCoin", "POLLEX") {
    _mint(msg.sender, initialSupply);
  }
}
