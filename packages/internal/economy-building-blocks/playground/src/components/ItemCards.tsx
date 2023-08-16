import React from "react";
import { GridBox, Box } from "@biom3/react";
import ItemCard from "./ItemCard";
import { NFT } from "@imtbl/generated-clients/dist/multi-rollup";

function ItemCards({
  nfts,
  onClick,
  isSelected,
}: {
  nfts: Array<NFT>;
  onClick: (nft: NFT) => void;
  isSelected: (nft: NFT) => boolean;
}) {
  return (
    <GridBox sx={{ height: "150px" }}>
      {nfts && nfts.map((nft) => (
        <Box key={nft.token_id} sx={{ w: "100%", h: "100%" }}>
          <ItemCard nft={nft} onClick={onClick} isSelected={isSelected} />
        </Box>
      ))}
    </GridBox>
  );
}

export default ItemCards;
