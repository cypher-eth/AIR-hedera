// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CREDIT.sol";

/**
 * @title WATER
 * @dev Contract that accepts CREDIT tokens, burns them, and tracks total burned amount
 */
contract WATER is Ownable {
    
    // CREDIT token contract reference
    CREDIT public creditToken;
    
    // Mapping to track total CREDIT burned by each user
    mapping(address => uint256) public userBurnedCredits;
    
    // Total CREDIT burned across all users
    uint256 public totalBurnedCredits;
    
    // Events
    event CreditsBurned(address indexed user, uint256 amount, uint256 userTotal, uint256 globalTotal);
    event CreditTokenUpdated(address indexed newCreditToken);
    
    /**
     * @dev Constructor
     * @param _initialOwner Initial owner of the contract
     * @param _creditToken Address of the CREDIT token contract
     */
    constructor(address _initialOwner, address _creditToken) Ownable(_initialOwner) {
        creditToken = CREDIT(_creditToken);
    }
    
    /**
     * @dev Burn CREDIT tokens and track the amount
     * @param amount Amount of CREDIT tokens to burn
     */
    function burnCredits(uint256 amount) external {
        require(amount > 0, "WATER: Amount must be greater than 0");
        require(creditToken.balanceOf(msg.sender) >= amount, "WATER: Insufficient CREDIT balance");
        
        // Transfer CREDIT tokens from user to this contract
        require(creditToken.transferFrom(msg.sender, address(this), amount), "WATER: Transfer failed");
        
        // Burn the CREDIT tokens
        creditToken.burn(amount);
        
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
    
    /**
     * @dev Set the CREDIT token contract address
     * @param _creditToken New CREDIT token contract address
     */
    function setCreditToken(address _creditToken) external onlyOwner {
        creditToken = CREDIT(_creditToken);
        emit CreditTokenUpdated(_creditToken);
    }
    
    /**
     * @dev Get the current CREDIT balance of this contract
     * @return Current CREDIT balance
     */
    function getContractCreditBalance() external view returns (uint256) {
        return creditToken.balanceOf(address(this));
    }
} 