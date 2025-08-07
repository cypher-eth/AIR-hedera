// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/CREDIT.sol";

contract DeployCredit is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        CREDIT credit = new CREDIT(deployer);
        
        vm.stopBroadcast();
        
        console.log("CREDIT token deployed to:", address(credit));
        console.log("Deployer address:", deployer);
    }
} 