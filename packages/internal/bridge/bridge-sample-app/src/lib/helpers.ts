import { CHILD_ERC20, CHILD_ERC20_BRIDGE, ERC20, ROOT_ERC20_BRIDGE_FLOW_RATE } from "@imtbl/bridge-sdk";
import { ethers, JsonRpcProvider } from "ethers";

export function delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export async function waitForReceipt(txHash: string | undefined, provider: JsonRpcProvider) {
    if (txHash == undefined) {
        throw("txHash is undefined");
    }
    let receipt;
    console.log("Wait until receipt... tx hash: ", txHash);
    let attempt = 0;
    while (receipt == null) {
        attempt++;
        console.log('waiting for receipt attempt: ', attempt);
        receipt = await provider.getTransactionReceipt(txHash)
        if (receipt == null) {
            await delay(1000);
        }
    }
    console.log("Receipt: " + JSON.stringify(receipt, null, 2));
    if (receipt.status != 1) {
        throw("Fail to execute: " + txHash);
    }
    console.log("Tx " + txHash + " succeed.");
}

export function getContract(contract: string, contractAddr: string, provider: JsonRpcProvider) {
    let contractABI: any;
    switch(contract) {
        case 'RootERC20BridgeFlowRate':
            contractABI = ROOT_ERC20_BRIDGE_FLOW_RATE;
        break;
        case 'ChildERC20Bridge':
            contractABI = CHILD_ERC20_BRIDGE;
        break;
        case 'ChildERC20':
            contractABI = CHILD_ERC20;
        break;
        case 'ERC20':
            contractABI = ERC20;
        break;
        default:
            throw new Error(`contract not found ${contract}`);
    }

    return new ethers.Contract(contractAddr, contractABI, provider);
}

export async function waitUntilSucceed(axelarURL: string, txHash: any) {
    if (axelarURL == "skip") {
        return;
    }
    console.log("Wait until succeed... tx hash: ", txHash);
    let attempt = 0;
    let response;
    let req = '{"method": "searchGMP", "txHash": "' + txHash + '"}'
    while (true) {
        attempt++;
        console.log('waiting for success attempt: ', attempt);
        response = await fetch(axelarURL, {
            method: 'POST',
            body: req,
            headers: {'Content-Type': 'application/json; charset=UTF-8'} });
        if (!response.ok) {
            console.error('Bad Response: ', response)
        }
        if (response.body !== null) {
            const asString = new TextDecoder("utf-8").decode(await response.arrayBuffer());
            const asJSON = JSON.parse(asString);
            if (asJSON.data[0] == undefined) {
                console.log("Waiting for " + txHash + " to become available...");
            } else {
                console.log("Current status of " + txHash + ": " + asJSON.data[0].status);
                if (asJSON.data[0].status == "executed") {
                    console.log("Done");
                    return;
                }
            }
        }
        await delay(60000);
    }
}