import { Box } from '@biom3/react';
// import { useEffect } from 'react';

// import { useTransak } from '../hooks/useTransak';

export interface TransactionIframeProps {
  id: string;
  src: string;
}

export function TransakIframe(props: TransactionIframeProps) {
  //   const { subscribeEvents, unsubscribeEvents } = useTransak();

  //   useEffect(() => {
  //     subscribeEvents();
  //     return () => unsubscribeEvents();
  //   }, []);

  return (
    <Box
      style={{
        display: 'block',
        position: 'relative',
        maxWidth: '420px',
        height: '565px',
        borderRadius: 'base.borderRadius.x6',
        overflow: 'hidden',
        marginLeft: 'base.spacing.x2',
        marginRight: 'base.spacing.x2',
        marginBottom: 'base.spacing.x2',
        margin: '0 auto',
      }}
    >
      <iframe
        {...props}
        title="Transak-Iframe"
        allow="camera;microphone;fullscreen;payment"
        style={{
          height: '100%',
          width: '100%',
          border: 'none',
          position: 'absolute',
        }}
      />
    </Box>
  );
}
