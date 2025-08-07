# Environment Setup Guide

This guide will help you fix the Privy authentication error and set up your environment variables.

## 🔧 Fixing the Privy Error

The error "Cannot initialize the Privy provider with an invalid Privy app ID" occurs because the required environment variables are missing.

### Step 1: Create Environment File

Create a `.env.local` file in your project root:

```bash
touch .env.local
```

### Step 2: Add Required Environment Variables

Add the following to your `.env.local` file:

```env
# Privy Configuration
# Get your Privy App ID from https://console.privy.io/
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# n8n Workflow Configuration
# Your n8n workflow endpoint for AI processing
N8N_WORKFLOW_URL=your_n8n_workflow_url_here

# WalletConnect Configuration (Optional)
# Get from https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Smart Contract Deployment (for Foundry)
PRIVATE_KEY=your_private_key_here
CREDIT_ADDRESS=your_deployed_credit_address_here
```

## 🔑 Getting Your Privy App ID

1. **Go to Privy Console**: Visit [https://console.privy.io/](https://console.privy.io/)
2. **Sign In**: Create an account or sign in
3. **Create New App**: Click "Create New App"
4. **Configure App**:
   - **App Name**: Your app name (e.g., "AIR Hedera")
   - **App URL**: `http://localhost:3000` (for development)
   - **Redirect URL**: `http://localhost:3000` (for development)
5. **Copy App ID**: Copy the App ID from your dashboard
6. **Update .env.local**: Replace `your_privy_app_id_here` with your actual App ID

## 🚀 Quick Setup Commands

```bash
# Create environment file
echo "# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# n8n Workflow Configuration
N8N_WORKFLOW_URL=your_n8n_workflow_url_here

# WalletConnect Configuration (Optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Smart Contract Deployment (for Foundry)
PRIVATE_KEY=your_private_key_here
CREDIT_ADDRESS=your_deployed_credit_address_here" > .env.local
```

## 🔄 Restart Development Server

After creating the `.env.local` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart
yarn dev
```

## ✅ Verification

After setting up the environment variables:

1. **Check Console**: No more Privy errors should appear
2. **Test Authentication**: Try connecting a wallet
3. **Check Network**: Ensure you're on Hedera Testnet (Chain ID: 296)

## 🛠️ Troubleshooting

### Common Issues

1. **"Invalid Privy App ID"**:
   - Make sure you copied the App ID correctly from Privy Console
   - Check that `.env.local` is in the project root
   - Restart the development server

2. **"Environment variable not found"**:
   - Ensure the variable name starts with `NEXT_PUBLIC_` for client-side access
   - Check for typos in variable names

3. **"App not found"**:
   - Verify your App URL and Redirect URL in Privy Console
   - Make sure you're using the correct App ID

### Development vs Production

- **Development**: Use `http://localhost:3000` for App URL and Redirect URL
- **Production**: Update to your actual domain in Privy Console

## 📝 Optional Configuration

### n8n Workflow URL
If you want to use the AI voice features, set up an n8n workflow and add the URL to `N8N_WORKFLOW_URL`.

### WalletConnect Project ID
For enhanced wallet connectivity, get a Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/) and add it to `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.

### Smart Contract Deployment
For deploying the CREDIT and GM NFT contracts, add your private key and contract addresses to the respective environment variables. 