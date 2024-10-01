'use client';
import { checkout } from "@imtbl/sdk";
import { GasEstimateSwapResult, GasEstimateBridgeToL2Result } from "@imtbl/sdk/checkout";
import { checkoutSDK } from "../utils/setupDefault";
import { useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { Button, Heading, Body, Link, Table } from "@biom3/react";
import NextLink from "next/link";

// Function to convert hex to decimal
const hexToDecimal = (hex: string) => {
  return BigInt(hex).toString(10);
};

export default function ConnectWithMetamask() {
  // setup the loading state to enable/disable buttons when loading
  const [loading, setLoadingState] = useState<boolean>(false);
  const [swapGasEstimate, setSwapGasEstimate] = useState<GasEstimateSwapResult>();
  const [bridgeGasEstimate, setBridgeGasEstimate] = useState<GasEstimateBridgeToL2Result>();

  const connectWithMetamask = async () => {
    // disable button while loading
    setLoadingState(true);

    // Create a provider given one of the default wallet provider names
    const walletProviderName = checkout.WalletProviderName.METAMASK;
    const providerRes = await checkoutSDK.createProvider({
      walletProviderName,
    });

    // Pass through requestWalletPermissions to request the user's wallet permissions
   await checkoutSDK.connect({
      provider: providerRes.provider,
      requestWalletPermissions: true,
    });

    const swapEstimate = await checkoutSDK.gasEstimate({ gasEstimateType: checkout.GasEstimateType.SWAP });
    // Debug log
    console.log(swapEstimate)
    const bridgeEstimate = await checkoutSDK.gasEstimate({ gasEstimateType: checkout.GasEstimateType.BRIDGE_TO_L2 });
    // Debug log
    console.log(bridgeEstimate)
    // Set the gas estimates in state
    if (swapEstimate.gasEstimateType === checkout.GasEstimateType.SWAP) {
      setSwapGasEstimate(swapEstimate);
    }
    if (bridgeEstimate.gasEstimateType === checkout.GasEstimateType.BRIDGE_TO_L2) {
      setBridgeGasEstimate(bridgeEstimate);
    }

    setLoadingState(false);
  };
  return (
    <>
      <Heading size="medium" className="mb-1">
        Switch Network
      </Heading>
      <Button
        className="mb-1"
        size="medium"
        onClick={async () => await connectWithMetamask()}
        disabled={loading}
      >
        Connect MetaMask
      </Button>

      <br />
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>

      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Cell>Item</Table.Cell>
            <Table.Cell>Value</Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell><b>Swap Gas Estimate</b></Table.Cell>
            <Table.Cell>
              {swapGasEstimate ? `${swapGasEstimate.fees}` : ' (not estimated)'}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell><b>Bridge to L2 Gas Estimate</b></Table.Cell>
            <Table.Cell>
              {bridgeGasEstimate ? (
                <>
                  <div>Source Chain Gas: {hexToDecimal(bridgeGasEstimate.fees.sourceChainGas._hex)}</div>
                  <div>Approval Fee: {hexToDecimal(bridgeGasEstimate.fees.approvalFee._hex)}</div>
                  <div>Bridge Fee: {hexToDecimal(bridgeGasEstimate.fees.bridgeFee._hex)}</div>
                  <div>IMTBL Fee: {hexToDecimal(bridgeGasEstimate.fees.imtblFee._hex)}</div>
                  <div>Total Fees: {hexToDecimal(bridgeGasEstimate.fees.totalFees._hex)}</div>
                </>
              ) : ' (not estimated)'}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </>
  );
}
