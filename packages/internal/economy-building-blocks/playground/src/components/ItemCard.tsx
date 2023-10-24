import React, { useEffect, useState } from "react";
import { Body, Box, Button, Card, StatefulButtCon } from "@biom3/react";
import { NFT } from "@imtbl/generated-clients/dist/multi-rollup";

function ItemCard({
  nft,
  onClick,
  withQtySelector,
  isSelected
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
      <Card sx={{ display: 'none' }}>
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
      <div className="css-cqup3" onClick={() => onCardClick(nft)}
      style={{
        outlineWidth: isSelected?.(nft) ? '2px' : '0px',
        outlineStyle: 'solid',
        outlineColor: 'white',
        borderRadius: '10px',
      }}>
        <div className="css-1u8qly9">
          <article className="css-zpyvxu">
            <span className="cardAssetImage css-amte1t">
              <span className="css-zgpek2">
                <img className="css-fw1t4m" loading="lazy" src={nft.image} />
              </span>
            </span>
            <span
              className="textContainer css-tybo5r"
              data-testid="undefined__textContainer"
            >
              <span className="css-g4id49">
                <div>{nft.name}</div>
                <div>Token {nft.token_id}</div>
              </span>
              <span className="css-1uc40v0">DC ${nft.price}</span>
            </span>
          </article>
        </div>
      </div>
      {/* {withQtySelector && (<Box>
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
      </Box>)} */}
    </Box>
  );
}

export default ItemCard;
