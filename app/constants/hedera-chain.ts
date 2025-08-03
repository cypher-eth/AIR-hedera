import { defineChain } from "viem";

export const monadTestnet = /*#__PURE__*/ defineChain({
  id: 10143,
  network: "hedera-testnet",
  name: "Monad",
  iconUrl: "/icons/monad-icon.png",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://monad-testnet.g.alchemy.com/v2/x7iUhgklQAemjWcmuUBNMePhOuI17Ymt"],
      webSocket: ["wss://monad-testnet.g.alchemy.com/v2/x7iUhgklQAemjWcmuUBNMePhOuI17Ymt"],
    },

    public: {
      http: ["https://monad-testnet.g.alchemy.com/v2/x7iUhgklQAemjWcmuUBNMePhOuI17Ymt"],
      webSocket: ["wss://monad-testnet.g.alchemy.com/v2/x7iUhgklQAemjWcmuUBNMePhOuI17Ymt"],
    },
  },
  blockExplorers: {
    etherscan: {
      name: "Etherscan",
      url: "https://testnet.monadexplorer.com/",
    },
    blocscan: {
      name: "Blocscan",
      url: "https://explorer.monad-testnet.category.xyz",
    },
    default: {
      name: "Blocscan",
      url: "https://explorer.monad-testnet.category.xyz",
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
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 251449,
    },
  },
  testnet: true,
});
