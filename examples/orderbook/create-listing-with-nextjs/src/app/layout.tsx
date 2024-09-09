import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppWrapper from "./utils/wrapper";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Orderbook SDK - Create listing with NextJS",
  description: "Examples of how to create a listing using the Orderbook SDK with NextJS",
};

export default function RootLayout({
 children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
      <body className={inter.className}>
      <AppWrapper>
        {children}
      </AppWrapper>
      </body>
      </html>
  );
}
