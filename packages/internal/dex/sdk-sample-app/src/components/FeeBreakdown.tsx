import { Fee } from "@imtbl/dex-sdk"
import { ethers } from "ethers"

type mapping = {
    [address: string]: string;
};

export const FeeBreakdown = ({fees, addressMap}: {fees: Fee[], addressMap: mapping}) => {
    return (<>
        <h2 className="mb-1 mt-4 text-lg font-extrabold leading-none tracking-tight text-gray-900 md:text-lg lg:text-lg dark:text-white">Fee Breakdown:</h2>
            {fees.map((fee, index) => {
                return (<div key={index}>
                    <div>Fee Recipient: {fee.feeRecipient}</div>
                    <div>Fee Basis Points: {fee.feeBasisPoints}</div>
                    <div>Fee Amount: {ethers.utils.formatEther(fee.amount.value.toString())} {addressMap[fee.amount.token.address]}</div>
                </div>)
            })}
        </>
    )
}