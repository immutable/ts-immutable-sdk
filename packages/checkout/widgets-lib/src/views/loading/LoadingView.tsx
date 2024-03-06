import { LoadingOverlay } from '@biom3/react';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';

export interface LoadingViewProps {
  loadingText: string | string[];
  textDuration?: number;
}
export function LoadingView({ loadingText, textDuration }: LoadingViewProps) {
  const text = Array.isArray(loadingText) ? loadingText : [loadingText];
  const duration = textDuration || 2500;

  return (
    <SimpleLayout>
      <LoadingOverlay visible>
        <LoadingOverlay.Content>
          <LoadingOverlay.Content.LoopingText
            text={[...text]}
            textDuration={duration}
          />
        </LoadingOverlay.Content>
      </LoadingOverlay>
    </SimpleLayout>
  );
}
