import { BoxProps, LoadingOverlay } from '@biom3/react';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';

export interface LoadingViewProps {
  loadingText: string | string[];
  textDuration?: number;
  containerSx?: BoxProps['sx'];
}
export function LoadingView({ loadingText, textDuration, containerSx = {} }: LoadingViewProps) {
  const text = Array.isArray(loadingText) ? loadingText : [loadingText];
  const duration = textDuration || 2500;

  return (
    <SimpleLayout containerSx={containerSx}>
      <LoadingOverlay visible testId="checkout-loading-view">
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
