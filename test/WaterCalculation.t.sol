// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/CREDIT.sol";
import "../contracts/WATER.sol";

contract WaterCalculationTest is Test {
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
    
    function testWaterCalculation() public {
        // Test with 0.04 HBAR
        uint256 hbarAmount = 0.04 ether; // 0.04 HBAR in wei
        console.log("HBAR amount (wei):", hbarAmount);
        
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
        vm.deal(user, 1 ether); // Give user some HBAR
        
        uint256 userBalanceBefore = creditToken.balanceOf(user);
        console.log("User CREDIT balance before:", userBalanceBefore);
        
        // Purchase tokens as the user
        vm.prank(user);
        waterContract.purchaseTokens{value: hbarAmount}();
        
        uint256 userBalanceAfter = creditToken.balanceOf(user);
        console.log("User CREDIT balance after:", userBalanceAfter);
        console.log("CREDITS received:", userBalanceAfter - userBalanceBefore);
        console.log("CREDITS received (human):", (userBalanceAfter - userBalanceBefore) / 1e18);
        
        // Should receive 4 CREDITS for 0.04 HBAR
        assertEq(userBalanceAfter - userBalanceBefore, 4 * 1e18, "Should receive 4 CREDITS");
    }
}
