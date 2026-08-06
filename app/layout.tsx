import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chou's Infinite Labs — Project Launchpad",
  description: "一个由 AI、代码、兴趣和偶然灵感组成的个人数字实验室。",
  icons: {
    icon: "/brand-mark.png",
    shortcut: "/brand-mark.png",
  },
  openGraph: {
    title: "Chou's Infinite Labs — Project Launchpad",
    description: "A small universe of useful experiments, built one curiosity at a time.",
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
