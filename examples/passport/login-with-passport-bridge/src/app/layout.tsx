import type { Metadata } from "next";
import "./globals.css";
import AppWrapper from "./utils/wrapper";

export const metadata: Metadata = {
  title: "Passport SDK - Cross-SDK Bridge Example",
  description: "Example of using Cross-SDK Bridge feature with Immutable Passport",
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