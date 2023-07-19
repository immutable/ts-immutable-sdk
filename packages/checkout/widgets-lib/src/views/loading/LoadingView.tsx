import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { LoadingBox } from './LoadingBox';
import { CenteredBoxContent } from '../../components/CenteredBoxContent/CenteredBoxContent';
import { FooterLogo } from '../../components/Footer/FooterLogo';

export interface LoadingViewProps {
  loadingText: string;
  showFooterLogo?: boolean;
}
export function LoadingView({ loadingText, showFooterLogo }: LoadingViewProps) {
  return (
    <SimpleLayout
      footer={(
        <FooterLogo hideLogo={!showFooterLogo} />
      )}
    >
      <CenteredBoxContent testId="loading-view">
        <LoadingBox loadingText={loadingText} />
      </CenteredBoxContent>
    </SimpleLayout>
  );
}
