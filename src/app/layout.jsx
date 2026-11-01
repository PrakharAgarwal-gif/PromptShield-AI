import './globals.css';
import AppShell from '@/components/layout/AppShell';

export const metadata = {
  title: 'CloudOps Sentinel — Cloud Monitoring & Self-Healing Platform',
  description:
    'Enterprise DevOps SaaS platform for automated deployments, cloud infrastructure monitoring, anomaly detection, and controlled self-healing recovery.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

