import { createConfig } from '@privy-io/wagmi';
import { defineChain, createClient, http } from 'viem';

export const hederaTestnet296 = defineChain({
  id: 296,
  name: 'HederaTestnet',
  network: 'hedera-testnet',
  nativeCurrency: { name: 'USD', symbol: 'USD', decimals: 18 },
  rpcUrls: {
    default: { http: [
      'https://testnet.hashio.io/api',
      'https://testnet.hedera.com',
      'https://testnet.hedera.com/api'
    ] },
    public: { http: [
      'https://testnet.hashio.io/api',
      'https://testnet.hedera.com',
      'https://testnet.hedera.com/api'
    ] },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/testnet' },
  },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [hederaTestnet296],
  ssr: true,
  client({ chain }) {
    return createClient({
      chain,
      transport: http(),
    });
  },
});