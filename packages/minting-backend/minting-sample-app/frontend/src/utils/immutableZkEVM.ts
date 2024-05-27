import { Provider } from "@imtbl/sdk/passport";

export async function getImxBalance(zkEVMProvider: Provider) {
  const getBalanceResponse = await zkEVMProvider.request({ method: 'eth_getBalance' });
  console.log("get balance response: ", getBalanceResponse);
  return getBalanceResponse;
}