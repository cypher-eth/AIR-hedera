// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/CREDIT.sol";

contract AddWaterMinter is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Contract addresses
        address creditAddress = 0x37805D217B7FFd09099d51711C246E2624EB6a9f;
        address waterAddress = 0x13e26834E78a1Cf31B0C1DCEa485547ED88aA336; // Deployed WATER address
        
        vm.startBroadcast(deployerPrivateKey);
        
        CREDIT credit = CREDIT(creditAddress);
        
        // Add WATER as a minter to CREDIT with higher gas
        credit.addMinter{gas: 5000000}(waterAddress);
        console.log("WATER added as minter to CREDIT");
        
        vm.stopBroadcast();
        
        console.log("=== Role Setup Complete ===");
        console.log("CREDIT token:", creditAddress);
        console.log("WATER contract:", waterAddress);
        console.log("WATER is now a minter of CREDIT");
    }
}

/*
Deployment command using configured RPC with higher gas:
forge script script/AddWaterMinter.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000

Contract Addresses:
- CREDIT: 0x37805D217B7FFd09099d51711C246E2624EB6a9f
- WATER: 0x13e26834E78a1Cf31B0C1DCEa485547ED88aA336
*/
