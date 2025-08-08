// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CREDIT
 * @dev ERC20 token contract for CREDIT tokens with built-in burning and tracking functionality
 */
contract CREDIT is ERC20, Ownable {
    
    // Mapping to track total CREDIT burned by each user
    mapping(address => uint256) public userBurnedCredits;
    
    // Total CREDIT burned across all users
    uint256 public totalBurnedCredits;
    
    // Events
    event CreditsMinted(address indexed to, uint256 amount);
    event CreditsBurned(address indexed user, uint256 amount, uint256 userTotal, uint256 globalTotal);
    
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
    
    /**
     * @dev Burn CREDIT tokens and track the amount (replaces WATER contract functionality)
     * @param amount Amount of CREDIT tokens to burn
     */
    function burnCredits(uint256 amount) external {
        require(amount > 0, "CREDIT: Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "CREDIT: Insufficient CREDIT balance");
        
        // Burn the CREDIT tokens directly
        _burn(msg.sender, amount);
        
        // Update tracking
        userBurnedCredits[msg.sender] += amount;
        totalBurnedCredits += amount;
        
        emit CreditsBurned(msg.sender, amount, userBurnedCredits[msg.sender], totalBurnedCredits);
    }
    
    /**
     * @dev Get the total CREDIT burned by a specific user
     * @param user Address to check
     * @return Total CREDIT burned by the user
     */
    function getUserBurnedCredits(address user) external view returns (uint256) {
        return userBurnedCredits[user];
    }
    
    /**
     * @dev Get the total CREDIT burned across all users
     * @return Total CREDIT burned globally
     */
    function getTotalBurnedCredits() external view returns (uint256) {
        return totalBurnedCredits;
    }
} 