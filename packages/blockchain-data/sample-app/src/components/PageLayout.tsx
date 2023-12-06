import React from 'react';
import Image from 'next/image';

interface Props {
  children: React.ReactNode;
}

export const PageLayout: React.FC<Props> = ({ children }) => {
  return (
    <main className="flex min-h-screen flex-col p-24">
      <div className="z-10 w-full items-center justify-between text-sm lg:flex">
        <Image
          src="https://assets-global.website-files.com/646557ee455c3e16e4a9bcb3/646557ee455c3e16e4a9bcbe_immutable-logo.svg"
          alt="Vercel Logo"
          className="dark:invert"
          width={190}
          height={48}
          priority
        />
      </div>

      {children}
    </main>
  );
};
