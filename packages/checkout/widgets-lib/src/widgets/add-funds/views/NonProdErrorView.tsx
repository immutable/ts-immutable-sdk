import { Box } from '@biom3/react';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { NoServiceHero } from '../../../components/Hero/NoServiceHero';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';

export interface NonProdErrorViewProps {
  onCloseClick: () => void;
}

export function NonProdErrorView({ onCloseClick }: NonProdErrorViewProps) {
  return (
    <SimpleLayout
      header={
        <HeaderNavigation transparent onCloseButtonClick={onCloseClick} />
      }
      heroContent={<NoServiceHero />}
      floatHeader
      footer={<FooterLogo />}
      testId="service-unavailable-error-view"
    >
      <SimpleTextBody heading="This service is not avaliable in non prod environment" />

      <Box
        testId="button-container"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      />
    </SimpleLayout>
  );
}
