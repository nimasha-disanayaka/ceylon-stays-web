import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'Ceylon Stays | Sri Lanka Premier Booking Platform & Owner Portal',
  description: 'Explore Sri Lanka luxury hotels, beach villas, & homestays in Galle, Ella, Mirissa, and Sigiriya. Direct 1-click owner reservations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${jakarta.variable}`}>
      <body className={`${jakarta.className} bg-[#080d1a] text-slate-100 antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}

