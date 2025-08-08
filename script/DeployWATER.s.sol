// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/WATER.sol";

contract DeployWATER is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Use the deployed CREDIT token address
        address creditAddress = 0x37805D217B7FFd09099d51711C246E2624EB6a9f;
        
        // Initial conversion rate: 100 CREDIT per 1 HBAR (with 18 decimals)
        uint256 initialConversionRate = 100 * 1e18; // 100 CREDIT per HBAR
        
        vm.startBroadcast(deployerPrivateKey);
        
        WATER water = new WATER(
            deployer,           // initial owner
            creditAddress,      // CREDIT token address
            initialConversionRate // 100 CREDIT per 1 HBAR
        );
        
        vm.stopBroadcast();
        
        console.log("WATER contract deployed to:", address(water));
        console.log("Deployer address:", deployer);
        console.log("CREDIT token address:", creditAddress);
        console.log("Initial conversion rate:", initialConversionRate);
        console.log("Rate: 100 CREDIT per 1 HBAR");
    }
}

/*
Deployment command using configured RPC:
forge script script/DeployWATER.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000

Contract Addresses:
- CREDIT: 0x37805D217B7FFd09099d51711C246E2624EB6a9f
- WATER: 0x13e26834E78a1Cf31B0C1DCEa485547ED88aA336
*/
