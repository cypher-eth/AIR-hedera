// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/GMNFT.sol";

contract DeployGMNFT is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Replace with your deployed CREDIT token address
        address creditAddress = vm.envAddress("CREDIT_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        GMNft gmnft = new GMNft(
            "GM NFT",           // name
            "GMNFT",            // symbol
            1000,               // maxSupply
            deployer,           // initialOwner
            creditAddress       // creditToken address
        );
        
        vm.stopBroadcast();
        
        console.log("GM NFT deployed to:", address(gmnft));
        console.log("Deployer address:", deployer);
        console.log("CREDIT token address:", creditAddress);
    }
}

/*
Deployment command using configured RPC:
forge script script/DeployGMNFT.s.sol --rpc-url hedera_testnet --broadcast
*/ 