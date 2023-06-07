import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { LoadingBox } from './LoadingBox';
import { CenteredBoxContent } from '../../components/CenteredBoxContent/CenteredBoxContent';

export interface LoadingViewProps {
  loadingText: string;
}
export function LoadingView({ loadingText }: LoadingViewProps) {
  return (
    <SimpleLayout>
      <CenteredBoxContent testId="loading-view">
        <LoadingBox loadingText={loadingText} />
      </CenteredBoxContent>
    </SimpleLayout>
  );
}
