import {
  ChainId,
  Checkout,
  EIP6963ProviderDetail,
  NamedBrowserProvider,
  TokenFilterTypes,
} from '@imtbl/checkout-sdk';
import { useEffect, useState } from 'react';
import { SuccessMessage, ErrorMessage, WarningMessage } from './messages';
import LoadingButton from './LoadingButton';
import { Box } from '@biom3/react';

export interface AllowListProps {
  checkout: Checkout | undefined;
  provider: NamedBrowserProvider | undefined;
}

export default function GetInjectedProviders(props: AllowListProps) {
  const { provider, checkout } = props;

  const [resultProviders, setResultProviders] = useState<EIP6963ProviderDetail[]>();

  async function getInjectedProviders() {
    if (!checkout) {
      console.error('missing checkout, please connect first');
      return;
    }
    if (!provider) {
      console.error('missing provider, please connect first');
      return;
    }
    try {
      const injectedProviders = await checkout.getInjectedProviders();
      console.log('Injected Providers:', injectedProviders);
      setResultProviders([...injectedProviders]);
    } catch (error: any) {
      setResultProviders([]);
    }
  }

  useEffect(() => {
    setResultProviders([]);
  }, [checkout]);

  return (
    <div>
      {!provider && <WarningMessage>Not connected.</WarningMessage>}
      <Box
        sx={{
          marginTop: 'base.spacing.x4',
          display: 'flex',
          gap: 'base.spacing.x4',
        }}
      >
        <LoadingButton onClick={getInjectedProviders} loading={false}>
          Get injected providers
        </LoadingButton>
      </Box>

      {resultProviders && (
        <SuccessMessage>
          {resultProviders?.map((providerDetail) => (
            <div key={providerDetail.info.uuid}>
              <Box>
                <img src={providerDetail.info.icon} width="48px" />
                ({providerDetail.info.name}) - {providerDetail.info.uuid}
              </Box>
            </div>
          ))}
        </SuccessMessage>
      )}
    </div>
  );
}
