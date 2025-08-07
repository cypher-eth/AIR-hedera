// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CREDIT
 * @dev ERC20 token contract for CREDIT tokens
 */
contract CREDIT is ERC20, Ownable {
    
    // Events
    event CreditsMinted(address indexed to, uint256 amount);
    
    /**
     * @dev Constructor
     * @param _initialOwner Initial owner of the contract
     */
    constructor(address _initialOwner) ERC20("CREDIT", "CREDIT") Ownable(_initialOwner) {
        // Initial supply can be minted by owner if needed
    }
    
    /**
     * @dev Mint CREDIT tokens to a specific address
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit CreditsMinted(to, amount);
    }
    
    /**
     * @dev Burn tokens from caller
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Burn tokens from a specific address (owner only)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
} 