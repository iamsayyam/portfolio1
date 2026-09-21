import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/literata';
import './globals.css';
import { site } from '@/data/site';

export const metadata: Metadata = {
  title: `${site.name} | ${site.role}`,
  description: site.description,
  openGraph: {
    title: `${site.name} | ${site.role}`,
    description: site.description,
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0E1230',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <noscript>
          <style>{`[data-city]{display:none!important}[data-page]{position:static!important;width:auto!important;height:auto!important;margin:0!important;padding:0!important;overflow:visible!important;clip:auto!important;white-space:normal!important;background:#0e1230;min-height:100vh}[data-page] button{display:none}`}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
