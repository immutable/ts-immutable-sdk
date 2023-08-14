import React from "react";
import { Card } from "@biom3/react";
import { NFT } from "@imtbl/generated-clients/dist/multi-rollup";

const selectedStyle = {border: "base.border.size.100 solid", borderColor: "base.color.accent.1"}

function ItemCard({
  nft,
  onClick,
  isSelected,
}: {
  nft: NFT;
  onClick?: (nft: NFT) => void;
  isSelected?: (nft: NFT) => boolean;
}) {
  const onCardClick = (nft: NFT) => {
    onClick && onClick(nft);
  };

  return (
    <Card onClick={() => onCardClick(nft)} sx={isSelected && isSelected(nft) ? selectedStyle : {}}>
      <Card.Title>
        <div>{nft.name}</div>
        <div>Token {nft.token_id}</div>
      </Card.Title>
      <Card.Caption>{nft.description}</Card.Caption>
      <Card.AssetImage
        imageUrl={nft.image}
        aspectRatio="4:3"
        relativeImageSizeInLayout="60vw"
      />
    </Card>
  );
}

export default ItemCard;
