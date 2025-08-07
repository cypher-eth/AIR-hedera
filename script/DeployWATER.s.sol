// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/WATER.sol";

contract DeployWATER is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Get CREDIT token address from environment
        address creditAddress = vm.envAddress("CREDIT_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        WATER water = new WATER(deployer, creditAddress);
        
        vm.stopBroadcast();
        
        console.log("WATER contract deployed to:", address(water));
        console.log("Deployer address:", deployer);
        console.log("CREDIT token address:", creditAddress);
    }
} 