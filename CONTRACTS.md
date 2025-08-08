# Smart Contracts Documentation

## Deployed Contracts on Hedera Testnet

### Contract Addresses

This document contains the addresses of all deployed contracts on the Hedera Testnet.

## Deployed Contracts

| Contract | Address | Description |
|----------|---------|-------------|
| CREDIT Token | `0x9f9DF6958fDcC7F772799AB0D2b3CF01EE47C021` | ERC20 token with role-based access control |
| GMNFT Contract | `0x086eB9C3152fBb5E338F872B9207F7173252a88F` | NFT contract that mints CREDIT tokens |
| WATER Contract | `0xDd38ffa0738E778b31fE3874791Ea090E832300c` | HBAR to CREDIT token swap contract |

## Network Configuration

- **Network**: Hedera Testnet
- **Chain ID**: 296
- **RPC URL**: https://testnet.hashio.io/api
- **Block Explorer**: https://hashscan.io/testnet

## Role Configuration

The following addresses have been granted specific roles on the CREDIT token:

| Address | Role | Status |
|---------|------|--------|
| `0x2Da15ef1a356B1916D26b573D6Dbe3A619af68a2` | CREDIT Owner | ✅ |
| `0x086eB9C3152fBb5E338F872B9207F7173252a88F` | CREDIT Minter | ✅ |
| `0xDd38ffa0738E778b31fE3874791Ea090E832300c` | CREDIT Minter | ✅ |
| `0x2Da15ef1a356B1916D26b573D6Dbe3A619af68a2` | CREDIT Operator | ✅ |

## Contract Functions

### CREDIT Token (`0x9f9DF6958fDcC7F772799AB0D2b3CF01EE47C021`)

#### Minting Functions
- `mint(address to, uint256 amount)` - Mint CREDIT tokens (minter only)
- `operatorBurn(address from, uint256 amount)` - Burn CREDIT tokens (operator only)

#### Query Functions
- `balanceOf(address account)` - Get CREDIT balance for an account
- `totalSupply()` - Get total CREDIT supply
- `decimals()` - Get token decimals (18)
- `name()` - Get token name ("CREDIT")
- `symbol()` - Get token symbol ("CREDIT")

#### Role Management
- `addMinter(address minter)` - Add minter role (owner only)
- `removeMinter(address minter)` - Remove minter role (owner only)
- `addOperator(address operator)` - Add operator role (owner only)
- `removeOperator(address operator)` - Remove operator role (owner only)
- `isMinter(address minter)` - Check if address is minter
- `isOperator(address operator)` - Check if address is operator

### GMNFT Contract (`0x086eB9C3152fBb5E338F872B9207F7173252a88F`)

#### Core Functions
- `mint()` - Mint NFT and CREDIT tokens
- `canMint(address user)` - Check if user can mint

#### Configuration
- **Name**: "GM NFT"
- **Symbol**: "GMNFT"
- **Max Supply**: 1000
- **CREDIT Token**: `0x9f9DF6958fDcC7F772799AB0D2b3CF01EE47C021`

### WATER Contract (`0xDd38ffa0738E778b31fE3874791Ea090E832300c`)

#### Swap Functions
- `purchaseTokens()` - Swap HBAR for CREDIT tokens
- `calculateCreditAmount(uint256 ethAmount)` - Calculate CREDIT amount for given HBAR

#### Management Functions
- `setConversionRate(uint256 newRate)` - Update conversion rate (owner only)
- `claimFunds()` - Claim HBAR from contract (owner only)
- `getContractInfo()` - Get contract information

#### Configuration
- **Conversion Rate**: 100 CREDIT per 1 HBAR
- **CREDIT Token**: `0x9f9DF6958fDcC7F772799AB0D2b3CF01EE47C021`

## Deployment Commands

### Full Deployment
```bash
forge script script/DeployAll.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000
```

### Individual Deployments
```bash
# Deploy CREDIT
forge script script/DeployCredit.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000

# Deploy GMNFT
forge script script/DeployGMNFT.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000

# Deploy WATER
forge script script/DeployWATER.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000
```

### Role Setup
```bash
# Setup all roles
forge script script/SetupRoles.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000

# Add WATER as minter only
forge script script/AddWaterMinter.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000
```

## API Integration

### Burn API
- **Endpoint**: `/api/burn`
- **Method**: POST
- **Function**: `operatorBurn(address user, uint256 amount)`
- **Contract**: CREDIT Token

### Example Request
```json
{
  "burnAmount": "1.5",
  "user": "0x1234567890123456789012345678901234567890"
}
```

## Environment Variables

Required for deployment:
```bash
PRIVATE_KEY=0x6a521cc5bb557709bc14fa7f45052c05e5022d24641511d4407f426a2c2f8c04
```

## Recent Deployment History

- **2024-01-XX**: Initial deployment with role-based access control
- **2024-01-XX**: Added WATER contract for HBAR to CREDIT swapping
- **2024-01-XX**: Configured all role relationships
- **2024-01-XX**: Updated RPC to Hashio for better performance
- **2024-01-XX**: Doubled gas limit for improved transaction processing
