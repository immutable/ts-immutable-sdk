import type { Metadata } from "next";
import "./globals.css";
import AppWrapper from "./utils/wrapper";

export const metadata: Metadata = {
  title: "Passport SDK - PKCE Flow Authentication",
  description: "Example of PKCE flow authentication with Immutable Passport",
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