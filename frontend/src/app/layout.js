"use client";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { usePathname } from "next/navigation";

function AppShell({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="min-h-screen bg-obsidian-950">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-obsidian-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>CloudOps Sentinel — Cloud Management & Monitoring Services</title>
        <meta
          name="description"
          content="Automated Deployment, Cloud Monitoring & Self-Healing Platform"
        />
      </head>
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
