import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CTP Water Cooling Tower Calculator',
  description: 'Step based calculator wizard for cooling tower configuration'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
