import { blockchainConfig } from "./config";
import { traceabilityAbi } from "./traceabilityAbi";

const avalancheFuji = {
  id: blockchainConfig.chainId ?? 43113,
  name: "Avalanche Fuji",
  nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
  rpcUrls: {
    default: { http: [blockchainConfig.rpcUrl] },
  },
};

let publicClientPromise = null;

function getPublicClient() {
  if (!publicClientPromise) {
    publicClientPromise = import("viem").then(({ createPublicClient, http }) =>
      createPublicClient({
        chain: avalancheFuji,
        transport: http(blockchainConfig.rpcUrl),
      }),
    );
  }
  return publicClientPromise;
}

export function createTraceabilityReader() {
  return {
    async readBatchTrace(batchId) {
      const client = await getPublicClient();
      let result;
      try {
        result = await client.readContract({
          address: blockchainConfig.traceabilityAddress,
          abi: traceabilityAbi,
          functionName: "getBatchTrace",
          args: [batchId],
        });
      } catch (error) {
        const message =
          typeof error?.shortMessage === "string" ? error.shortMessage : "";
        if (message.includes("returned no data")) {
          throw new Error(
            `No contract found at ${blockchainConfig.traceabilityAddress} on Avalanche Fuji. Check VITE_TRACEABILITY_CONTRACT_ADDRESS.`,
            { cause: error },
          );
        }
        throw error;
      }

      const [
        medicineName,
        manufacturer,
        status,
        expiryDate,
        owner,
        updatedAt,
      ] = result;

      if (!medicineName) {
        throw new Error(`Batch ${batchId} was not found on-chain.`);
      }

      return {
        batchId,
        medicineName,
        manufacturer,
        status,
        expiryDate,
        owner,
        updatedAt: Number(updatedAt) * 1000,
      };
    },
  };
}
