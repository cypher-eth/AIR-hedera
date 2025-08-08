import { defineChain } from "viem";

export const hederaTestnet = /*#__PURE__*/ defineChain({
  id: 10143,
  network: "hedera-testnet",
  name: "Hedera",
  iconUrl: "/icons/monad-icon.png",
  nativeCurrency: { name: "USDC", symbol: "USD", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://hedera-testnet.rpc.thirdweb.com/"],
    },

    public: {
      http: ["https://hedera-testnet.rpc.thirdweb.com/"],
    },
  },
  blockExplorers: {
    etherscan: {
      name: "Hashscan",
      url: "https://hashscan.io/testnet",
    },
    default: {
      name: "Hashscan",
      url: "https://hashscan.io/testnet",
    },
  },
  contracts: {
    // ensRegistry: {
    //   address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    // },
    // ensUniversalResolver: {
    //   address: "0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62",
    //   blockCreated: 16966585,
    // },
    // multicall3: {
    //   address: "0xcA11bde05977b3631167028862bE2a173976CA11",
    //   blockCreated: 251449,
    // },
  },
  testnet: true,
});
