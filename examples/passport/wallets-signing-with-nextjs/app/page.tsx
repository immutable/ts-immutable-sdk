export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="mb-8 text-3xl font-bold">
        Passport Message Signing Examples
      </h1>
      <div className="grid grid-cols-1 gap-4 text-center">
        <a
          className="px-4 py-2 text-white bg-black rounded hover:bg-gray-800"
          href="/sign-with-eip712"
        >
          Sign message with EIP-712
        </a>
        <a
          className="px-4 py-2 text-white bg-black rounded hover:bg-gray-800"
          href="/sign-with-erc191"
        >
          Sign message with ERC-191
        </a>
        <a
          className="px-4 py-2 text-white bg-black rounded hover:bg-gray-800"
          href="/sign-with-erc191-2"
        >
          Personal sign with ERC-191
        </a>
      </div>
    </div>
  );
}
