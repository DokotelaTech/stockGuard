import { useState } from "react";
import { StockContext } from "./stockContext";

export function StockProvider({ children }) {
  const [stock, setStock] = useState(null);
  return (
    <StockContext.Provider value={{ stock, setStock }}>
      {children}
    </StockContext.Provider>
  );
}
