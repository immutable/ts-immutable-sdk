import React, { useEffect, useState } from "react";
import { Body, Box, Button, Card, StatefulButtCon } from "@biom3/react";
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
  onClick?: (nft: NFT, quantity: number) => void;
  isSelected?: (nft: NFT) => boolean;
}) {
  const [quantity, setQuantity] = useState<number>(0);

  const onCardClick = (nft: NFT) => {
    if (quantity === 0) return;

    onClick && onClick(nft, quantity);
  };

  return (
    <Box>
      <Card sx={isSelected && isSelected(nft) ? selectedStyle : {}}>
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
      <Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <StatefulButtCon
            icon="Minus"
            onClick={() => {
              quantity > 0 ? setQuantity(quantity - 1) : setQuantity(0);
            }}
          />
          <Body>{quantity}</Body>
          <StatefulButtCon
            icon="Add"
            onClick={() => setQuantity(quantity + 1)}
          />
          <Button size={"medium"} onClick={() => onCardClick(nft)}>
            Add
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default ItemCard;
