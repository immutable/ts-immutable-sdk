import { Dispatch, SetStateAction, useEffect, useState } from "react";

type AmountInputProps = {
    inputTokenSymbol: string
    setInputAmount: Dispatch<SetStateAction<string>>
}

export const AmountInput = ({inputTokenSymbol, setInputAmount}: AmountInputProps) => {
    return (
        <div style={{marginBottom: '12px'}}>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Amount in:</label>
            <input 
                type="number"
                id="amount_in"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder={`Amount of ${inputTokenSymbol} to swap`}
                required
                onChange={(e: React.FormEvent<HTMLInputElement>) => setInputAmount(e.currentTarget.value)}
            />
        </div>
    );
}