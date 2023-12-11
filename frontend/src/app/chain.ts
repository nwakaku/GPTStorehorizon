import { Chain } from 'wagmi';

export const xrplEvm = {
  id: 1440002,
  name: 'XRPL EVM',
  network: 'xrplEvmSidechain',
  nativeCurrency: {
    decimals: 18,
    name: 'XRP',
    symbol: 'XRP',
  },
  rpcUrls: {
    public: { http: ['https://rpc-evm-sidechain.xrpl.org/'] },
    default: { http: ['https://rpc-evm-sidechain.xrpl.org/'] },
  },
  blockExplorers: {
    etherscan: { name: 'XRPL EVM Sidechain Explorer', url: 'https://evm-sidechain.xrpl.org' },
    default: { name: 'XRPL EVM Sidechain Explorer', url: 'https://evm-sidechain.xrpl.org' },
  },
  contracts: {
    multicall3: {
      // Adjust the address and blockCreated accordingly
      address: '0x123abc456def789',
      blockCreated: 12_345_678,
    },
    // Add more contracts if needed
  },
} as const satisfies Chain;
