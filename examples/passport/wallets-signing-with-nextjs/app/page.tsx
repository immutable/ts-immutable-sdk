export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Passport Sign Message Examples</h1>
      <div className="grid grid-cols-1 gap-4 text-center">
        <a 
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          href="/sign-with-eip712">
            Sign message with EIP-712
        </a>
        <a 
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          href="/sign-with-erc191">
            Sign message with ERC-191
        </a>      
      </div>
    </div>
  );
}
