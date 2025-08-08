// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/WATER.sol";

contract WaterContractLiveTest is Test {
    // Deployed contract addresses
    address constant WATER_ADDRESS = 0xDd38ffa0738E778b31fE3874791Ea090E832300c;
    address constant CREDIT_ADDRESS = 0x9f9DF6958fDcC7F772799AB0D2b3CF01EE47C021;
    
    WATER public waterContract;
    
    function setUp() public {
        // Connect to the deployed WATER contract
        waterContract = WATER(payable(WATER_ADDRESS));
    }
    
    function testDeployedWaterContract() public view {
        console.log("=== Deployed WATER Contract Test ===");
        
        // Get contract info
        (address creditTokenAddr, uint256 conversionRate, uint256 contractBalance) = waterContract.getContractInfo();
        
        console.log("WATER contract address:", WATER_ADDRESS);
        console.log("CREDIT token address:", creditTokenAddr);
        console.log("Conversion rate (wei):", conversionRate);
        console.log("Conversion rate (human):", conversionRate / 1e18);
        console.log("Contract balance (wei):", contractBalance);
        console.log("Contract balance (human):", contractBalance / 1e18);
        
        // Test calculation with 0.04 HBAR
        uint256 hbarAmount = 0.04 ether; // 0.04 HBAR in wei
        console.log("=== Test Calculation ===");
        console.log("HBAR amount (wei):", hbarAmount);
        console.log("HBAR amount (human):", hbarAmount / 1e18);
        
        // Calculate expected CREDIT amount
        uint256 expectedCredits = (hbarAmount * conversionRate) / 1e18;
        console.log("Expected CREDIT amount (wei):", expectedCredits);
        console.log("Expected CREDIT amount (human):", expectedCredits / 1e18);
        
        // Call the WATER contract's calculateCreditAmount function
        uint256 calculatedAmount = waterContract.calculateCreditAmount(hbarAmount);
        console.log("WATER calculated amount (wei):", calculatedAmount);
        console.log("WATER calculated amount (human):", calculatedAmount / 1e18);
        
        // Test with 1 HBAR
        uint256 hbarAmount1 = 1 ether; // 1 HBAR in wei
        console.log("=== Test with 1 HBAR ===");
        console.log("HBAR amount (wei):", hbarAmount1);
        console.log("HBAR amount (human):", hbarAmount1 / 1e18);
        
        uint256 calculatedAmount1 = waterContract.calculateCreditAmount(hbarAmount1);
        console.log("WATER calculated amount (wei):", calculatedAmount1);
        console.log("WATER calculated amount (human):", calculatedAmount1 / 1e18);
        
        // Test with 0.01 HBAR
        uint256 hbarAmountSmall = 0.01 ether; // 0.01 HBAR in wei
        console.log("=== Test with 0.01 HBAR ===");
        console.log("HBAR amount (wei):", hbarAmountSmall);
        console.log("HBAR amount (human):", hbarAmountSmall / 1e18);
        
        uint256 calculatedAmountSmall = waterContract.calculateCreditAmount(hbarAmountSmall);
        console.log("WATER calculated amount (wei):", calculatedAmountSmall);
        console.log("WATER calculated amount (human):", calculatedAmountSmall / 1e18);
        
        console.log("=== Test Complete ===");
    }
}
