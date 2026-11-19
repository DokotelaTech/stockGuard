let apiClient = null;

// Inject the backend client when its API contract is available; this module assumes no endpoints.
export function configureApiClient(client) {
  apiClient = client;
}

export function getApiClient() {
  if (!apiClient) {
    throw new Error("The backend API client has not been configured.");
  }
  return apiClient;
}
