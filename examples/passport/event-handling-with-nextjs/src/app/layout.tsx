import { AppWrapper } from './utils/wrapper';
import './globals.css';

export const metadata = {
  title: 'Passport Event Handling Example',
  description: 'Example app demonstrating Passport event handling',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
} 