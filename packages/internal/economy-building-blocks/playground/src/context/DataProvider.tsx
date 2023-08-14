import { createContext, useCallback, useContext, useState } from "react";
import { BlockchainData } from "@imtbl/blockchain-data";
import { ImmutableConfiguration, Environment } from "@imtbl/config";
import {
  ListNFTsResult,
} from "@imtbl/generated-clients/dist/multi-rollup";

const blockchainData = new BlockchainData({
  baseConfig: new ImmutableConfiguration({
    environment: Environment.SANDBOX,
  }),
  overrides: {
    basePath: "https://indexer-mr.dev.imtbl.com",
  },
});

const DataContext = createContext<{
  getNFTs: (account: string, contract: string) => Promise<ListNFTsResult | undefined>;
}>({
  getNFTs: (_account: string, _contract: string) => Promise.resolve(undefined),
});

export function DataProvider({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  const getNFTs = useCallback(async (account: string, contract: string) => {
    return await blockchainData?.listNFTsByAccountAddress({
      accountAddress: account,
      contractAddress: contract,
      chainName: "imtbl-zkevm-devnet",
    });
  }, []);

  return (
    <DataContext.Provider value={{ getNFTs }}>{children}</DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
