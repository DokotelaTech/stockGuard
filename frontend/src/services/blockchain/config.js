const env = import.meta.env;

function readString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function readChainId(value) {
  const chainId = Number(value);
  return Number.isInteger(chainId) && chainId > 0 ? chainId : null;
}

export const blockchainConfig = {
  network: readString(env.VITE_BLOCKCHAIN_NETWORK),
  chainId: readChainId(env.VITE_BLOCKCHAIN_CHAIN_ID),
  rpcUrl: readString(env.VITE_BLOCKCHAIN_RPC_URL),
  explorerUrl: readString(env.VITE_BLOCKCHAIN_EXPLORER_URL),
  traceabilityAddress: readString(env.VITE_TRACEABILITY_CONTRACT_ADDRESS),
};

export function isBlockchainConfigured() {
  return Boolean(
    blockchainConfig.network &&
      blockchainConfig.rpcUrl &&
      blockchainConfig.traceabilityAddress,
  );
}
