// app/layout.js
import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  title: 'ILMORA Education — Get Your Degree. We Handle the Rest.',
  description: 'Flexible UG, PG & PhD programs for working professionals. Complete attestation, UAE equivalency, and documentation support — A to Z. UAE & India.',
  openGraph: {
    title: 'ILMORA Education',
    description: 'Affordable degrees from authorized universities. Full attestation & UAE equivalency support — handled completely by us.',
    images: ['/images/logo/ilmora-white.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable}`}>
      <head>
        {/* Three.js loaded on-demand by Scene.js — no CDN bloat */}
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#12121e',
                color: '#fff',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: '12px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
              },
              success: { iconTheme: { primary: '#C9A84C', secondary: '#000' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#000' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
