import { getApiClient } from "./api";

export function getBatchTrace(batchId) {
  return getApiClient().blockchain.getBatchTrace(batchId);
}
