import { Box } from '@biom3/react';
import { useEffect } from 'react';
import { useAnalytics } from '../../../context/AnalyticsProvider';

export interface OnRampProps {
  finalUrl: string;
}

export function OnrampComponent({ finalUrl }: OnRampProps) {
  const { track } = useAnalytics();

  useEffect(() => {
    const domIframe:HTMLIFrameElement = document.getElementById('transak-iframe') as HTMLIFrameElement;

    if (domIframe === undefined) return;

    const handler = (event: any) => {
      if (event.source === domIframe.contentWindow) {
        if (event.origin === 'https://global-stg.transak.com') {
          console.log('TRANSAK event data: ', event.data);

          track({
            userJourney: 'OnRampCrypto', // On-ramping crypto with Transak
            screen: 'Initial-screen',
            control: 'StatusEvents',
            controlType: 'OnRampWidget',
            action: 'Opened',
            userId: '0x00address00',
          });
        }
      }
    };

    console.log('useeffect passed check for iframe domElement');
    window.addEventListener('message', handler);

    // eslint-disable-next-line consistent-return
    return () => {
      window.removeEventListener('message', handler);
    };
  }, []);

  return (
    <Box style={{
      position: 'relative',
      width: '420px',
      height: '565px',
      boxShadow: '0 0 15px #1461db',
      borderRadius: '15px',
      overflow: 'hidden',
      marginLeft: '5px',
    }}
    >
      <iframe
        title="Transak title"
        id="transak-iframe"
        src={finalUrl}
        allow="camera;microphone;fullscreen;payment"
        style={{ height: '100%', width: '100%', border: 'none' }}
      />
    </Box>
  );
}
