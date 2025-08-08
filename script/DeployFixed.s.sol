// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/CREDIT.sol";
import "../contracts/GMNFT.sol";
import "../contracts/WATER.sol";

contract DeployFixed is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy CREDIT token with role-based access control
        CREDIT credit = new CREDIT(deployer);
        console.log("CREDIT token deployed to:", address(credit));
        
        // Deploy GMNFT contract with FIXED CREDIT_PER_MINT (10 * 1e18)
        GMNft gmnft = new GMNft(
            "GM NFT",           // name
            "GMNFT",            // symbol
            1000,               // maxSupply
            deployer,           // initialOwner
            address(credit)     // creditToken address
        );
        console.log("GM NFT deployed to:", address(gmnft));
        
        // Deploy WATER contract for HBAR to CREDIT swapping
        WATER water = new WATER(
            deployer,           // initial owner
            address(credit),    // CREDIT token address
            100 * 1e18         // 100 CREDIT per 1 HBAR
        );
        console.log("WATER contract deployed to:", address(water));
        
        // Add GMNFT as a minter to CREDIT with higher gas
        credit.addMinter(address(gmnft));
        console.log("GMNFT added as minter to CREDIT");
        
        // Add WATER as a minter to CREDIT with higher gas
        credit.addMinter(address(water));
        console.log("WATER added as minter to CREDIT");
        
        vm.stopBroadcast();
        
        console.log("=== FIXED Deployment Summary ===");
        console.log("Deployer address:", deployer);
        console.log("CREDIT token:", address(credit));
        console.log("GMNFT contract:", address(gmnft));
        console.log("WATER contract:", address(water));
        console.log("Initial conversion rate: 100 CREDIT per 1 HBAR");
        console.log("CREDIT_PER_MINT: 10 CREDITS (10 * 1e18 wei)");
        console.log("=== FIXED Deployment Complete ===");
    }
}

/*
Deployment command using configured RPC with higher gas:
forge script script/DeployFixed.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000
*/
