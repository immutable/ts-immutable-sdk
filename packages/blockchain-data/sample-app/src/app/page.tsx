import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <Image
          src="https://assets-global.website-files.com/646557ee455c3e16e4a9bcb3/646557ee455c3e16e4a9bcbe_immutable-logo.svg"
          alt="Vercel Logo"
          className="dark:invert mx-3"
          width={190}
          height={48}
          priority
        />
      </div>

      <div className="mb-32 lg:mb-0 flex my-3">
        <div className="flex flex-col">
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            className="group rounded-lg border border-transparent p-3 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          >
            <h2 className={`text-xl font-semibold`}>Activities</h2>
          </a>
        </div>
        <div className="flex-1 bg-gray w-full h-full"></div>
      </div>
    </main>
  );
}
