'use client';

import { PassportProvider } from "@/context/passport2";
import { ReactNode } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    // #doc passport-provider-react-element
    <PassportProvider>{children}</PassportProvider>
    // #enddoc passport-provider-react-element
  );
}
