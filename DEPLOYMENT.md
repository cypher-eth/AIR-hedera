# Smart Contract Deployment Guide

This guide explains how to deploy the CREDIT ERC20 token and the updated GM NFT contract to Hedera Testnet using Foundry.

## Prerequisites

1. **Foundry** - For smart contract compilation and deployment
2. **Yarn** - Package manager
3. **Hedera Testnet Account** - With HBAR for gas fees
4. **Private Key** - For signing transactions

## Contract Overview

### CREDIT Token (ERC20)
- **Name**: CREDIT
- **Symbol**: CREDIT
- **Features**: Standard ERC20 with minting capability (owner only)
- **Location**: `contracts/CREDIT.sol`

### GM NFT Contract (Updated)
- **Name**: GM NFT
- **Features**: ERC721 with daily minting limit + CREDIT token integration
- **CREDIT Integration**: Mints 10 CREDIT tokens per NFT mint
- **Location**: `contracts/GMNFT.sol`

## Setup Foundry

### 1. Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. Initialize Foundry Project

```bash
forge init --no-commit
```

### 3. Install Dependencies

```bash
forge install OpenZeppelin/openzeppelin-contracts
```

### 4. Configure Foundry

Update `foundry.toml`:

```toml
[profile.default]
src = "contracts"
out = "out"
libs = ["lib"]
solc_version = "0.8.19"
optimizer = true
optimizer_runs = 200

[rpc_endpoints]
hedera_testnet = "https://testnet.hashio.io/api"

[etherscan]
hedera_testnet = { key = "" }
```

### 5. Install OpenZeppelin Contracts

```bash
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

## Deployment Steps

### 1. Create Deployment Scripts

Create `script/DeployCredit.s.sol`:

```solidity
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
```

Create `script/DeployGMNFT.s.sol`:

```solidity
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
```

### 2. Set Environment Variables

Create `.env` file:

```env
PRIVATE_KEY=your_private_key_here
CREDIT_ADDRESS=your_deployed_credit_address_here
```

Load environment variables:

```bash
source .env
```

### 3. Build Contracts

```bash
forge build
```

### 4. Deploy CREDIT Token First

```bash
forge script script/DeployCredit.s.sol:DeployCredit --rpc-url https://testnet.hashio.io/api --broadcast --verify
```

### 5. Update Environment Variables

After deploying CREDIT, update your `.env` file with the deployed address:

```env
PRIVATE_KEY=your_private_key_here
CREDIT_ADDRESS=0x... # Your deployed CREDIT address
```

### 6. Deploy GM NFT Contract

```bash
forge script script/DeployGMNFT.s.sol:DeployGMNFT --rpc-url https://testnet.hashio.io/api --broadcast --verify
```

### 7. Update Contract Addresses

After deployment, update the addresses in `app/constants/contracts.ts`:

```typescript
export const GMNFT_ADDRESS = 'YOUR_DEPLOYED_GMNFT_ADDRESS';
export const CREDIT_ADDRESS = 'YOUR_DEPLOYED_CREDIT_ADDRESS';
```

## Alternative: Using Yarn Scripts

### 1. Add Scripts to package.json

```json
{
  "scripts": {
    "deploy:credit": "forge script script/DeployCredit.s.sol:DeployCredit --rpc-url https://testnet.hashio.io/api --broadcast --verify",
    "deploy:gmnft": "forge script script/DeployGMNFT.s.sol:DeployGMNFT --rpc-url https://testnet.hashio.io/api --broadcast --verify",
    "build:contracts": "forge build",
    "test:contracts": "forge test"
  }
}
```

### 2. Deploy Using Yarn

```bash
# Build contracts
yarn build:contracts

# Deploy CREDIT token
yarn deploy:credit

# Deploy GM NFT (after updating CREDIT_ADDRESS in .env)
yarn deploy:gmnft
```

## Testing Contracts

### 1. Create Test File

Create `test/GMNFT.t.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/GMNFT.sol";
import "../contracts/CREDIT.sol";

contract GMNFTTest is Test {
    GMNft public gmnft;
    CREDIT public credit;
    address public user = address(1);
    address public owner = address(2);

    function setUp() public {
        credit = new CREDIT(owner);
        gmnft = new GMNft("GM NFT", "GMNFT", 1000, owner, address(credit));
    }

    function testMintNFTAndReceiveCredits() public {
        vm.startPrank(user);
        
        uint256 initialBalance = credit.balanceOf(user);
        gmnft.mint();
        
        uint256 finalBalance = credit.balanceOf(user);
        assertEq(finalBalance - initialBalance, 10, "Should receive 10 CREDIT tokens");
        
        vm.stopPrank();
    }
}
```

### 2. Run Tests

```bash
forge test
```

## Verification

### 1. Verify on Hedera Explorer

After deployment, verify your contracts on [Hedera Explorer](https://hashscan.io/testnet):

1. Go to the contract address
2. Click "Verify Contract"
3. Upload the source code
4. Provide constructor arguments

### 2. Verify Contract Functions

```bash
# Check CREDIT token functions
cast call <CREDIT_ADDRESS> "name()" --rpc-url https://testnet.hashio.io/api
cast call <CREDIT_ADDRESS> "symbol()" --rpc-url https://testnet.hashio.io/api

# Check GM NFT functions
cast call <GMNFT_ADDRESS> "name()" --rpc-url https://testnet.hashio.io/api
cast call <GMNFT_ADDRESS> "getCreditPerMint()" --rpc-url https://testnet.hashio.io/api
```

## Testing the Integration

1. **Connect Wallet**: Use your Web3 wallet connected to Hedera Testnet
2. **Mint NFT**: Click the GM button to mint an NFT
3. **Check CREDIT Balance**: The debug panel will show your CREDIT token balance
4. **Verify**: You should receive 10 CREDIT tokens per NFT mint

## Important Notes

- **Daily Limit**: Users can only mint one NFT per day (60 seconds in testnet)
- **CREDIT Minting**: Only the GM NFT contract owner can mint CREDIT tokens
- **Gas Fees**: Ensure your wallet has sufficient HBAR for transactions
- **Network**: Make sure you're on Hedera Testnet (Chain ID: 296)

## Troubleshooting

### Common Issues

1. **"Contract not found"**: Check if the contract address is correct and deployed
2. **"Insufficient funds"**: Add more HBAR to your wallet
3. **"Wrong network"**: Switch to Hedera Testnet in your wallet
4. **"Daily mint limit"**: Wait for the cooldown period to expire
5. **"Forge not found"**: Install Foundry using the curl command above

### Debug Information

Right-click the GM button to see debug information including:
- Chain ID
- Contract existence
- CREDIT balance
- Mint status
- Error messages

### Foundry Commands Reference

```bash
# Build contracts
forge build

# Run tests
forge test

# Deploy script
forge script <script_name> --rpc-url <url> --broadcast

# Verify contract
forge verify-contract <address> <contract_name> --chain-id 296

# Get contract bytecode
cast code <address> --rpc-url https://testnet.hashio.io/api
``` 