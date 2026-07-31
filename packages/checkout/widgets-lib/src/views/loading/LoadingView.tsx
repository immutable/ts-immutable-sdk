import { BoxProps } from '@biom3/react';
import { InlineLoadingOverlay } from '../../components/Loading/InlineLoadingOverlay';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';

export interface LoadingViewProps {
  loadingText: string | string[];
  textDuration?: number;
  containerSx?: BoxProps['sx'];
}

/**
 * Widget loading screen.
 *
 * Intentionally avoids biom3 LoadingOverlay/Modal: callers mount/unmount this
 * view when the route changes (and Suspense fallbacks do the same). Under
 * React 19, unmounting a visible LoadingOverlay orphans the modal in biom3's
 * overlays store (still present in @biom3/react@0.32.11). An inline overlay
 * tears down with the React tree.
 */
export function LoadingView({
  loadingText,
  textDuration,
  containerSx = {},
}: LoadingViewProps) {
  return (
    <SimpleLayout containerSx={containerSx}>
      <InlineLoadingOverlay
        loadingText={loadingText}
        textDuration={textDuration}
      />
    </SimpleLayout>
  );
}
