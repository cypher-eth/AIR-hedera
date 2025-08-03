import { getAlchemyHttpUrl } from '@/utils/networks';
import {createConfig} from '@privy-io/wagmi';
import { baseSepolia, hardhat, hederaPreviewnet } from 'wagmi/chains';
import { Chain, createClient, http } from "viem";

export const wagmiConfig = createConfig({
  chains: [hederaPreviewnet],
  ssr: true,
  client({ chain }) {
    return createClient({
      chain,
      transport: http(),
      // ...(chain.id !== (hardhat as Chain).id
      //   ? {
      //       pollingInterval: 5000,
      //     }
      //   : {}),
    });
  },
});