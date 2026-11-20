import { isBlockchainConfigured } from "./config";
import { createTraceabilityAdapter } from "./traceabilityAdapter";

function createUnavailableService(message) {
  return {
    getBatchTrace: async () => {
      throw new Error(message);
    },
  };
}

export function createBlockchainService(reader) {
  if (!isBlockchainConfigured()) {
    return createUnavailableService(
      "Blockchain traceability is not configured. Set VITE_BLOCKCHAIN_* and VITE_TRACEABILITY_CONTRACT_ADDRESS.",
    );
  }

  if (!reader) {
    return createUnavailableService(
      "Blockchain traceability is configured but no contract reader is available.",
    );
  }

  const adapter = createTraceabilityAdapter(reader);
  return {
    getBatchTrace: (batchId) => adapter.getBatchTrace(batchId),
  };
}
