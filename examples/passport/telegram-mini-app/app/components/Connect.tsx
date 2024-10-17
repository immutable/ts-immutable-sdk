import { Body, Box, Button } from "@biom3/react"
import { passportInstance } from "../page";
import WebApp from "@twa-dev/sdk";
import { type ethers, providers } from "ethers";
import { useState } from "react";

export const Connect = (
  {
    setWalletAddress,
    setZkEvmProvider,
  }: {
    setWalletAddress: (address: string) => void,
    setZkEvmProvider: (provider: ethers.providers.Web3Provider) => void
  },
) => {
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const onConnect = async () => {
		try {
      setErrorMessage("");
      // #doc passport-telegram-mini-app-login
			const deviceFlowParams = await passportInstance.loginWithDeviceFlow();
			WebApp.openLink(deviceFlowParams.url);
			await passportInstance.loginWithDeviceFlowCallback(
				deviceFlowParams.deviceCode,
				deviceFlowParams.interval,
			);
			const provider = passportInstance.connectEvm();
			const [userAddress] = await provider.request({
				method: "eth_requestAccounts",
			});
			setWalletAddress(userAddress);
      // #enddoc passport-telegram-mini-app-login
			setZkEvmProvider(new providers.Web3Provider(provider));
		} catch (error: any) {
			setErrorMessage(error.message);
		}
	};

  return(
    <Box
      sx={{
        paddingY: 'base.spacing.x4'
      }}
    >
      <Button onClick={onConnect} >
        Sign in with Passport
      </Button>
      {errorMessage && (
        <Box
          sx={{
            width: "base.spacing.x50",
            wordWrap: "break-word",
          }}
        >
          <Body
              sx={{
                color: "base.color.status.fatal.bright",
              }}
            >{`Error: ${errorMessage}`}
          </Body>
        </Box>
      )}
    </Box>
  )
}
