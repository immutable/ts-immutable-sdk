import { BiomeCombinedProviders, Body, Box } from "@biom3/react";
import { onDarkBase } from "@biom3/design-tokens";
// import transakSDK from "@transak/transak-sdk";
import { useEffect, useRef } from "react";

// const transakSDKModule = require('@transak/transak-sdk');

export function OnRampUI() {
  const firstRender = useRef(true);
  const settings = {
    apiKey: '41ad2da7-ed5a-4d89-a90b-c751865effc2',  // Your API Key
    environment: "STAGING", // STAGING/PRODUCTION
    defaultCryptoCurrency: 'ETH',
    themeColor: '000000', // App theme color
    widgetHeight: "580px",
    widgetWidth: "400px",
  }

  // useEffect(()=>{
  //   const transak = new transakSDK(settings);
  //   transak.init();
  //     transak.on(transak.ALL_EVENTS, (data: any) => {
  //       console.log(data);
  //       if(data.eventName == 'TRANSAK_WIDGET_CLOSE'){
  //         console.log('closde the widget')
  //       }
  //     });
  // },[]);

  useEffect(() => {
    const domIframe:HTMLIFrameElement = document.getElementById("transak-iframe") as HTMLIFrameElement;

    if(domIframe == undefined) return;

    const handler = (event: any) => {
      if (event.source === domIframe.contentWindow) {
        if (event.origin === "https://global-stg.transak.com") {
          console.log('TRANSAK event listener: ',event.data);
        }
      }
    };
    
    console.log('useeffect passed check for iframe domElement');
    window.addEventListener("message", handler);
    return ()=>{
      window.removeEventListener("message", handler)
    }
  }, []);


  return (
    <BiomeCombinedProviders theme={{ base: onDarkBase }}>
      <Box style={{position: 'relative', width: '500px', height: '80dvh',
        boxShadow: '0 0 15px #1461db', borderRadius: '15px', overflow: 'hidden'}}>
        <iframe id="transak-iframe"
          src="https://global-stg.transak.com?apiKey=41ad2da7-ed5a-4d89-a90b-c751865effc2&environment=staging"
          allow="camera;microphone;fullscreen;payment"
          style={{height: '100%', width: '100%', border: 'none'}}>
        </iframe>
      </Box>
    </BiomeCombinedProviders>
  );
}
