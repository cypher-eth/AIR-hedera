# Smart Contracts Documentation

## Deployed Contracts on Hedera Testnet

### Contract Addresses

| Contract | Address | Description |
|----------|---------|-------------|
| CREDIT Token | `0x37805D217B7FFd09099d51711C246E2624EB6a9f` | ERC20 token with role-based access control |
| GMNFT Contract | `0x98db66DdB483BBAc7956702aA1A4BD43c95493f1` | NFT contract that mints CREDIT tokens |
| WATER Contract | `0x13e26834E78a1Cf31B0C1DCEa485547ED88aA336` | HBAR to CREDIT token swap contract |

### Network Configuration

- **Network**: Hedera Testnet
- **Chain ID**: 296
- **RPC URL**: `https://testnet.hashio.io/api`
- **Gas Limit**: 60,000,000
- **Gas Price**: 660 gwei

### Role Configuration

| Address | Role | Status |
|---------|------|--------|
| `0x2Da15ef1a356B1916D26b573D6Dbe3A619af68a2` | CREDIT Owner | ✅ |
| `0x98db66DdB483BBAc7956702aA1A4BD43c95493f1` | CREDIT Minter | ✅ |
| `0x13e26834E78a1Cf31B0C1DCEa485547ED88aA336` | CREDIT Minter | ✅ |
| `0x2Da15ef1a356B1916D26b573D6Dbe3A619af68a2` | CREDIT Operator | ✅ |

## Contract Functions

### CREDIT Token (`0x37805D217B7FFd09099d51711C246E2624EB6a9f`)

#### Minting Functions
- `mint(address to, uint256 amount)` - Mint CREDIT tokens (minter only)
- `addMinter(address minter)` - Add minter (owner only)
- `removeMinter(address minter)` - Remove minter (owner only)

#### Burning Functions
- `burn(uint256 amount)` - Burn tokens from caller
- `burnFrom(address from, uint256 amount)` - Burn tokens from specific address (owner only)
- `burnCredits(uint256 amount)` - Burn CREDIT tokens and track
- `operatorBurn(address user, uint256 amount)` - Operator burn function

#### Operator Functions
- `addOperator(address operator)` - Add operator (owner only)
- `removeOperator(address operator)` - Remove operator (owner only)

#### View Functions
- `getUserBurnedCredits(address user)` - Get total CREDIT burned by user
- `getTotalBurnedCredits()` - Get total CREDIT burned globally
- `isMinter(address minter)` - Check if address is minter
- `isOperator(address operator)` - Check if address is operator

### GMNFT Contract (`0x98db66DdB483BBAc7956702aA1A4BD43c95493f1`)

#### Core Functions
- `mint()` - Mint NFT and CREDIT tokens
- `canMint(address user)` - Check if user can mint

#### Configuration
- **Name**: "GM NFT"
- **Symbol**: "GMNFT"
- **Max Supply**: 1000
- **CREDIT Token**: `0x37805D217B7FFd09099d51711C246E2624EB6a9f`

### WATER Contract (`0x13e26834E78a1Cf31B0C1DCEa485547ED88aA336`)

#### Swap Functions
- `purchaseTokens()` - Swap HBAR for CREDIT tokens
- `calculateCreditAmount(uint256 ethAmount)` - Calculate CREDIT amount for HBAR

#### Admin Functions
- `setConversionRate(uint256 newRate)` - Set conversion rate (owner only)
- `setCreditToken(address newCreditToken)` - Set CREDIT token address (owner only)
- `claimFunds()` - Claim accumulated HBAR (owner only)

#### View Functions
- `getContractInfo()` - Get contract information
- `conversionRate()` - Get current conversion rate
- `creditToken()` - Get CREDIT token address

#### Configuration
- **Conversion Rate**: 100 CREDIT per 1 HBAR
- **CREDIT Token**: `0x37805D217B7FFd09099d51711C246E2624EB6a9f`

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
