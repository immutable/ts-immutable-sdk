export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-8">Passport Connect Examples</h1>
        <div className="grid grid-cols-1 gap-4 text-center">
          <a 
            className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
            href="/connect-with-eip1193">
              Connect with EIP-1193
          </a>
          <a 
            className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
            href="/connect-with-etherjs">
              Connect with EtherJS
          </a>      
          <a 
            className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
            href="/connect-with-wagmi">
              Connect with Wagmi
          </a>
      </div>
    </div>
  );
}
