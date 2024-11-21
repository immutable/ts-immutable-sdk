"use client";

import { useState } from "react";
import {
	BiomeCombinedProviders,
	Body,
	Box,
	Divider,
	Heading,
	Stack,
} from "@biom3/react";
import { Connect } from "./Connect";
import { TransferAsset } from "./TransferAsset";
import { BrowserProvider } from "ethers";

export default function Home() {
	const [walletAddress, setWalletAddress] = useState<string>("");
	const [zkEvmProvider, setZkEvmProvider] = useState<BrowserProvider | null>(null);

	return (
		<main>
			<BiomeCombinedProviders>
				<Stack
					alignItems="center"
					sx={{
						padding: "base.spacing.x4",
					}}
				>
					<Heading>Passport & Telegram</Heading>
					{!walletAddress ? (
						<Connect
							setWalletAddress={setWalletAddress}
							setZkEvmProvider={setZkEvmProvider}
						/>
					) : (
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
				</Stack>
			</BiomeCombinedProviders>
		</main>
	);
}
