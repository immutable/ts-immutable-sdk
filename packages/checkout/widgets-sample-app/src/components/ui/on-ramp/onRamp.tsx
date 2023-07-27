import { BiomeCombinedProviders, Body, Box } from "@biom3/react";
import { onDarkBase } from "@biom3/design-tokens";
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import { useEffect, useRef } from "react";

export function OnRampUI() {
  let domElement: HTMLElement | undefined;
  const firstRender = useRef(true);

  useEffect(()=>{
    domElement = document.getElementById('ramp-container') || undefined;
  },[]);
  useEffect(() => {
    if(firstRender.current) {
      new RampInstantSDK({
        hostAppName: 'Immutable',
        hostLogoUrl: 'https://assets.ramp.network/misc/test-logo.png',
        hostApiKey: 'onr7tgoqgx8jxzggsc52ud9xx3hm9gkzf7czw93x',
        url: 'https://app.demo.ramp.network',
        variant: 'embedded-mobile',
        containerNode: domElement,
        enabledFlows: ['ONRAMP'],
        userAddress: '0xDaA1842cF7E43B45385F956b89Ae814C0fE4BD20',
        // fiatCurrency: 'USD',
        // fiatValue: '20'
        swapAmount: '200000000000000000',
        swapAsset: 'SEPOLIA_ETH',
      }).on('*', (event) => console.log(event))
        .show();
    }
    firstRender.current = false;
    console.log('is it rendering twice!')
  }, [domElement]);

  return (
    <BiomeCombinedProviders theme={{ base: onDarkBase }}>
      <Box style={{ height: '630px', width: '430px' }}>
        <Body>OnRampWidget with iframe</Body>
        <iframe style={{ height: '600px', width: '430px' }}
                src="https://app.demo.ramp.network/?hostAppName=Immutable&hostLogoUrl=https%3A%2F%2Fassets.ramp.network%2Fmisc%2Ftest-logo.png&hostApiKey=onr7tgoqgx8jxzggsc52ud9xx3hm9gkzf7czw93x&enabledFlows=ONRAMP&userAddress=0xDaA1842cF7E43B45385F956b89Ae814C0fE4BD20&fiatCurrency=USD&fiatValue=20&sdkType=WEB&sdkVersion=4.0.4&hostUrl=http%3A%2F%2Flocalhost%3A3000"></iframe>
      </Box>

      <Box id="ramp-container" style={{ height: '667px', width: '430px' }} >
        embedded widget
      </Box>
    </BiomeCombinedProviders>
  );
}
