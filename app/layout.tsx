import type { Metadata, Viewport } from 'next';
import './globals.css';
import './vinyl.css';
export const metadata: Metadata = { title: 'The Listening Room', description: 'A personal home for your vinyl collection and the records still to come.', appleWebApp: { capable: true, title: 'Listening Room', statusBarStyle: 'black-translucent' } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#181512' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
