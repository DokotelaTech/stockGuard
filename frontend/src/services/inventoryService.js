import { getApiClient } from "./api";

export function listInventory(query) {
  return getApiClient().inventory.list(query);
}

export function getMedicine(id) {
  return getApiClient().inventory.get(id);
}
