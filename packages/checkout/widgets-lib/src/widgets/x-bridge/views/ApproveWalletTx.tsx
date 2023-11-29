import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { WalletApproveHero } from 'components/Hero/WalletApproveHero';
import { Box, Button } from '@biom3/react';
import { FooterLogo } from 'components/Footer/FooterLogo';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { text } from '../../../resources/text/textConfig';

export function ApproveWalletTx() {
  const { heading, body, footer } = text.views[XBridgeWidgetViews.APPROVE_TX];

  return (
    <SimpleLayout
      testId="bridge-coming-soon"
      header={<HeaderNavigation transparent showBack />}
      heroContent={<WalletApproveHero />}
      floatHeader
      footer={(
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            paddingX: 'base.spacing.x4',
            width: '100%',
          }}
        >
          <Button size="large" variant="secondary" sx={{ width: '100%' }}>
            {footer.buttonText}
          </Button>
          <FooterLogo />
        </Box>
      )}
    >
      <SimpleTextBody heading={heading}>
        {body}
      </SimpleTextBody>
    </SimpleLayout>
  );
}
