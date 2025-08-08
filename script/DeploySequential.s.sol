// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/CREDIT.sol";
import "../contracts/GMNFT.sol";
import "../contracts/WATER.sol";

contract DeploySequential is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== Starting Sequential Deployment ===");
        console.log("Deployer address:", deployer);
        
        // Step 1: Deploy CREDIT token
        vm.startBroadcast(deployerPrivateKey);
        CREDIT credit = new CREDIT(deployer);
        vm.stopBroadcast();
        console.log("CREDIT token deployed to:", address(credit));
        
        // Wait for confirmation
        console.log("Waiting 30 seconds for CREDIT deployment to confirm...");
        vm.warp(block.timestamp + 30);
        
        // Step 2: Deploy GMNFT contract
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
        
        // Wait for confirmation
        console.log("Waiting 30 seconds for GMNFT deployment to confirm...");
        vm.warp(block.timestamp + 30);
        
        // Step 3: Deploy WATER contract
        vm.startBroadcast(deployerPrivateKey);
        WATER water = new WATER(
            deployer,           // initial owner
            address(credit),    // CREDIT token address
            100 * 1e18         // 100 CREDIT per 1 HBAR
        );
        vm.stopBroadcast();
        console.log("WATER contract deployed to:", address(water));
        
        // Wait for confirmation
        console.log("Waiting 30 seconds for WATER deployment to confirm...");
        vm.warp(block.timestamp + 30);
        
        // Step 4: Add GMNFT as minter
        vm.startBroadcast(deployerPrivateKey);
        credit.addMinter{gas: 5000000}(address(gmnft));
        vm.stopBroadcast();
        console.log("GMNFT added as minter to CREDIT");
        
        // Wait for confirmation
        console.log("Waiting 30 seconds for GMNFT minter role to confirm...");
        vm.warp(block.timestamp + 30);
        
        // Step 5: Add WATER as minter
        vm.startBroadcast(deployerPrivateKey);
        credit.addMinter{gas: 5000000}(address(water));
        vm.stopBroadcast();
        console.log("WATER added as minter to CREDIT");
        
        console.log("=== Sequential Deployment Complete ===");
        console.log("CREDIT token:", address(credit));
        console.log("GMNFT contract:", address(gmnft));
        console.log("WATER contract:", address(water));
    }
}

/*
Deployment command using faster RPC endpoints:
forge script script/DeploySequential.s.sol --rpc-url hedera_testnet_fast --broadcast --gas-limit 60000000
forge script script/DeploySequential.s.sol --rpc-url hedera_testnet_calaxy --broadcast --gas-limit 60000000
forge script script/DeploySequential.s.sol --rpc-url hedera_testnet_myhbarwallet --broadcast --gas-limit 60000000
*/
