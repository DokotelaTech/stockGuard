import { useContext } from "react";
import { StockContext } from "../context/stockContext.js";

export default function useStock() {
  const stock = useContext(StockContext);
  if (!stock) throw new Error("useStock must be used inside StockProvider.");
  return stock;
}
