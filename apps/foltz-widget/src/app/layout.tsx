import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FOLTZ Fanwear - Chat Widget',
  description: 'Atendimento FOLTZ - Camisetas de fútbol premium 1:1',
  icons: {
    icon: '/foltz-logo.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
