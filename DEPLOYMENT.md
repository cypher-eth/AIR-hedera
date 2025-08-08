# Deployment Guide

## Overview

This guide explains how to properly deploy the CREDIT and GMNFT contracts with the correct ownership relationship.

## The Issue

The GMNFT contract needs to be the owner of the CREDIT contract to mint tokens. If this relationship is not set up correctly, minting will fail with a transaction revert error.

## Deployment Options

### Option 1: Deploy Everything Together (Recommended)

Use the comprehensive deployment script that sets up everything correctly:

```bash
npm run deploy:all
```

This script:
1. Deploys CREDIT token with deployer as initial owner
2. Deploys GMNFT contract
3. Transfers CREDIT ownership to GMNFT contract
4. Verifies the setup

### Option 2: Deploy Separately

If you need to deploy contracts separately:

```bash
# Deploy CREDIT first
npm run deploy:credit

# Deploy GMNFT (you'll need to set CREDIT_ADDRESS in your .env)
npm run deploy:gmnft

# Fix ownership relationship
npm run fix:ownership
```

### Option 3: Fix Existing Deployment

If you already have contracts deployed but they're not working:

```bash
npm run fix:ownership
```

This script transfers CREDIT ownership to the GMNFT contract.

## Environment Variables

Make sure you have these environment variables set:

```bash
PRIVATE_KEY=your_private_key_here
CREDIT_ADDRESS=0x...  # Only needed for separate deployment
GMNFT_ADDRESS=0x...   # Only needed for separate deployment
```

## Verification

After deployment, you can verify the setup by checking:

1. **CREDIT contract owner** should be the GMNFT contract address
2. **GMNFT creditToken** should point to the CREDIT contract address

## Troubleshooting

### Common Issues

1. **"execution reverted" error**: Usually means CREDIT ownership is not set correctly
2. **"Daily mint limit reached"**: You've already minted today, wait for cooldown
3. **"Max supply reached"**: All NFTs have been minted

### Debugging

The frontend includes debugging information. Check the browser console for:
- CREDIT contract owner
- GMNFT contract status
- Mint eligibility status

## Contract Addresses

Current deployed addresses (Hedera Testnet):
- **CREDIT**: `0xff1704BE90F5864e20e1Ceaa95FfB1f3d7673875`
- **GMNFT**: `0x136BA3DbB43B21aabc681E270B3893Eae807c705`

## Testing

After deployment, test the setup:

1. Try minting a GM NFT
2. Check if CREDIT tokens are received
3. Try burning CREDIT tokens with the water feature

If minting fails, run the fix ownership script and try again. 