import { getApiClient } from "./api";

export function getForecast(query) {
  return getApiClient().forecasts.get(query);
}
