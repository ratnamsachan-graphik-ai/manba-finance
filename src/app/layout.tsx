import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Prosperity Finance',
  description: 'This is a demo link and should only be used for demonstration purposes.',
  icons: {
    icon: 'https://ik.imagekit.io/wekwjyn8z/prosperity-finance-logo.webp',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="antialiased text-[13px]">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
