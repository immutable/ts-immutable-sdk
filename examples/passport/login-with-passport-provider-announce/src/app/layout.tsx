import type { Metadata } from "next";
import "./globals.css";
import AppWrapper from "./utils/wrapper";

export const metadata: Metadata = {
  title: "Passport SDK - Provider Announcement",
  description: "Example of EIP-6963 provider announcement with wallet discovery integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppWrapper>
          {children}
        </AppWrapper>
      </body>
    </html>
  );
} 