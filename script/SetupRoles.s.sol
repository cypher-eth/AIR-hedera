// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/CREDIT.sol";

contract SetupRoles is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Contract addresses from successful deployments
        address creditAddress = 0x37805D217B7FFd09099d51711C246E2624EB6a9f;
        address gmnftAddress = 0x98db66DdB483BBAc7956702aA1A4BD43c95493f1;
        address waterAddress = 0x13e26834E78a1Cf31B0C1DCEa485547ED88aA336; // New WATER address
        
        vm.startBroadcast(deployerPrivateKey);
        
        CREDIT credit = CREDIT(creditAddress);
        
        // Add GMNFT as a minter to CREDIT with higher gas
        credit.addMinter{gas: 5000000}(gmnftAddress);
        console.log("GMNFT added as minter to CREDIT");
        
        // Add WATER as a minter to CREDIT with higher gas
        credit.addMinter{gas: 5000000}(waterAddress);
        console.log("WATER added as minter to CREDIT");
        
        vm.stopBroadcast();
        
        console.log("=== Role Setup Complete ===");
        console.log("CREDIT token:", creditAddress);
        console.log("GMNFT contract:", gmnftAddress);
        console.log("WATER contract:", waterAddress);
        console.log("Both GMNFT and WATER are now minters of CREDIT");
    }
}

/*
Deployment command using configured RPC with higher gas:
forge script script/SetupRoles.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000
*/
