// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/CREDIT.sol";
import "../contracts/GMNFT.sol";
import "../contracts/WATER.sol";

contract DeployOptimized is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== Starting Optimized Deployment ===");
        console.log("Deployer address:", deployer);
        console.log("Using optimized deployment strategy...");
        
        // Step 1: Deploy CREDIT token with high gas
        vm.startBroadcast(deployerPrivateKey);
        CREDIT credit = new CREDIT(deployer);
        vm.stopBroadcast();
        console.log("CREDIT token deployed to:", address(credit));
        
        // Step 2: Deploy GMNFT contract with high gas
        vm.startBroadcast(deployerPrivateKey);
        GMNft gmnft = new GMNft(
            "GM NFT",           // name
            "GMNFT",            // symbol
            1000,               // maxSupply
            deployer,           // initialOwner
            address(credit)     // creditToken address
        );
        vm.stopBroadcast();
        console.log("GM NFT deployed to:", address(gmnft));
        
        // Step 3: Deploy WATER contract with high gas
        vm.startBroadcast(deployerPrivateKey);
        WATER water = new WATER(
            deployer,           // initial owner
            address(credit),    // CREDIT token address
            100 * 1e18         // 100 CREDIT per 1 HBAR
        );
        vm.stopBroadcast();
        console.log("WATER contract deployed to:", address(water));
        
        // Step 4: Add GMNFT as minter with high gas
        vm.startBroadcast(deployerPrivateKey);
        credit.addMinter{gas: 8000000}(address(gmnft));
        vm.stopBroadcast();
        console.log("GMNFT added as minter to CREDIT");
        
        // Step 5: Add WATER as minter with high gas
        vm.startBroadcast(deployerPrivateKey);
        credit.addMinter{gas: 8000000}(address(water));
        vm.stopBroadcast();
        console.log("WATER added as minter to CREDIT");
        
        console.log("=== Optimized Deployment Complete ===");
        console.log("CREDIT token:", address(credit));
        console.log("GMNFT contract:", address(gmnft));
        console.log("WATER contract:", address(water));
        console.log("All contracts deployed with optimized gas settings!");
    }
}

/*
Deployment command with optimized settings:
forge script script/DeployOptimized.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 80000000

Alternative: Resume current deployment with higher gas:
forge script script/DeployAll.s.sol --resume --rpc-url hedera_testnet --broadcast --gas-limit 80000000
*/
