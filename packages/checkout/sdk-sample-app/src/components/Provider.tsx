import {
  Checkout,
  WalletProviderName,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { useEffect, useMemo, useState } from 'react';
import { SuccessMessage, ErrorMessage } from './messages';
import { Box, Select, Stack } from '@biom3/react';
import { passport } from '../passport';

// Connect Passport EVM
passport.connectEvm();

interface ProviderProps {
  checkout: Checkout;
  provider: Web3Provider | undefined;
  setProvider: (provider: Web3Provider) => void;
}

export default function Provider(props: ProviderProps) {
  const { setProvider, checkout, provider } = props;
  const injectedProviders = useMemo(() => checkout && checkout.getInjectedProviders(), [checkout])

  const [result1, setResult1] = useState<Web3Provider>();

  const [error1, setError1] = useState<any>(null);

  const [loading, setLoading] = useState<boolean>(false);

  async function createProviderClick() {
    setError1(null);
    setLoading(true);
    try {
      const resp = await checkout.createProvider({
        walletProviderName: WalletProviderName.METAMASK,
      });
      setProvider(resp.provider);
      setResult1(resp.provider);
      setLoading(false);
    } catch (err: any) {
      setError1(err);
      setLoading(false);
      console.log(err.message);
      console.log(err.type);
      console.log(err.data);
      console.log(err.stack);
    }
  }

  const handleSelectChange = (providerRdns: any) => {
    const selectedProvider = injectedProviders.find((providerDetail) => providerDetail.info.rdns === providerRdns);
    const web3Provider = new Web3Provider(selectedProvider?.provider as any);
    setProvider(web3Provider);
    setResult1(web3Provider);
    setLoading(false);
  }

  useEffect(() => {
    // reset state wehn checkout changes from environment switch
    setResult1(undefined);
    setError1(null);
    setLoading(false);
  }, [checkout]);

  return (
    <div>
      <Box
        sx={{
          marginTop: 'base.spacing.x4',
        }}
      >
        <Stack direction="row" alignItems="center">
          <Select onSelectChange={handleSelectChange}>
            {injectedProviders?.map((providerDetail) => (
              <Select.Option key={providerDetail.info.rdns} optionKey={providerDetail.info.rdns}>
                <img src={providerDetail.info.icon} width="36px" height="36px"></img>
                <Select.Option.Label>{providerDetail.info.name}</Select.Option.Label>
                <Select.Option.Caption>{providerDetail.info.rdns}</Select.Option.Caption>
              </Select.Option>
            ))}
          </Select>
        </Stack>
        {result1 && !error1 && (
          <SuccessMessage>Web3Provider Created.</SuccessMessage>
        )}
        {error1 && (
          <ErrorMessage>
            {error1.message}. Check console logs for more details.
          </ErrorMessage>
        )}
      </Box>
    </div>
  );
}
