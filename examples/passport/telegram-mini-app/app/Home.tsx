"use client";

import { useState } from "react";
import type { ethers } from "ethers";
import {
	BiomeCombinedProviders,
	Body,
	Box,
	Button,
	Divider,
	Heading,
} from "@biom3/react";
import { Connect } from "./components/Connect";
import { TransferAsset } from "./components/TransferAsset";

export default function Home() {
	const [walletAddress, setWalletAddress] = useState<string>("");
	const [zkEvmProvider, setZkEvmProvider] =
		useState<ethers.providers.Web3Provider | null>(null);

	return (
		<main>
			<BiomeCombinedProviders>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						padding: "base.spacing.x4",
					}}
				>
					<Heading>Passport & Telegram</Heading>
					{!walletAddress && (
						<Connect
							setWalletAddress={setWalletAddress}
							setZkEvmProvider={setZkEvmProvider}
						/>
					)}
					{walletAddress && (
						<Box
							sx={{
								paddingY: "base.spacing.x4",
							}}
						>
							<Box
								sx={{
									paddingY: "base.spacing.x4",
								}}
							>
								<Heading size="small">Wallet Address</Heading>
								<Body>{walletAddress}</Body>
							</Box>
							<Divider />
							<TransferAsset
								walletAddress={walletAddress}
								zkEvmProvider={zkEvmProvider}
							/>
						</Box>
					)}
				</Box>
			</BiomeCombinedProviders>
		</main>
	);
}
