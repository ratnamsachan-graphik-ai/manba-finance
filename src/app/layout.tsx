import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Manba Finance',
  description: 'This is a demo link and should only be used for demonstration purposes.',
  icons: {
    icon: 'https://www.manbafinance.com/wp-content/uploads/2023/09/manba-fav-150x150.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="antialiased text-[14px]">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
