import { getApiClient } from "./api";

export function signIn(credentials) {
  return getApiClient().auth.signIn(credentials);
}

export function register(account) {
  return getApiClient().auth.register(account);
}
