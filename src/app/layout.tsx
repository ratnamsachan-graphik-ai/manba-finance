import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'LoanEase Form',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Nunito:wght@400;700&display=swap" rel="stylesheet" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face {
                font-family: 'Gilroy-SemiBold';
                src: url('https://fonts.cdnfonts.com/s/16417/Gilroy-SemiBold.woff') format('woff');
              }
              @font-face {
                font-family: 'Gilroy-Bold';
                src: url('https://fonts.cdnfonts.com/s/16417/Gilroy-Bold.woff') format('woff');
              }
              @font-face {
                font-family: 'Gilroy-Regular';
                src: url('https://fonts.cdnfonts.com/s/16417/Gilroy-Regular.woff') format('woff');
              }
            `,
          }}
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
