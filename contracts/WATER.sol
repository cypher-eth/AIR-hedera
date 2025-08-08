// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./CREDIT.sol";

/**
 * @title WATER
 * @dev Contract for swapping HBAR for CREDIT tokens at a fixed rate
 */
contract WATER is Ownable {
    
    // CREDIT token contract
    CREDIT public creditToken;
    
    // Conversion rate: how many CREDIT tokens per 1 HBAR (with 18 decimals)
    uint256 public conversionRate;
    
    // Events
    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 creditAmount);
    event ConversionRateUpdated(uint256 oldRate, uint256 newRate);
    event FundsClaimed(address indexed owner, uint256 amount);
    event CreditTokenUpdated(address indexed oldToken, address indexed newToken);
    
    /**
     * @dev Constructor
     * @param _initialOwner Initial owner of the contract
     * @param _creditToken Address of the CREDIT token contract
     * @param _initialConversionRate Initial conversion rate (CREDIT per HBAR)
     */
    constructor(
        address _initialOwner,
        address _creditToken,
        uint256 _initialConversionRate
    ) Ownable(_initialOwner) {
        require(_creditToken != address(0), "WATER: Invalid CREDIT token address");
        require(_initialConversionRate > 0, "WATER: Conversion rate must be greater than 0");
        
        creditToken = CREDIT(_creditToken);
        conversionRate = _initialConversionRate;
    }
    
    /**
     * @dev Purchase CREDIT tokens with HBAR
     */
    function purchaseTokens() external payable {
        require(msg.value > 0, "WATER: Must send HBAR to purchase tokens");
        
        // Calculate CREDIT tokens to mint (with 18 decimals)
        uint256 creditAmount = (msg.value * conversionRate) / 1e18;
        require(creditAmount > 0, "WATER: Amount too small to purchase tokens");
        
        // Mint CREDIT tokens to the buyer
        creditToken.mint(msg.sender, creditAmount);
        
        emit TokensPurchased(msg.sender, msg.value, creditAmount);
    }
    
    /**
     * @dev Set the conversion rate (owner only)
     * @param newRate New conversion rate (CREDIT per HBAR)
     */
    function setConversionRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "WATER: Conversion rate must be greater than 0");
        
        uint256 oldRate = conversionRate;
        conversionRate = newRate;
        
        emit ConversionRateUpdated(oldRate, newRate);
    }
    
    /**
     * @dev Update the CREDIT token address (owner only)
     * @param newCreditToken New CREDIT token address
     */
    function setCreditToken(address newCreditToken) external onlyOwner {
        require(newCreditToken != address(0), "WATER: Invalid CREDIT token address");
        
        address oldToken = address(creditToken);
        creditToken = CREDIT(newCreditToken);
        
        emit CreditTokenUpdated(oldToken, newCreditToken);
    }
    
    /**
     * @dev Claim ETH from the contract (owner only)
     */
    function claimFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "WATER: No funds to claim");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "WATER: Failed to transfer tokens");
        
        emit FundsClaimed(owner(), balance);
    }
    
    /**
     * @dev Calculate how many CREDIT tokens would be received for a given ETH amount
     * @param ethAmount Amount in wei
     * @return creditAmount Amount of CREDIT tokens that would be received
     */
    function calculateCreditAmount(uint256 ethAmount) external view returns (uint256) {
        return (ethAmount * conversionRate) / 1e18;
    }
    
    /**
     * @dev Get contract information
     * @return creditTokenAddress Address of the CREDIT token
     * @return currentRate Current conversion rate
     * @return contractBalance Current balance of the contract
     */
    function getContractInfo() external view returns (
        address creditTokenAddress,
        uint256 currentRate,
        uint256 contractBalance
    ) {
        return (address(creditToken), conversionRate, address(this).balance);
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        // Allow direct HBAR transfers to the contract
    }
    
    /**
     * @dev Fallback function
     */
    fallback() external payable {
        // Allow direct HBAR transfers to the contract
    }
}
