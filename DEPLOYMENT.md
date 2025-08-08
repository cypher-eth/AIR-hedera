# Contract Deployment Information

## Deployed Contracts on Hedera Testnet (Chain ID: 296)

### Contract Addresses

- **CREDIT Token**: `0xDdDF82a67A934cE809a754783affE9f35c0D0545`
- **GMNFT Contract**: `0xF7FDCCDBB32DbEcCBaBC5f346AB67Ce1C892012f`
- **WATER Contract**: `0xa21FCeF30b868D5825B2506253eF2afc9AC80FCD`

### RPC Configuration

- **Primary RPC URL**: `https://testnet.hashio.io/api`
- **Alternative Fast RPCs**:
  - `https://testnet.arkhia.io/hedera/json-rpc/v1`
  - `https://testnet.calaxy.com/hedera/json-rpc/v1`
  - `https://testnet-rpc.myhbarwallet.com`
- **Gas Limit**: `60,000,000`
- **Gas Price**: `1,000,000,000,000` (1000 gwei - high priority)

### Role Configuration

- **CREDIT Owner**: `0x2Da15ef1a356B1916D26b573D6Dbe3A619af68a2`
- **GMNFT**: Minter of CREDIT ✅
- **WATER**: Minter of CREDIT ✅
- **Deployer**: Operator of CREDIT ✅

## 🚀 Deployment Strategies for Faster Transactions

### Strategy 1: Use Alternative RPC Endpoints
```bash
# Try different RPC endpoints for better performance
forge script script/DeployAll.s.sol --rpc-url hedera_testnet_fast --broadcast --gas-limit 60000000
forge script script/DeployAll.s.sol --rpc-url hedera_testnet_calaxy --broadcast --gas-limit 60000000
forge script script/DeployAll.s.sol --rpc-url hedera_testnet_myhbarwallet --broadcast --gas-limit 60000000
```

### Strategy 2: Sequential Deployment (Recommended)
```bash
# Deploy contracts one by one with delays
forge script script/DeploySequential.s.sol --rpc-url hedera_testnet_fast --broadcast --gas-limit 60000000
```

### Strategy 3: Individual Deployments
```bash
# Deploy contracts individually
forge script script/DeployCredit.s.sol --rpc-url hedera_testnet_fast --broadcast --gas-limit 60000000
forge script script/DeployGMNFT.s.sol --rpc-url hedera_testnet_fast --broadcast --gas-limit 60000000
forge script script/DeployWATER.s.sol --rpc-url hedera_testnet_fast --broadcast --gas-limit 60000000
```

### Strategy 4: Resume Failed Deployments
```bash
# Resume from where you left off
forge script script/DeployAll.s.sol --resume --rpc-url hedera_testnet_fast --broadcast --gas-limit 60000000
```

## 🔧 Troubleshooting Deployment Issues

### If Transactions Get Stuck:
1. **Try Alternative RPC**: Switch to `hedera_testnet_fast`, `hedera_testnet_calaxy`, or `hedera_testnet_myhbarwallet`
2. **Use Sequential Deployment**: Deploy contracts one by one with `DeploySequential.s.sol`
3. **Increase Gas Price**: Already set to 1000 gwei for high priority
4. **Wait and Resume**: Use `--resume` flag to continue from where you left off
5. **Check Network Status**: Hedera Testnet can be congested during peak times

### Common Error Solutions:
- **"Insufficient CREDIT balance"**: This is expected during deployment, not an error
- **"Address is already a minter"**: Some roles were already set in previous deployments
- **"Transaction stuck"**: Try alternative RPC endpoints or wait and resume

## 📋 Standard Deployment Commands

### Deploy All Contracts
```bash
forge script script/DeployAll.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000
```

### Deploy Individual Contracts
```bash
# Deploy CREDIT
forge script script/DeployCredit.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000

# Deploy GMNFT
forge script script/DeployGMNFT.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000

# Deploy WATER
forge script script/DeployWATER.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000
```

### Setup Roles
```bash
forge script script/SetupRoles.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000
```

### Contract Functions

#### CREDIT Token
- `mint(address to, uint256 amount)` - Mint CREDIT tokens (minter only)
- `burn(uint256 amount)` - Burn tokens from caller
- `burnFrom(address from, uint256 amount)` - Burn tokens from specific address (owner only)
- `burnCredits(uint256 amount)` - Burn CREDIT tokens and track
- `operatorBurn(address user, uint256 amount)` - Operator burn function
- `addMinter(address minter)` - Add minter (owner only)
- `removeMinter(address minter)` - Remove minter (owner only)
- `addOperator(address operator)` - Add operator (owner only)
- `removeOperator(address operator)` - Remove operator (owner only)

#### GMNFT Contract
- `mint()` - Mint NFT and CREDIT tokens
- `canMint(address user)` - Check if user can mint

#### WATER Contract
- `purchaseTokens()` - Swap HBAR for CREDIT tokens
- `setConversionRate(uint256 newRate)` - Set conversion rate (owner only)
- `setCreditToken(address newCreditToken)` - Set CREDIT token address (owner only)
- `claimFunds()` - Claim accumulated HBAR (owner only)
- `calculateCreditAmount(uint256 ethAmount)` - Calculate CREDIT amount for HBAR
- `getContractInfo()` - Get contract information

### Environment Variables

Required environment variables:
- `PRIVATE_KEY` - Deployer private key

### Network Configuration

- **Chain ID**: 296 (Hedera Testnet)
- **Currency**: HBAR
- **Block Time**: ~2 seconds
- **Gas Limit**: 60,000,000
- **Gas Price**: 660 gwei

### Recent Deployments

- **CREDIT**: Deployed successfully with role-based access control
- **GMNFT**: Deployed successfully, configured as CREDIT minter
- **WATER**: Deployed successfully, configured as CREDIT minter
- **Roles**: All role assignments completed successfully

### API Endpoints

- **Burn API**: `/api/burn` - Burn CREDIT tokens using operatorBurn
- **Voice API**: `/api/ai/voice` - AI voice processing
- **Test API**: `/api/test-n8n` - N8N workflow testing 