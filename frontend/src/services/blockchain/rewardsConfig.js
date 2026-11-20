const env = import.meta.env;

function readString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function readChainId(value) {
  const chainId = Number(value);
  return Number.isInteger(chainId) && chainId > 0 ? chainId : null;
}

export const rewardsConfig = {
  network: readString(env.VITE_REWARDS_NETWORK) || "bsc-testnet",
  chainId: readChainId(env.VITE_REWARDS_CHAIN_ID) ?? 97,
  rpcUrl:
    readString(env.VITE_REWARDS_RPC_URL) ||
    "https://data-seed-prebsc-1-s1.binance.org:8545",
  explorerUrl:
    readString(env.VITE_REWARDS_EXPLORER_URL) || "https://testnet.bscscan.com",
  contractAddress: readString(env.VITE_REWARDS_CONTRACT_ADDRESS),
};

export function isRewardsConfigured() {
  return Boolean(rewardsConfig.rpcUrl && rewardsConfig.contractAddress);
}
