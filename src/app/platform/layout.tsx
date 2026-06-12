import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Yönetimi',
  robots: { index: false, follow: false },
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {children}
    </div>
  );
}
