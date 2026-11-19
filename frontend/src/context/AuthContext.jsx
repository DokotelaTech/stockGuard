import { useMemo, useState } from "react";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  // Keep the UI flow in memory until the authentication API is connected.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const value = useMemo(
    () => ({
      isAuthenticated,
      signIn: () => setIsAuthenticated(true),
      signOut: () => setIsAuthenticated(false),
    }),
    [isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
