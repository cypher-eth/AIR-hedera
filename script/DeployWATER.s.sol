// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/WATER.sol";

contract DeployWATER is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Get the CREDIT token address from environment
        address creditAddress = vm.envAddress("CREDIT_ADDRESS");
        
        // Initial conversion rate: 100 CREDIT per 1 ETH (with 18 decimals)
        uint256 initialConversionRate = 100 * 1e18; // 100 CREDIT per ETH
        
        vm.startBroadcast(deployerPrivateKey);
        
        WATER water = new WATER(
            deployer,           // initial owner
            creditAddress,      // CREDIT token address
            initialConversionRate // 100 CREDIT per 1 ETH
        );
        
        vm.stopBroadcast();
        
        console.log("WATER contract deployed to:", address(water));
        console.log("Deployer address:", deployer);
        console.log("CREDIT token address:", creditAddress);
        console.log("Initial conversion rate:", initialConversionRate);
        console.log("Rate: 100 CREDIT per 1 ETH");
    }
}
