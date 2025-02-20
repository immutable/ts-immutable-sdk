import { Fee } from "@imtbl/dex-sdk"
import { formatEther } from "ethers";

type mapping = {
    [address: string]: string;
};

export const FeeBreakdown = ({fees, addressMap}: {fees: Fee[], addressMap: mapping}) => {
    return (<>
        <h2 className="mb-1 mt-4 text-lg font-extrabold leading-none tracking-tight text-gray-900 md:text-lg lg:text-lg dark:text-white">Fee Breakdown:</h2>
            {fees.map((fee, index) => {
                return (<div key={index}>
                    <div>Recipient: {fee.recipient}</div>
                    <div>Basis Points: {fee.basisPoints}</div>
                    <div>Amount: {formatEther(fee.amount.value.toString())} {addressMap[fee.amount.token.address]}</div>
                </div>)
            })}
        </>
    )
}