import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'WHFL Welcome Call',
  description: 'This is a demo link and should only be used for demonstration purposes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
      </head>
      <body className="antialiased text-[13px]">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
