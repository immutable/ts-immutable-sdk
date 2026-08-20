import { useEffect, useState } from 'react';
import { Body, Box } from '@biom3/react';
import { Fit, Layout, useRive } from '@rive-app/react-canvas-lite';

export interface InlineLoadingOverlayProps {
  loadingText: string | string[];
  textDuration?: number;
  testId?: string;
}

/**
 * Self-contained loading UI that does not use biom3 LoadingOverlay/Modal.
 *
 * biom3's LoadingOverlay registers into an overlays store and does not reliably
 * CLOSE_MODAL on unmount under React 19 (useControlledOverlay vs useIsMounted
 * cleanup order). Unmounting a visible LoadingOverlay can leave a stuck modal.
 */
export function InlineLoadingOverlay({
  loadingText,
  textDuration = 2500,
  testId = 'checkout-loading-view',
}: InlineLoadingOverlayProps) {
  const texts = Array.isArray(loadingText) ? loadingText : [loadingText];
  const [textIndex, setTextIndex] = useState(0);

  const { RiveComponent } = useRive({
    src: 'https://biome.immutable.com/hosted-assets/rive/immutable_loader.riv',
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain }),
  });

  useEffect(() => {
    if (texts.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, textDuration);
    return () => window.clearInterval(id);
  }, [texts.length, textDuration]);

  return (
    <Box
      testId={testId}
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        d: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'base.color.translucent.emphasis.300',
      }}
    >
      <Box
        testId={`${testId}__modalContent`}
        sx={{
          d: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'base.spacing.x4',
          px: 'base.spacing.x4',
          py: 'base.spacing.x6',
          brad: 'base.borderRadius.x6',
          bg: 'base.color.neutral.500',
          boxShadow: 'base.shadow.500',
          minWidth: '220px',
        }}
      >
        <Box
          testId={`${testId}__riveBox`}
          sx={{
            width: '96px',
            height: '96px',
            flexShrink: 0,
          }}
        >
          <RiveComponent />
        </Box>
        <Body
          testId={`${testId}__loopingText`}
          size="medium"
          sx={{ textAlign: 'center' }}
        >
          {texts[textIndex]}
        </Body>
      </Box>
    </Box>
  );
}
