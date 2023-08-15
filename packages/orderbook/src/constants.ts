// Consumers might want an estimated gas limit for fulfilling an order
// without calling the transaction builder. This is an estimate that
// should work for all fulfillment scenarios.
const ESTIMATED_FULFILLMENT_GAS_GWEI = 400_000;

export const constants = {
  estimatedFulfillmentGasGwei: ESTIMATED_FULFILLMENT_GAS_GWEI,
};
