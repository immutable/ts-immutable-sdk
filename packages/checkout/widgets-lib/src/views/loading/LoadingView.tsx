import { LoadingOverlay } from '@biom3/react';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';

export interface LoadingViewProps {
  loadingText: string;
}
export function LoadingView({ loadingText }: LoadingViewProps) {
  return (
    <SimpleLayout>
      <LoadingOverlay visible>
        <LoadingOverlay.Content>
          <LoadingOverlay.Content.LoopingText text={[loadingText]} />
        </LoadingOverlay.Content>
      </LoadingOverlay>
    </SimpleLayout>
  );
}
