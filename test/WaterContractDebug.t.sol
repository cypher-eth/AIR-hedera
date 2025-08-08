// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/CREDIT.sol";
import "../contracts/WATER.sol";

contract WaterContractDebug is Test {
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
    
    function testWaterContractDebug() public {
        console.log("=== WATER Contract Debug Test ===");
        
        // Test 1 HBAR
        uint256 hbarAmount = 1 ether; // 1 HBAR in wei
        console.log("HBAR amount (wei):", hbarAmount);
        console.log("HBAR amount (human):", hbarAmount / 1e18);
        
        // Get conversion rate
        (address creditTokenAddr, uint256 conversionRate, uint256 contractBalance) = waterContract.getContractInfo();
        console.log("Conversion rate (wei):", conversionRate);
        console.log("Conversion rate (human):", conversionRate / 1e18);
        
        // Calculate expected CREDIT amount
        uint256 expectedCredits = (hbarAmount * conversionRate) / 1e18;
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
        console.log("User CREDIT balance before:", userBalanceBefore);
        console.log("User CREDIT balance before (human):", userBalanceBefore / 1e18);
        
        // Purchase tokens as the user
        vm.prank(user);
        waterContract.purchaseTokens{value: hbarAmount}();
        
        uint256 userBalanceAfter = creditToken.balanceOf(user);
        console.log("User CREDIT balance after:", userBalanceAfter);
        console.log("User CREDIT balance after (human):", userBalanceAfter / 1e18);
        console.log("CREDITS received:", userBalanceAfter - userBalanceBefore);
        console.log("CREDITS received (human):", (userBalanceAfter - userBalanceBefore) / 1e18);
        
        // Should receive 100 CREDITS for 1 HBAR
        assertEq(userBalanceAfter - userBalanceBefore, 100 * 1e18, "Should receive 100 CREDITS");
        
        console.log("=== Test Passed ===");
    }
    
    function testSmallAmount() public {
        // Test with 0.04 HBAR
        uint256 hbarAmount = 0.04 ether; // 0.04 HBAR in wei
        console.log("=== Small Amount Test (0.04 HBAR) ===");
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
        
        console.log("=== Small Amount Test Passed ===");
    }
}
