import { getApiClient } from "./api";

export function getForecast(query) {
  return getApiClient().forecasts.get(query);
}

export function getExpiryInsights() {
  return getApiClient().forecasts.expiryInsights();
}
