import type {PrivyClientConfig} from '@privy-io/react-auth';
import { hederaTestnet296 } from '../wagmi/wagmiConfig';

export const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    showWalletUIs: true
  },
  appearance: {
    showWalletLoginFirst: true
  },
  loginMethodsAndOrder: {
    primary: ['email', 'metamask'],
  },
  defaultChain: hederaTestnet296,
  supportedChains: [hederaTestnet296],
  // Add configuration to prevent multiple WalletConnect initializations
  walletConnectCloudProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
};
