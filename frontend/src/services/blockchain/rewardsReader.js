import { rewardsAbi } from "./rewardsAbi";
import { rewardsConfig } from "./rewardsConfig";

const bscTestnet = {
  id: rewardsConfig.chainId,
  name: "BNB Smart Chain Testnet",
  nativeCurrency: { name: "BNB", symbol: "tBNB", decimals: 18 },
  rpcUrls: {
    default: { http: [rewardsConfig.rpcUrl] },
  },
};

let publicClientPromise = null;

function getPublicClient() {
  if (!publicClientPromise) {
    publicClientPromise = import("viem").then(({ createPublicClient, http }) =>
      createPublicClient({
        chain: bscTestnet,
        transport: http(rewardsConfig.rpcUrl),
      }),
    );
  }
  return publicClientPromise;
}

function rethrowReadError(error) {
  const message =
    typeof error?.shortMessage === "string" ? error.shortMessage : "";
  if (message.includes("returned no data")) {
    throw new Error(
      `No rewards contract found at ${rewardsConfig.contractAddress} on BNB Smart Chain Testnet. Check VITE_REWARDS_CONTRACT_ADDRESS.`,
      { cause: error },
    );
  }
  throw error;
}

export function createRewardsReader() {
  return {
    async listPharmacies() {
      const client = await getPublicClient();
      const address = rewardsConfig.contractAddress;

      try {
        const count = Number(
          await client.readContract({
            address,
            abi: rewardsAbi,
            functionName: "pharmacyCount",
          }),
        );

        const pharmacies = await Promise.all(
          Array.from({ length: count }, async (_, index) => {
            const pharmacyAddress = await client.readContract({
              address,
              abi: rewardsAbi,
              functionName: "pharmacyAt",
              args: [BigInt(index)],
            });
            const [pharmacyName, points, claimed, exists] =
              await client.readContract({
                address,
                abi: rewardsAbi,
                functionName: "getPharmacy",
                args: [pharmacyAddress],
              });
            const claimable = await client.readContract({
              address,
              abi: rewardsAbi,
              functionName: "claimableOf",
              args: [pharmacyAddress],
            });

            return {
              address: pharmacyAddress,
              name: pharmacyName,
              points: Number(points),
              claimed: Number(claimed),
              claimable: Number(claimable),
              exists,
            };
          }),
        );

        const [symbol, totalSupply] = await Promise.all([
          client.readContract({
            address,
            abi: rewardsAbi,
            functionName: "symbol",
          }),
          client.readContract({
            address,
            abi: rewardsAbi,
            functionName: "totalSupply",
          }),
        ]);

        return {
          symbol,
          totalSupply: Number(totalSupply),
          pharmacies,
        };
      } catch (error) {
        rethrowReadError(error);
      }
    },
  };
}
