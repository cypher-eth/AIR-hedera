# AIR-hedera

A decentralized application built on Hedera Hashgraph for AI-powered voice interactions and token management.

## Deployed Contracts

- **CREDIT Token**: `0x9f9DF6958fDcC7F772799AB0D2b3CF01EE47C021`
- **GMNFT Contract**: `0x086eB9C3152fBb5E338F872B9207F7173252a88F`
- **WATER Contract**: `0xDd38ffa0738E778b31fE3874791Ea090E832300c`

### Network Configuration

- **RPC URL**: `https://testnet.hashio.io/api`
- **Gas Limit**: 60,000,000
- **Gas Price**: 660 gwei

## 📋 Features

### CREDIT Token
- ERC20 token with role-based access control
- Minting functionality for authorized contracts
- Burning functionality with tracking
- Operator burn function for external management

### GMNFT Contract
- NFT minting with CREDIT token rewards
- Daily mint limits and cooldown periods
- Integration with CREDIT token for rewards

### WATER Contract
- HBAR to CREDIT token swapping
- Fixed conversion rate (100 CREDIT per 1 HBAR)
- Owner-controlled rate adjustment
- Fund claiming functionality

### API Endpoints
- `/api/burn` - Burn CREDIT tokens using operatorBurn
- `/api/ai/voice` - AI voice processing
- `/api/test-n8n` - N8N workflow testing

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Foundry
- Hedera Testnet account

### Environment Variables
```bash
PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_PRIVY_APP_SECRET=your_privy_app_secret
```

### Installation
```bash
npm install
forge install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
forge build
```

## 🚀 Deployment

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

## 📚 Documentation

- [Contract Documentation](./CONTRACTS.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Environment Setup](./ENVIRONMENT_SETUP.md)

## 🔧 Configuration

### Foundry Configuration
The project uses a configured RPC endpoint in `foundry.toml`:
```toml
[rpc_endpoints]
hedera_testnet = "https://testnet.hashio.io/api"
```

### Gas Optimization
- Gas limit: 60,000,000 (doubled for better transaction processing)
- Gas price: 660 gwei (optimized for Hedera Testnet)

## 🎯 Current Status

✅ **All contracts deployed successfully**
✅ **Role relationships configured**
✅ **RPC optimized for performance**
✅ **Gas configuration optimized**
✅ **API endpoints functional**
✅ **Build system working**

## 📝 Recent Updates

- **RPC Migration**: Switched to Hashio RPC for better performance
- **Gas Optimization**: Doubled gas limit for improved transaction processing
- **Role Management**: Implemented comprehensive role-based access control
- **WATER Contract**: Added HBAR to CREDIT token swapping functionality
- **Documentation**: Comprehensive contract and deployment documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
