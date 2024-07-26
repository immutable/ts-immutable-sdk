'use client';

import { sendTransaction } from '@/src/transaction';
import { passportInstance } from '@/src/utils';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Passport Send Transaction Examples</h1>
      <button
        className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
        onClick={() => sendTransaction(passportInstance)}
        type="button"
      >
        Send Transaction
      </button>
    </div>
  );
}
