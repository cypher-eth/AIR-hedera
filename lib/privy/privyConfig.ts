import type {PrivyClientConfig} from '@privy-io/react-auth';
import { hederaPreviewnet } from 'wagmi/chains';

export const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    // requireUserPasswordOnCreate: true,
    showWalletUIs: true
  },
  // loginMethods: ['wallet', 'email'],
  appearance: {
    showWalletLoginFirst: true
  },
  loginMethodsAndOrder: {
    primary: ['email', 'metamask'],          
  },
  defaultChain: hederaPreviewnet,
  supportedChains: [hederaPreviewnet],
};
