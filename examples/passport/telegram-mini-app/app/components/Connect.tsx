import { Body, Box, Button } from "@biom3/react";
import WebApp from "@twa-dev/sdk";
import { useCallback, useState } from "react";
import { passportInstance } from "../utils";
import { BrowserProvider } from "ethers";

export const Connect = ({
	setWalletAddress,
	setZkEvmProvider,
}: {
	setWalletAddress: (address: string) => void;
	setZkEvmProvider: (provider: BrowserProvider) => void;
}) => {
	const [errorMessage, setErrorMessage] = useState<string>("");

	const onConnect = useCallback(async () => {
		try {
			setErrorMessage("");
			// #doc passport-telegram-mini-app-login
			// Use loginWithDeviceFlow as the login method for Telegram Mini App to ensure support for all devices
			const deviceFlowParams = await passportInstance.loginWithDeviceFlow();
			// Open the device flow url using the openLink function on the telegram sdk
			if (typeof window !== 'undefined') {
				WebApp.openLink(deviceFlowParams.url);
			}
			// Wait for the user to complete the login before calling eth_requestAccounts
			await passportInstance.loginWithDeviceFlowCallback(
				deviceFlowParams.deviceCode,
				deviceFlowParams.interval,
			);
			// Get the provider and call eth_requestAccounts to get the user's wallet address
			const provider = await passportInstance.connectEvm();
			const [userAddress] = await provider.request({
				method: "eth_requestAccounts",
			});
			setWalletAddress(userAddress);
			// #enddoc passport-telegram-mini-app-login
			setZkEvmProvider(new BrowserProvider(provider));
		} catch (error: any) {
			setErrorMessage(error.message);
		}
	}, [setWalletAddress, setZkEvmProvider, setErrorMessage]);

	return (
		<Box
			sx={{
				paddingY: "base.spacing.x4",
			}}
		>
			<Button onClick={onConnect}>Sign in with Passport</Button>
			{errorMessage ? (
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
					>
						{`Error: ${errorMessage}`}
					</Body>
				</Box>
			) : null}
		</Box>
	);
};
