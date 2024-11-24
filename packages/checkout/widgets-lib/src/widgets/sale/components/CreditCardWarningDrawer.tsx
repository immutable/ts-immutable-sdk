import {
  Body, Box, ButtCon, Button, Drawer, Heading,
} from '@biom3/react';
import { SalePaymentTypes } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { CreditCardWarningHero } from '../../../components/Hero/CreditCardWarningHero';
import { useSaleContext } from '../context/SaleContextProvider';

export function CreditCardWarningDrawer() {
  const { t } = useTranslation();
  const { showCreditCardWarning, setShowCreditCardWarning, setPaymentMethod } = useSaleContext();

  const handleCtaButtonClick = () => {
    setPaymentMethod(SalePaymentTypes.CREDIT);
  };

  return (
    <Drawer
      size="threeQuarter"
      visible={showCreditCardWarning}
      showHeaderBar={false}
    >
      <Drawer.Content>
        <ButtCon
          icon="Close"
          variant="tertiary"
          sx={{
            pos: 'absolute',
            top: 'base.spacing.x5',
            left: 'base.spacing.x5',
            backdropFilter: 'blur(30px)',
          }}
          onClick={() => setShowCreditCardWarning(false)}
        />
        <CreditCardWarningHero />
        <Box sx={{ px: 'base.spacing.x12' }}>
          <Heading
            sx={{
              marginTop: 'base.spacing.x6',
              marginBottom: 'base.spacing.x2',
              textAlign: 'center',
            }}
          >
            {t('views.PAYMENT_METHODS.creditCardWarningDrawer.heading')}
          </Heading>
          <Body
            size="medium"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: 'base.color.text.body.secondary',
              marginBottom: 'base.spacing.x13',
            }}
          >
            {t('views.PAYMENT_METHODS.creditCardWarningDrawer.body')}
          </Body>
          <Button
            sx={{ width: '100%' }}
            testId="credit-card-button"
            variant="primary"
            size="large"
            onClick={handleCtaButtonClick}
          >
            {t('views.PAYMENT_METHODS.creditCardWarningDrawer.ctaButton')}
          </Button>
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}
