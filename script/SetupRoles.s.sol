// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/CREDIT.sol";

contract SetupRoles is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Get contract addresses from environment variables
        address creditAddress = vm.envAddress("CREDIT_ADDRESS");
        address gmnftAddress = vm.envAddress("GMNFT_ADDRESS");
        address waterAddress = vm.envAddress("WATER_ADDRESS");
        
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

Environment variables needed:
- PRIVATE_KEY: Your private key
- CREDIT_ADDRESS: Address of the deployed CREDIT token
- GMNFT_ADDRESS: Address of the deployed GMNFT contract
- WATER_ADDRESS: Address of the deployed WATER contract
*/
