import { Sticker, Pile, FramedImage } from '@biom3/react';
import { PurchaseItem } from '../types';

interface StickerDisplayProps {
  items: PurchaseItem[];
  totalQty: number;
}

export function PurchaseItemHero({ items, totalQty }: StickerDisplayProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    totalQty > 1 ? (
      <Sticker position={{ x: 'right', y: 'bottomInside' }}>
        <Pile>
          <FramedImage
            use={(
              <img
                src={items[0].image}
                alt={items[0].name}
              />
            )}
            sx={{
              w: 'base.spacing.x30',
              h: 'base.spacing.x30',
            }}
            emphasized
          />
        </Pile>
        <Sticker.Badge badgeContent={`x${totalQty}`} variant="light" />
      </Sticker>
    ) : (
      <FramedImage
        use={(
          <img
            src={items[0].image}
            alt={items[0].name}
          />
        )}
        sx={{
          w: 'base.spacing.x30',
          h: 'base.spacing.x30',
        }}
        emphasized
      />
    )
  );
}
