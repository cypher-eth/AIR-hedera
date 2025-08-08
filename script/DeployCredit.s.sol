// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/CREDIT.sol";

contract DeployCredit is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Get the intended owner from environment (default to deployer if not set)
        address owner = vm.envOr("CREDIT_OWNER", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        CREDIT credit = new CREDIT(owner);
        
        vm.stopBroadcast();
        
        console.log("CREDIT token deployed to:", address(credit));
        console.log("Deployer address:", deployer);
        console.log("CREDIT owner address:", owner);
    }
} 