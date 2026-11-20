export function createTraceabilityAdapter(reader) {
  if (!reader || typeof reader.readBatchTrace !== "function") {
    throw new Error("A traceability reader must expose readBatchTrace(batchId).");
  }

  return {
    async getBatchTrace(batchId) {
      const id = String(batchId ?? "").trim();
      if (!id) throw new Error("A batch ID is required to load a trace.");
      return reader.readBatchTrace(id);
    },
  };
}
