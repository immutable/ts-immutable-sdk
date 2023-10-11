import React, { useEffect, useState } from "react";
import { Body, Box, Button, Card, StatefulButtCon } from "@biom3/react";
import { NFT } from "@imtbl/generated-clients/dist/multi-rollup";

function ItemCard({
  nft,
  onClick,
  withQtySelector
}: {
  nft: any;
  onClick?: (nft: NFT, quantity: number) => void;
  isSelected?: (nft: NFT) => boolean;
  withQtySelector?: boolean;
}) {
  const [quantity, setQuantity] = useState<number>(1);

  const onCardClick = (nft: NFT) => {
    if (quantity === 0) return;

    onClick && onClick(nft, quantity);
  };

  return (
    <Box>
      <Card>
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
      {withQtySelector && (<Box>
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
              quantity > 1 && setQuantity(quantity - 1);
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
      </Box>)}
    </Box>
  );
}

export default ItemCard;
