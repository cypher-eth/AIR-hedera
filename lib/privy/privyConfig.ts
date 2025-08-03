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
};
