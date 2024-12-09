import { ERC721TokenType, Link } from '@imtbl/imx-sdk';
import React, { createContext, useCallback, useContext, useMemo } from 'react';

interface LinkContextType {
  setupLink?: () => Promise<string | undefined>;
  burn?: (nfts: { tokenId: string; tokenAddress: string }[]) => Promise<void>;
}

const LinkContext = createContext<LinkContextType>({});

export const LinkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const link = new Link('https://link.sandbox.x.immutable.com');
  const setupLink = useCallback(async () => {
    let result;
    try {
      result = await link.setup({})
      console.log(result)
    }
    catch (error) {
      console.error(error)
    }
    console.log('MetaMask connected');

    return result?.address;
  }, [link]);

  const burn = useCallback(async (nfts: { tokenId: string; tokenAddress: string }[]) => {
    try {
      if (link) {
        await link.batchNftTransfer(
          nfts.map(nft => ({
            type: ERC721TokenType.ERC721,
            tokenId: nft.tokenId,
            tokenAddress: nft.tokenAddress,
            toAddress: process.env.NEXT_PUBLIC_BURN_ADDRESS || '',
          }))
        );
      } else {
        console.log('No link instance available');
        return;
      }
      console.log('NFTs burned');
      
    } catch (error) {
      console.error('Error burning NFTs:', error);
    }
  }, [link]);

  const providerValue = useMemo(() => {
    console.log('LinkProvider: Creating provider value');
    return {
      setupLink,
      burn,
    };
  }, [setupLink, burn]);

  return (
    <LinkContext.Provider value={providerValue}>
      {children}
    </LinkContext.Provider>
  );
};

export const useLink = () => {
  return useContext(LinkContext);
}; 