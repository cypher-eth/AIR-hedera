// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/CREDIT.sol";
import "../contracts/WATER.sol";

contract WaterContractComprehensiveTest is Test {
    CREDIT public creditToken;
    WATER public waterContract;
    address public user = address(0x123);
    
    function setUp() public {
        // Deploy CREDIT token
        creditToken = new CREDIT(address(this));
        
        // Deploy WATER contract with 100 CREDIT per 1 HBAR
        waterContract = new WATER(
            address(this),           // initial owner
            address(creditToken),    // CREDIT token address
            100 * 1e18              // 100 CREDIT per 1 HBAR
        );
        
        // Add WATER as minter to CREDIT
        creditToken.addMinter(address(waterContract));
    }
    
    function testComprehensiveWaterCalculations() public {
        console.log("=== Comprehensive WATER Contract Test ===");
        
        // Test various amounts
        uint256[] memory testAmounts = new uint256[](6);
        testAmounts[0] = 0.01 ether;  // 0.01 HBAR
        testAmounts[1] = 0.04 ether;  // 0.04 HBAR
        testAmounts[2] = 0.1 ether;   // 0.1 HBAR
        testAmounts[3] = 0.5 ether;   // 0.5 HBAR
        testAmounts[4] = 1 ether;     // 1 HBAR
        testAmounts[5] = 2.5 ether;   // 2.5 HBAR
        
        for (uint256 i = 0; i < testAmounts.length; i++) {
            uint256 hbarAmount = testAmounts[i];
            console.log("--- Test", i + 1, "---");
            console.log("HBAR amount (wei):", hbarAmount);
            console.log("HBAR amount (human):", hbarAmount / 1e18);
            
            // Calculate expected CREDIT amount
            uint256 expectedCredits = (hbarAmount * 100 * 1e18) / 1e18;
            console.log("Expected CREDIT amount (wei):", expectedCredits);
            console.log("Expected CREDIT amount (human):", expectedCredits / 1e18);
            
            // Call the WATER contract's calculateCreditAmount function
            uint256 calculatedAmount = waterContract.calculateCreditAmount(hbarAmount);
            console.log("WATER calculated amount (wei):", calculatedAmount);
            console.log("WATER calculated amount (human):", calculatedAmount / 1e18);
            
            // Verify the calculation
            assertEq(calculatedAmount, expectedCredits, "Calculation should match");
            
            // Test the actual purchase
            vm.deal(user, 10 ether); // Give user some HBAR
            
            uint256 userBalanceBefore = creditToken.balanceOf(user);
            
            // Purchase tokens as the user
            vm.prank(user);
            waterContract.purchaseTokens{value: hbarAmount}();
            
            uint256 userBalanceAfter = creditToken.balanceOf(user);
            uint256 creditsReceived = userBalanceAfter - userBalanceBefore;
            
            console.log("CREDITS received (wei):", creditsReceived);
            console.log("CREDITS received (human):", creditsReceived / 1e18);
            
            // Verify the actual purchase matches the calculation
            assertEq(creditsReceived, calculatedAmount, "Actual purchase should match calculation");
            
            console.log("Test", i + 1, "passed");
        }
        
        console.log("=== All Tests Passed ===");
    }
    
    function testPrecisionEdgeCases() public {
        console.log("=== Precision Edge Cases Test ===");
        
        // Test very small amounts
        uint256[] memory smallAmounts = new uint256[](4);
        smallAmounts[0] = 0.001 ether;  // 0.001 HBAR
        smallAmounts[1] = 0.0001 ether; // 0.0001 HBAR
        smallAmounts[2] = 0.00001 ether; // 0.00001 HBAR
        smallAmounts[3] = 1;            // 1 wei
        
        for (uint256 i = 0; i < smallAmounts.length; i++) {
            uint256 hbarAmount = smallAmounts[i];
            console.log("--- Small Amount Test", i + 1, "---");
            console.log("HBAR amount (wei):", hbarAmount);
            console.log("HBAR amount (human):", hbarAmount / 1e18);
            
            // Calculate expected CREDIT amount
            uint256 expectedCredits = (hbarAmount * 100 * 1e18) / 1e18;
            console.log("Expected CREDIT amount (wei):", expectedCredits);
            console.log("Expected CREDIT amount (human):", expectedCredits / 1e18);
            
            // Call the WATER contract's calculateCreditAmount function
            uint256 calculatedAmount = waterContract.calculateCreditAmount(hbarAmount);
            console.log("WATER calculated amount (wei):", calculatedAmount);
            console.log("WATER calculated amount (human):", calculatedAmount / 1e18);
            
            // Verify the calculation
            assertEq(calculatedAmount, expectedCredits, "Calculation should match");
            
            console.log("Small amount test", i + 1, "passed");
        }
        
        console.log("=== All Precision Tests Passed ===");
    }
}
