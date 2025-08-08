// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/CREDIT.sol";

contract FixOwnership is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Get contract addresses from environment
        address creditAddress = vm.envAddress("CREDIT_ADDRESS");
        address gmnftAddress = vm.envAddress("GMNFT_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Get CREDIT contract instance
        CREDIT credit = CREDIT(creditAddress);
        
        // Transfer ownership to GMNFT contract
        credit.transferOwnership(gmnftAddress);
        
        vm.stopBroadcast();
        
        console.log("CREDIT ownership transferred to GMNFT contract");
        console.log("CREDIT address:", creditAddress);
        console.log("GMNFT address:", gmnftAddress);
        console.log("Deployer address:", deployer);
    }
}
