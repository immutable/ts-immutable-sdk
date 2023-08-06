import { Dispatch, SetStateAction } from "react";

type AmountInputProps = {
    setSecondaryFeeRecipient: Dispatch<SetStateAction<string>>
    setFeePercentage: Dispatch<SetStateAction<number>>
}

export const SecondaryFeeInput = ({setSecondaryFeeRecipient, setFeePercentage}: AmountInputProps) => {
    return (
        <div style={{marginBottom: '12px', marginTop: '12px'}}>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Secondary fee (optional):</label>
            <input 
                type="string"
                id="secondary_fee_recipient"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder={`Fee recipient address`}
                required
                onChange={(e: React.FormEvent<HTMLInputElement>) => setSecondaryFeeRecipient(e.currentTarget.value)}
            />
            <input 
                style={{marginTop: '12px'}}
                type="number"
                id="secondary_fee_recipient"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder={`Fee percentage - maximum of 10%`}
                required
                onChange={(e: React.FormEvent<HTMLInputElement>) => setFeePercentage(parseFloat((e.currentTarget.value)))}
            />
        </div>
    );
}