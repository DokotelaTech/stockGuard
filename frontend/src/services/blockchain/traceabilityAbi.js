export const traceabilityAbi = [
  {
    name: "getBatchTrace",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "batchId", type: "string" }],
    outputs: [
      { name: "medicineName", type: "string" },
      { name: "manufacturer", type: "string" },
      { name: "status", type: "string" },
      { name: "expiryDate", type: "string" },
      { name: "owner", type: "address" },
      { name: "updatedAt", type: "uint256" },
    ],
  },
];
