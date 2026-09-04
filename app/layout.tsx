import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chou's Vibe Projects",
  description: "周文康的 Vibe Coding 项目入口。",
  icons: {
    icon: "/brand-mark.png",
    shortcut: "/brand-mark.png",
  },
  openGraph: {
    title: "Chou's Vibe Projects",
    description: "A compact launchpad for things I build.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
