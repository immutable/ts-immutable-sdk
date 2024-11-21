'use client';
import { checkout } from "@imtbl/sdk";
import { GasEstimateSwapResult, GasEstimateBridgeToL2Result } from "@imtbl/sdk/checkout";
import { checkoutSDK } from "../utils/setupDefault";
import { useState } from "react";
import { Button, Heading, Link, Table } from "@biom3/react";
import NextLink from "next/link";
import { toBeHex } from "ethers";

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

    // #doc gas-estimates
    // Get gas estimate for Swap type of transaction
    const swapEstimate = await checkoutSDK.gasEstimate({ gasEstimateType: checkout.GasEstimateType.SWAP });
    // Get gas estimate for Bridge type of transaction
    const bridgeEstimate = await checkoutSDK.gasEstimate({ gasEstimateType: checkout.GasEstimateType.BRIDGE_TO_L2 });
    // #enddoc gas-estimates
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
        Checkout SDK Gas Estimate
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
              {swapGasEstimate ? (
                <>
                  <div><b>Total Fees:</b> {swapGasEstimate.fees.totalFees ? hexToDecimal(toBeHex(swapGasEstimate.fees.totalFees)) : 'N/A'}</div>
                  <div><b>Token:</b> {swapGasEstimate.fees.token?.name} ({swapGasEstimate.fees.token?.symbol})</div>
                </>
              ) : ' (not estimated)'}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell><b>Bridge to L2 Gas Estimate</b></Table.Cell>
            <Table.Cell>
              {bridgeGasEstimate ? (
                <>
                  <div><b>Source Chain Gas:</b> {hexToDecimal(toBeHex(bridgeGasEstimate.fees.sourceChainGas))}</div>
                  <div><b>Approval Fee:</b> {hexToDecimal(toBeHex(bridgeGasEstimate.fees.approvalFee))}</div>
                  <div><b>Bridge Fee:</b> {hexToDecimal(toBeHex(bridgeGasEstimate.fees.bridgeFee))}</div>
                  <div><b>IMTBL Fee:</b> {hexToDecimal(toBeHex(bridgeGasEstimate.fees.imtblFee))}</div>
                  <div><b>Total Fees:</b> {hexToDecimal(toBeHex(bridgeGasEstimate.fees.totalFees))}</div>
                  <div><b>Token:</b> {bridgeGasEstimate.token?.name} ({bridgeGasEstimate.token?.symbol})</div>
                </>
              ) : ' (not estimated)'}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </>
  );
}
