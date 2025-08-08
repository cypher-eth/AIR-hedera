# Deployment Scripts

This directory contains Foundry deployment scripts for the AIR-hedera project.

## Environment Variables

All scripts require the following environment variables to be set:

### Required Variables

- `PRIVATE_KEY`: Your private key for deployment (without 0x prefix)

### Optional Variables (for scripts that reference existing contracts)

- `CREDIT_ADDRESS`: Address of the deployed CREDIT token
- `GMNFT_ADDRESS`: Address of the deployed GMNFT contract  
- `WATER_ADDRESS`: Address of the deployed WATER contract
- `CREDIT_OWNER`: Owner address for CREDIT token (defaults to deployer if not set)

## Scripts Overview

### Deployment Scripts

1. **`DeployCredit.s.sol`** - Deploy CREDIT token only
   - Requires: `PRIVATE_KEY`
   - Optional: `CREDIT_OWNER`

2. **`DeployGMNFT.s.sol`** - Deploy GMNFT contract
   - Requires: `PRIVATE_KEY`, `CREDIT_ADDRESS`

3. **`DeployWATER.s.sol`** - Deploy WATER contract
   - Requires: `PRIVATE_KEY`, `CREDIT_ADDRESS`

4. **`DeployAll.s.sol`** - Deploy all contracts in sequence
   - Requires: `PRIVATE_KEY`
   - Deploys: CREDIT → GMNFT → WATER → Setup roles

5. **`DeployFixed.s.sol`** - Deploy all contracts with fixes
   - Requires: `PRIVATE_KEY`
   - Deploys: CREDIT → GMNFT → WATER → Setup roles

6. **`DeployOptimized.s.sol`** - Deploy with optimized gas settings
   - Requires: `PRIVATE_KEY`
   - Deploys: CREDIT → GMNFT → WATER → Setup roles

7. **`DeploySequential.s.sol`** - Deploy with delays between steps
   - Requires: `PRIVATE_KEY`
   - Deploys: CREDIT → GMNFT → WATER → Setup roles

### Setup Scripts

8. **`SetupRoles.s.sol`** - Setup minter roles
   - Requires: `PRIVATE_KEY`, `CREDIT_ADDRESS`, `GMNFT_ADDRESS`, `WATER_ADDRESS`

9. **`AddWaterMinter.s.sol`** - Add WATER as minter to CREDIT
   - Requires: `PRIVATE_KEY`, `CREDIT_ADDRESS`, `WATER_ADDRESS`

10. **`FixOwnership.s.sol`** - Transfer CREDIT ownership to GMNFT
    - Requires: `PRIVATE_KEY`, `CREDIT_ADDRESS`, `GMNFT_ADDRESS`

## Usage Examples

### Set Environment Variables

```bash
# Required
export PRIVATE_KEY="your_private_key_here"

# Optional (for scripts that reference existing contracts)
export CREDIT_ADDRESS="0xDdDF82a67A934cE809a754783affE9f35c0D0545"
export GMNFT_ADDRESS="0xF7FDCCDBB32DbEcCBaBC5f346AB67Ce1C892012f"
export WATER_ADDRESS="0xa21FCeF30b868D5825B2506253eF2afc9AC80FCD"
```

### Deploy All Contracts

```bash
forge script script/DeployAll.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000
```

### Deploy Individual Contracts

```bash
# Deploy CREDIT
forge script script/DeployCredit.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000

# Deploy GMNFT (requires CREDIT_ADDRESS)
forge script script/DeployGMNFT.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000

# Deploy WATER (requires CREDIT_ADDRESS)
forge script script/DeployWATER.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000
```

### Setup Roles

```bash
# Setup all roles (requires all addresses)
forge script script/SetupRoles.s.sol --rpc-url hedera_testnet --broadcast --gas-limit 60000000
```

## Notes

- All scripts use environment variables instead of hardcoded addresses
- Scripts that deploy multiple contracts use dynamic addresses from previous deployments
- Gas limits are set to 60,000,000 for Hedera compatibility
- Some scripts include delays between deployments for better reliability
