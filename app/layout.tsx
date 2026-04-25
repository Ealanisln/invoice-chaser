import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const SITE_URL = 'https://dimecuando.com';
const TITLE = 'DimeCuando — El agente que cobra por ti, sin quedar de pesado';
const DESCRIPTION =
  'Agente IA chilango para freelancers: detecta facturas vencidas en tu Gmail, redacta el follow-up con el tono justo (de buena onda hasta "ya valiste") y tú nomás le picas a copiar. Made in CDMX con Vercel AI SDK, v0 y Composio Gmail MCP.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s · DimeCuando',
  },
  description: DESCRIPTION,
  keywords: [
    'dimecuando',
    'cobranza freelance',
    'agente IA cobranza',
    'facturas vencidas',
    'follow-up automatizado',
    'gmail composio',
    'cobrar facturas méxico',
    'recordatorios de pago',
    'freelancer cdmx',
    'cobrarle a clientes morosos',
  ],
  authors: [{ name: 'Emmanuel Alanis', url: 'mailto:emmanuel@alanis.dev' }],
  creator: 'Emmanuel Alanis',
  publisher: 'Emmanuel Alanis',
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: SITE_URL,
    siteName: 'DimeCuando',
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    creator: '@ealanisln',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'productivity',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#09090b',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-950">{children}</body>
    </html>
  );
}
