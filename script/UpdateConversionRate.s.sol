// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/WATER.sol";

contract UpdateConversionRate is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // WATER contract address
        address waterAddress = 0xDd38ffa0738E778b31fE3874791Ea090E832300c;
        
        // New conversion rate: 1000000000000 CREDITS per 1 HBAR (with 18 decimals)
        uint256 newConversionRate = 1000000000000 * 1e18; // 1000000000000 CREDIT per 1 HBAR
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Connect to the WATER contract
        WATER water = WATER(payable(waterAddress));
        
        // Get current conversion rate
        (address creditTokenAddr, uint256 currentRate, uint256 contractBalance) = water.getContractInfo();
        
        console.log("=== Update Conversion Rate ===");
        console.log("WATER contract address:", waterAddress);
        console.log("Deployer address:", deployer);
        console.log("Current conversion rate (wei):", currentRate);
        console.log("Current conversion rate (human):", currentRate / 1e18);
        console.log("New conversion rate (wei):", newConversionRate);
        console.log("New conversion rate (human):", newConversionRate / 1e18);
        
        // Update the conversion rate
        water.setConversionRate(newConversionRate);
        
        // Get updated conversion rate
        (address creditTokenAddr2, uint256 updatedRate, uint256 contractBalance2) = water.getContractInfo();
        
        console.log("Updated conversion rate (wei):", updatedRate);
        console.log("Updated conversion rate (human):", updatedRate / 1e18);
        console.log("Rate updated successfully!");
        
        vm.stopBroadcast();
    }
}

/*
Deployment command using configured RPC:
forge script script/UpdateConversionRate.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000

Environment variables needed:
- PRIVATE_KEY: Your private key (must be the owner of the WATER contract)
*/
