import { Body, Box, Button, FormControl, Heading } from "@biom3/react";
import { BrowserProvider } from "ethers";
import { ethers } from "ethers";
import { useState } from "react";

export const TransferAsset = ({
	walletAddress,
	zkEvmProvider,
}: {
	walletAddress: string;
	zkEvmProvider: BrowserProvider | null;
}) => {
	const [collectionAddress, setCollectionAddress] = useState<string>("");
	const [collectionAddressError, setCollectionAddressError] =
		useState<string>("");
	const [tokenId, setTokenId] = useState<string>("");
	const [tokenIdError, setTokenIdError] = useState<string>("");
	const [toAddress, setToAddress] = useState<string>("");
	const [toAddressError, setToAddressError] = useState<string>("");
	const [transferSuccess, setTransferSuccess] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>("");

	const transferAsset = async () => {
		if (!zkEvmProvider) return;

		setCollectionAddressError("");
		setTokenIdError("");
		setToAddressError("");

		if (!collectionAddress) {
			setCollectionAddressError("Collection Address is required");
		}

		if (!tokenId) {
			setTokenIdError("Token ID is required");
		}

		if (!toAddress) {
			setToAddressError("To Address is required");
		}

		// #doc passport-telegram-mini-app-transaction
		// Setup the contract ABI with the safeTransferFrom function for transferring assets
		const abi = [
			"function safeTransferFrom(address from, address to, uint256 token_id)",
		];

		// Get the signer from the provider that was initialised in the Connect flow and create a contract instance
		const signer = await zkEvmProvider.getSigner();
		const contract = new ethers.Contract(collectionAddress, abi, signer);
		try {
			// Call the transfer function on the contract
			await contract.safeTransferFrom(walletAddress, toAddress, tokenId);
			setTransferSuccess(true);
		} catch (error: any) {
			setErrorMessage(error.message);
		}
		// #enddoc passport-telegram-mini-app-transaction
	};

	const onCollectionAddressChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setCollectionAddress(event.target.value);
	};

	const onTokenIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setTokenId(event.target.value);
	};

	const onToAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setToAddress(event.target.value);
	};

	return (
		<Box
			sx={{
				paddingY: "base.spacing.x4",
			}}
		>
			<Heading size="small">Transfer Asset</Heading>
			<FormControl
				sx={{
					paddingY: "base.spacing.x2",
				}}
			>
				<FormControl.Label>Collection Address</FormControl.Label>
				<FormControl.inputs.TextInput
					value={collectionAddress}
					onInput={onCollectionAddressChange}
					hideClearValueButton
				/>
				{collectionAddressError ? (
					<FormControl.Validation validationStatus="error">
						{collectionAddressError}
					</FormControl.Validation>
				) : null}
			</FormControl>
			<FormControl
				sx={{
					paddingY: "base.spacing.x2",
				}}
			>
				<FormControl.Label>Token ID</FormControl.Label>
				<FormControl.inputs.TextInput
					value={tokenId}
					onInput={onTokenIdChange}
					hideClearValueButton
				/>
				{tokenIdError ? (
					<FormControl.Validation validationStatus="error">
						{tokenIdError}
					</FormControl.Validation>
				) : null}
			</FormControl>
			<FormControl
				sx={{
					paddingY: "base.spacing.x2",
				}}
			>
				<FormControl.Label>To Address</FormControl.Label>
				<FormControl.inputs.TextInput
					value={toAddress}
					onInput={onToAddressChange}
					hideClearValueButton
				/>
				{toAddressError ? (
					<FormControl.Validation validationStatus="error">
						{toAddressError}
					</FormControl.Validation>
				) : null}
			</FormControl>
			<Box
				sx={{
					paddingY: "base.spacing.x4",
				}}
			>
				<Button onClick={transferAsset}>Transfer</Button>
			</Box>
			{transferSuccess ? <Box>Transfer Completed</Box> : null}
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
