import { getApiClient } from "./api";

export function listTransfers(query) {
  return getApiClient().transfers.list(query);
}

export function createTransfer(transfer) {
  return getApiClient().transfers.create(transfer);
}
