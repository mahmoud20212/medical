import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'كلية الطب البشري - أرشيف المساقات',
  description: 'المكتبة الرقمية لكلية الطب البشري',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
