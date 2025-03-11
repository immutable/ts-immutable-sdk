import type { Metadata } from "next";
import "./globals.css";
import AppWrapper from "./utils/wrapper";

export const metadata: Metadata = {
  title: "Passport SDK - Event Handling",
  description: "Examples of event handling with Passport SDK",
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