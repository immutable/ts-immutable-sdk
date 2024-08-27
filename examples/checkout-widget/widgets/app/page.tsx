import Link from 'next/link';
export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Link href="/wallet">
        Go to Wallet
      </Link>
    </div>
  )
}
