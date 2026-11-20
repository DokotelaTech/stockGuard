import { createBlockchainService } from "./blockchain/createBlockchainService";
import { createTraceabilityReader } from "./blockchain/traceabilityReader";

function createUnavailableService(domain) {
  return new Proxy(
    {},
    {
      get(target, property) {
        if (typeof property !== "string") return undefined;
        return async () => {
          throw new Error(
            `The ${domain} service is not connected to a backend yet.`,
          );
        };
      },
    },
  );
}

export function createApiClient() {
  return {
    auth: createUnavailableService("auth"),
    inventory: createUnavailableService("inventory"),
    forecasts: createUnavailableService("forecasts"),
    transfers: createUnavailableService("transfers"),
    blockchain: createBlockchainService(createTraceabilityReader()),
  };
}
