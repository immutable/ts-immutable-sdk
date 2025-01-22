import { useContext, useEffect } from 'react';
import { Stack, ButtCon } from '@biom3/react';
import { Checkout, PurchaseItem } from '@imtbl/checkout-sdk';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { PurchaseContext } from '../context/PurchaseContext';
import { PurchaseItemHero } from '../components/PurchaseItemHero';

interface PurchaseProps {
  checkout: Checkout;
  environmentId: string;
  showBackButton?: boolean;
  onCloseButtonClick?: () => void;
  onBackButtonClick?: () => void;
}

export function Purchase({
  checkout,
  environmentId,
  onCloseButtonClick,
  showBackButton,
  onBackButtonClick,
}: PurchaseProps) {
  const { purchaseState: { items, quote } } = useContext(PurchaseContext);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log({
      checkout,
      environmentId,
    });
  }, [checkout, environmentId]);

  useEffect(() => {
    if (!quote) return;
    // eslint-disable-next-line no-console
    console.log('Order quote fetched', {
      quote,
    });
  }, [quote]);

  const shouldShowBackButton = showBackButton && onBackButtonClick;

  const totalQty = items?.reduce((sum, item: PurchaseItem) => sum + item.qty, 0) || 0;

  return (
    <SimpleLayout
      containerSx={{ bg: 'transparent' }}
      header={(
        <Stack
          direction="row"
          sx={{
            pos: 'absolute',
            w: '100%',
            top: '0',
            pt: 'base.spacing.x4',
            px: 'base.spacing.x5',
          }}
          justifyContent="flex-start"
        >
          {shouldShowBackButton && (
            <ButtCon
              testId="backButton"
              icon="ArrowBackward"
              variant="tertiary"
              size="small"
              onClick={onBackButtonClick}
            />
          )}
          <ButtCon
            variant="tertiary"
            size="small"
            icon="Close"
            onClick={onCloseButtonClick}
            sx={{ ml: 'auto' }}
          />
        </Stack>
      )}
    >
      <Stack alignItems="center" sx={{ flex: 1 }}>
        <Stack
          testId="topSection"
          sx={{
            flex: 1,
            px: 'base.spacing.x2',
            w: '100%',
            pt: 'base.spacing.x1',
          }}
          justifyContent="center"
          alignItems="center"
        >
          <PurchaseItemHero items={items} totalQty={totalQty} />
        </Stack>
      </Stack>
    </SimpleLayout>
  );
}
