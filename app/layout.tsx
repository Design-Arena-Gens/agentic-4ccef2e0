import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Calcul de densit?',
  description: 'Calculez la densit?, la masse ou le volume avec des conversions d\'unit?s.',
  icons: { icon: '/icon.svg' },
  metadataBase: new URL('https://agentic-4ccef2e0.vercel.app'),
  openGraph: {
    title: 'Calcul de densit?',
    description: 'Calculez densit?, masse et volume. Unit?s: kg/m?, g/cm?, etc.',
    url: 'https://agentic-4ccef2e0.vercel.app',
    siteName: 'Calcul de densit?',
    type: 'website'
  },
  alternates: { canonical: '/' }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <main className="container">
          {children}
          <footer className="footer">
            <span>? {new Date().getFullYear()} Calcul de densit?</span>
          </footer>
        </main>
      </body>
    </html>
  );
}
