// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/CREDIT.sol";
import "../contracts/GMNFT.sol";

contract UserFlowTest is Test {
    CREDIT public creditToken;
    GMNft public gmNft;
    
    address public user = address(0x1);
    address public owner = address(0x2);
    
    // Constants
    uint256 public constant CREDIT_PER_MINT = 10;
    uint256 public constant DAILY_COOLDOWN = 5 * 60; // 5 minutes for testing
    
    function setUp() public {
        // Deploy CREDIT token
        creditToken = new CREDIT(owner);
        
        // Deploy GMNFT contract
        gmNft = new GMNft(
            "Good Morning NFT",
            "GM",
            1000, // max supply
            owner,
            address(creditToken)
        );
        
        // Grant minting permission to GMNFT contract by making it the owner
        vm.prank(owner);
        creditToken.transferOwnership(address(gmNft));
        
        // Start acting as the user
        vm.startPrank(user);
    }
    
    function testCompleteUserFlow() public {
        // Step 1: User mints their first GM NFT
        console.log("=== Step 1: First GM NFT Mint ===");
        uint256 initialBalance = creditToken.balanceOf(user);
        console.log("Initial CREDIT balance:", initialBalance);
        
        gmNft.mint();
        
        uint256 afterFirstMint = creditToken.balanceOf(user);
        console.log("CREDIT balance after first mint:", afterFirstMint);
        console.log("CREDITS earned:", afterFirstMint - initialBalance);
        
        // Verify user earned CREDITS
        assertEq(afterFirstMint - initialBalance, CREDIT_PER_MINT, "Should earn 10 CREDITS for first mint");
        assertEq(gmNft.balanceOf(user), 1, "Should own 1 GM NFT");
        
        // Step 2: User mints again (after cooldown)
        console.log("\n=== Step 2: Second GM NFT Mint ===");
        
        // Fast forward time to allow second mint
        vm.warp(block.timestamp + DAILY_COOLDOWN + 1);
        
        uint256 beforeSecondMint = creditToken.balanceOf(user);
        console.log("CREDIT balance before second mint:", beforeSecondMint);
        
        gmNft.mint();
        
        uint256 afterSecondMint = creditToken.balanceOf(user);
        console.log("CREDIT balance after second mint:", afterSecondMint);
        console.log("Total CREDITS earned:", afterSecondMint - initialBalance);
        
        // Verify second mint
        assertEq(afterSecondMint - beforeSecondMint, CREDIT_PER_MINT, "Should earn 10 CREDITS for second mint");
        assertEq(gmNft.balanceOf(user), 2, "Should own 2 GM NFTs");
        
        // Step 3: Check system balances
        console.log("\n=== Step 3: System Balance Check ===");
        uint256 totalUserCredits = creditToken.balanceOf(user);
        uint256 gmNftCredits = creditToken.balanceOf(address(gmNft));
        
        console.log("User CREDIT balance:", totalUserCredits);
        console.log("GMNFT contract CREDIT balance:", gmNftCredits);
        console.log("Total CREDITS in system:", totalUserCredits + gmNftCredits);
        
        // Step 4: Burn 1 CREDIT directly in CREDIT contract
        console.log("\n=== Step 4: Burn 1 CREDIT ===");
        uint256 beforeBurn1 = creditToken.balanceOf(user);
        uint256 userBurnedBefore = creditToken.getUserBurnedCredits(user);
        uint256 totalBurnedBefore = creditToken.getTotalBurnedCredits();
        
        console.log("User CREDIT balance before burn:", beforeBurn1);
        console.log("User total burned before:", userBurnedBefore);
        console.log("Global total burned before:", totalBurnedBefore);
        
        creditToken.burnCredits(1);
        
        uint256 afterBurn1 = creditToken.balanceOf(user);
        uint256 userBurnedAfter1 = creditToken.getUserBurnedCredits(user);
        uint256 totalBurnedAfter1 = creditToken.getTotalBurnedCredits();
        
        console.log("User CREDIT balance after burn:", afterBurn1);
        console.log("User total burned after:", userBurnedAfter1);
        console.log("Global total burned after:", totalBurnedAfter1);
        
        assertEq(afterBurn1, beforeBurn1 - 1, "Should have burned 1 CREDIT");
        assertEq(userBurnedAfter1, userBurnedBefore + 1, "User burned count should increase by 1");
        assertEq(totalBurnedAfter1, totalBurnedBefore + 1, "Global burned count should increase by 1");
        
        // Step 5: Burn 4 more CREDITS
        console.log("\n=== Step 5: Burn 4 More CREDITS ===");
        uint256 beforeBurn4 = creditToken.balanceOf(user);
        uint256 userBurnedBefore4 = creditToken.getUserBurnedCredits(user);
        uint256 totalBurnedBefore4 = creditToken.getTotalBurnedCredits();
        
        console.log("User CREDIT balance before burn:", beforeBurn4);
        console.log("User total burned before:", userBurnedBefore4);
        console.log("Global total burned before:", totalBurnedBefore4);
        
        creditToken.burnCredits(4);
        
        uint256 afterBurn4 = creditToken.balanceOf(user);
        uint256 userBurnedAfter4 = creditToken.getUserBurnedCredits(user);
        uint256 totalBurnedAfter4 = creditToken.getTotalBurnedCredits();
        
        console.log("User CREDIT balance after burn:", afterBurn4);
        console.log("User total burned after:", userBurnedAfter4);
        console.log("Global total burned after:", totalBurnedAfter4);
        
        assertEq(afterBurn4, beforeBurn4 - 4, "Should have burned 4 CREDITS");
        assertEq(userBurnedAfter4, userBurnedBefore4 + 4, "User burned count should increase by 4");
        assertEq(totalBurnedAfter4, totalBurnedBefore4 + 4, "Global burned count should increase by 4");
        
        // Step 6: Burn remaining CREDITS
        console.log("\n=== Step 6: Burn Remaining CREDITS ===");
        uint256 remainingCredits = creditToken.balanceOf(user);
        uint256 userBurnedBeforeFinal = creditToken.getUserBurnedCredits(user);
        uint256 totalBurnedBeforeFinal = creditToken.getTotalBurnedCredits();
        
        console.log("Remaining CREDITS to burn:", remainingCredits);
        console.log("User total burned before:", userBurnedBeforeFinal);
        console.log("Global total burned before:", totalBurnedBeforeFinal);
        
        creditToken.burnCredits(remainingCredits);
        
        uint256 afterFinalBurn = creditToken.balanceOf(user);
        uint256 userBurnedAfterFinal = creditToken.getUserBurnedCredits(user);
        uint256 totalBurnedAfterFinal = creditToken.getTotalBurnedCredits();
        
        console.log("User CREDIT balance after final burn:", afterFinalBurn);
        console.log("User total burned after:", userBurnedAfterFinal);
        console.log("Global total burned after:", totalBurnedAfterFinal);
        
        assertEq(afterFinalBurn, 0, "Should have 0 CREDITS remaining");
        assertEq(userBurnedAfterFinal, userBurnedBeforeFinal + remainingCredits, "User burned count should increase by remaining amount");
        assertEq(totalBurnedAfterFinal, totalBurnedBeforeFinal + remainingCredits, "Global burned count should increase by remaining amount");
        
        // Step 7: Try to burn more CREDITS and fail
        console.log("\n=== Step 7: Try to Burn More CREDITS (Should Fail) ===");
        console.log("User CREDIT balance:", creditToken.balanceOf(user));
        console.log("Attempting to burn 1 more CREDIT...");
        
        vm.expectRevert("CREDIT: Insufficient CREDIT balance");
        creditToken.burnCredits(1);
        
        console.log("Successfully failed to burn more CREDITS!");
        
        // Final summary
        console.log("\n=== Final Summary ===");
        console.log("Total GM NFTs owned:", gmNft.balanceOf(user));
        console.log("Total CREDITS earned:", userBurnedAfterFinal);
        console.log("Total CREDITS burned:", userBurnedAfterFinal);
        console.log("Global total CREDITS burned:", totalBurnedAfterFinal);
        console.log("User CREDIT balance:", creditToken.balanceOf(user));
        
        // Verify final state
        assertEq(gmNft.balanceOf(user), 2, "Should own 2 GM NFTs");
        assertEq(creditToken.balanceOf(user), 0, "Should have 0 CREDITS remaining");
        assertEq(userBurnedAfterFinal, 20, "Should have burned 20 CREDITS total (2 mints * 10 CREDITS each)");
        assertEq(totalBurnedAfterFinal, 20, "Global total should be 20 CREDITS burned");
    }
    
    function testUserFlowWithDetailedLogging() public {
        console.log("=== Starting Detailed User Flow Test ===");
        
        // Initial state
        console.log("Initial state:");
        console.log("- User address:", user);
        console.log("- GMNFT contract:", address(gmNft));
        console.log("- CREDIT token:", address(creditToken));
        
        // First mint
        console.log("\n1. First GM NFT mint:");
        uint256 tokenId1 = gmNft.getCurrentTokenId() + 1;
        gmNft.mint();
        console.log("- Minted token ID:", tokenId1);
        console.log("- CREDITS earned:", CREDIT_PER_MINT);
        console.log("- Current CREDIT balance:", creditToken.balanceOf(user));
        
        // Wait and mint again
        console.log("\n2. Second GM NFT mint (after cooldown):");
        vm.warp(block.timestamp + DAILY_COOLDOWN + 1);
        uint256 tokenId2 = gmNft.getCurrentTokenId() + 1;
        gmNft.mint();
        console.log("- Minted token ID:", tokenId2);
        console.log("- CREDITS earned:", CREDIT_PER_MINT);
        console.log("- Current CREDIT balance:", creditToken.balanceOf(user));
        
        // Burn CREDITS in sequence
        console.log("\n3. Burning CREDITS in CREDIT contract:");
        
        // Burn 1
        console.log("   a) Burning 1 CREDIT:");
        uint256 balanceBefore1 = creditToken.balanceOf(user);
        creditToken.burnCredits(1);
        console.log("   - Balance before:", balanceBefore1);
        console.log("   - Balance after:", creditToken.balanceOf(user));
        console.log("   - User total burned:", creditToken.getUserBurnedCredits(user));
        
        // Burn 4
        console.log("   b) Burning 4 CREDITS:");
        uint256 balanceBefore4 = creditToken.balanceOf(user);
        creditToken.burnCredits(4);
        console.log("   - Balance before:", balanceBefore4);
        console.log("   - Balance after:", creditToken.balanceOf(user));
        console.log("   - User total burned:", creditToken.getUserBurnedCredits(user));
        
        // Burn remaining
        uint256 remaining = creditToken.balanceOf(user);
        console.log("   c) Burning remaining", remaining, "CREDITS:");
        uint256 balanceBeforeRemaining = creditToken.balanceOf(user);
        creditToken.burnCredits(remaining);
        console.log("   - Balance before:", balanceBeforeRemaining);
        console.log("   - Balance after:", creditToken.balanceOf(user));
        console.log("   - User total burned:", creditToken.getUserBurnedCredits(user));
        
        // Try to burn more (should fail)
        console.log("\n4. Attempting to burn more CREDITS (should fail):");
        console.log("   - Current balance:", creditToken.balanceOf(user));
        console.log("   - Attempting to burn 1 more...");
        
        vm.expectRevert("CREDIT: Insufficient CREDIT balance");
        creditToken.burnCredits(1);
        
        console.log("   - Successfully failed as expected!");
        
        // Final summary
        console.log("\n=== Final Summary ===");
        console.log("GM NFTs owned:", gmNft.balanceOf(user));
        console.log("Total CREDITS earned:", 2 * CREDIT_PER_MINT);
        console.log("Total CREDITS burned:", creditToken.getUserBurnedCredits(user));
        console.log("Global CREDITS burned:", creditToken.getTotalBurnedCredits());
        console.log("Remaining CREDIT balance:", creditToken.balanceOf(user));
    }
    
    function testEdgeCases() public {
        console.log("=== Testing Edge Cases ===");
        
        // Test burning 0 CREDITS (should fail)
        console.log("\n1. Testing burn of 0 CREDITS:");
        vm.expectRevert("CREDIT: Amount must be greater than 0");
        creditToken.burnCredits(0);
        console.log("   - Successfully failed as expected!");
        
        // Test burning more than balance (should fail)
        console.log("\n2. Testing burn more than balance:");
        gmNft.mint(); // Get some CREDITS
        uint256 balance = creditToken.balanceOf(user);
        vm.expectRevert("CREDIT: Insufficient CREDIT balance");
        creditToken.burnCredits(balance + 1);
        console.log("   - Successfully failed as expected!");
        
        console.log("All edge cases passed!");
    }
}
