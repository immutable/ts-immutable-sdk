import React from "react";
import { Body, Box, Card, StatefulButtCon } from "@biom3/react";
import { NFT } from "@imtbl/generated-clients/dist/multi-rollup";

const selectedStyle = {
  border: "base.border.size.100 solid",
  borderColor: "base.color.accent.1",
};

function ItemCard({
  nft,
  onClick,
  isSelected,
}: {
  nft: any;
  onClick?: (nft: NFT) => void;
  isSelected?: (nft: NFT) => boolean;
}) {
  const onCardClick = (nft: NFT) => {
    onClick && onClick(nft);
  };

  return (
    <Box>
      <Card
        onClick={() => onCardClick(nft)}
        sx={isSelected && isSelected(nft) ? selectedStyle : {}}
      >
        <Card.Title>
          <div>{nft.name}</div>
          <div>Token {nft.token_id}</div>
        </Card.Title>
        <Card.Caption>USDC ${nft.price}</Card.Caption>
        <Card.AssetImage
          imageUrl={nft.image}
          aspectRatio="4:3"
          relativeImageSizeInLayout="60vw"
        />
      </Card>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <StatefulButtCon icon="Add" />
        <Body>1</Body>
        <StatefulButtCon icon="Minus" />
      </Box>
    </Box>
  );
}

export default ItemCard;
