import { Sticker, Pile, FramedImage } from '@biom3/react';
import { PurchaseItem } from '@imtbl/checkout-sdk';

interface PurchaseItemHeroProps {
  items: PurchaseItem[];
}

export function PurchaseItemHero({ items }: PurchaseItemHeroProps) {
  if (items.length === 0) {
    return null;
  }

  const totalQty = items?.reduce((sum, item: PurchaseItem) => sum + item.qty, 0) || 0;

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
