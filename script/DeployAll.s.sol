// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/CREDIT.sol";
import "../contracts/GMNFT.sol";
import "../contracts/WATER.sol";

contract DeployAll is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Step 1: Deploy CREDIT token with deployer as initial owner and minter
        CREDIT credit = new CREDIT(deployer);
        console.log("CREDIT token deployed to:", address(credit));
        
        // Step 2: Deploy GMNFT contract
        GMNft gmnft = new GMNft(
            "GM NFT",           // name
            "GMNFT",            // symbol
            1000,               // maxSupply
            deployer,           // initialOwner
            address(credit)     // creditToken address
        );
        console.log("GM NFT deployed to:", address(gmnft));
        
        // Step 3: Deploy WATER contract
        uint256 initialConversionRate = 100 * 1e18; // 100 CREDIT per ETH
        WATER water = new WATER(
            deployer,           // initial owner
            address(credit),    // CREDIT token address
            initialConversionRate // 100 CREDIT per 1 ETH
        );
        console.log("WATER contract deployed to:", address(water));
        
        // Step 4: Add GMNFT as a minter to CREDIT
        credit.addMinter(address(gmnft));
        console.log("GMNFT added as minter to CREDIT");
        
        // Step 5: Add WATER as a minter to CREDIT
        credit.addMinter(address(water));
        console.log("WATER added as minter to CREDIT");
        
        // Step 6: Add deployer as an operator to CREDIT (for burn API)
        credit.addOperator(deployer);
        console.log("Deployer added as operator to CREDIT");
        
        vm.stopBroadcast();
        
        console.log("=== Deployment Summary ===");
        console.log("Deployer address:", deployer);
        console.log("CREDIT token:", address(credit));
        console.log("GMNFT contract:", address(gmnft));
        console.log("WATER contract:", address(water));
        console.log("Initial conversion rate: 100 CREDIT per 1 ETH");
        console.log("=== Deployment Complete ===");
    }
}
