// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/CREDIT.sol";
import "../contracts/GMNFT.sol";

contract DeployAll is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Step 1: Deploy CREDIT token with deployer as initial owner
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
        
        // Step 3: Transfer CREDIT ownership to GMNFT contract
        credit.transferOwnership(address(gmnft));
        console.log("CREDIT ownership transferred to GMNFT contract");
        
        vm.stopBroadcast();
        
        console.log("=== Deployment Summary ===");
        console.log("Deployer address:", deployer);
        console.log("CREDIT token:", address(credit));
        console.log("GMNFT contract:", address(gmnft));


        console.log("=== Deployment Complete ===");
    }
}
