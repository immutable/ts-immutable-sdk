import {
  Sticker, Pile, FramedImage, Heading, Body, Stack,
} from '@biom3/react';
import { PurchaseItem } from '@imtbl/checkout-sdk';
import { useContext, useEffect, useState } from 'react';
import { CryptoFiatContext } from '../../../context/crypto-fiat-context/CryptoFiatContext';
import { PurchaseContext } from '../context/PurchaseContext';
import { calculateCryptoToFiat } from '../../../lib/utils';

interface StickerDisplayProps {
  items: PurchaseItem[];
  totalQty: number;
}

export function PurchaseItemHero({ items, totalQty }: StickerDisplayProps) {
  if (items.length === 0) {
    return null;
  }

  const { purchaseState: { quote } } = useContext(PurchaseContext);
  const { cryptoFiatState: { conversions } } = useContext(CryptoFiatContext);

  const [detailsLoading, setDetailsLoading] = useState(true);
  const [fiatPrice, setFiatPrice] = useState<string | undefined>(undefined);

  const item = items[0];

  useEffect(() => {
    if (!quote?.totalCurrencyAmount || !conversions) return;

    const fiatPriceConversion = calculateCryptoToFiat(
      String(quote.totalCurrencyAmount),
      quote.currency.name,
      conversions,
    );

    setFiatPrice(fiatPriceConversion);
    setDetailsLoading(false);
  }, [quote, conversions]);

  return (
    <Stack sx={{ gap: '0', alignItems: 'center' }}>
      {totalQty > 1 ? (
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
                w: 'base.spacing.x33',
                h: 'base.spacing.x33',
                mb: 'base.spacing.x4',
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
            w: 'base.spacing.x33',
            h: 'base.spacing.x33',
            mb: 'base.spacing.x4',
          }}
        />
      )}

      <Body size="large">
        {item.name}
      </Body>
      {detailsLoading ? (
        <>
          <Heading size="small" shimmer={1} />
          <Body size="xSmall" shimmer={1} />
        </>
      ) : (
        <>
          {fiatPrice && (
            <Heading size="small">
              USD $
              {fiatPrice}
            </Heading>
          )}
          {quote?.totalCurrencyAmount && (
            <Body size="xSmall">
              {quote.currency.name}
              {' '}
              {quote.totalCurrencyAmount}
            </Body>
          )}
        </>
      )}
    </Stack>
  );
}
