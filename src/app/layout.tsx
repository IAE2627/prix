import type { Metadata, Viewport } from 'next';
import { STUDY_TITLE } from '@/lib/survey';
import './globals.css';

export const metadata: Metadata = {
  title: STUDY_TITLE,
  description:
    "Questionnaire d'étude marketing réalisé par des étudiants du master Marketing-Vente de l'IAE Clermont-Auvergne.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
