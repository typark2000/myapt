import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'myapt',
  description: '실거래가 기준 아파트 구매 가능 예산 계산기'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
