import { useRef, useEffect, useCallback } from "react";
import { GridBox, Box } from "@biom3/react";
import ItemCard from "./ItemCard";
import { NFT } from "@imtbl/generated-clients/dist/multi-rollup";

function ItemCards({
  nfts,
  onClick,
  isSelected,
  onRefetch,
}: {
  nfts: Array<NFT>;
  onClick?: (nft: NFT, quantity: number) => void;
  isSelected?: (nft: NFT) => boolean;
  onRefetch?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        onRefetch?.();
      }
    },
    [ref]
  );

  useEffect(() => {
    if (!ref.current) return;

    observer.current = new IntersectionObserver(onIntersect, {
      threshold: 0.5,
    });

    return () => {
      observer.current!.disconnect();
    };
  }, [ref]);

  return (
    <>
      <GridBox
        sx={{ height: "max-content", maxHeight: "50vh", overflowY: "scroll" }}
        minColumnWidth="15%"
        onLoadCapture={() => {
          if (ref.current && observer.current) {
            observer.current!.observe(ref.current!);
          }
        }}
      >
        {nfts &&
          nfts.map((nft, index) => (
            <Box sx={{ w: "100%", h: "100%" }}>
              <ItemCard
                nft={nft}
                onClick={onClick}
                isSelected={isSelected}
                key={nft.token_id}
              />
            </Box>
          ))}
        <span
          ref={ref}
          style={{ visibility: "hidden", height: "100px", width: "100%" }}
        />
      </GridBox>
    </>
  );
}

export default ItemCards;
