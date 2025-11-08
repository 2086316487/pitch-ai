import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NetworkStatus } from "@/components/NetworkStatus";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PitchAI - AI智能商业计划书生成器 | 3分钟生成专业商业计划",
  description: "PitchAI是基于大语言模型的创业辅助工具，帮助创业者快速将创业想法转化为完整的商业计划书、PPT演示和市场验证问卷。支持4种专业PPT模板，50+竞品数据库，实时AI生成。",
  keywords: "商业计划书,AI,创业,PPT,市场分析,竞品分析,创业工具,商业计划,pitch,融资",
  authors: [{ name: "PitchAI Team" }],
  creator: "PitchAI",
  publisher: "PitchAI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: "PitchAI - AI智能商业计划书生成器",
    description: "3分钟生成专业商业计划书，支持PPT、PDF、TXT导出，内置竞品分析和市场验证问卷",
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: "PitchAI",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PitchAI - AI智能商业计划书生成器",
    description: "3分钟生成专业商业计划书，支持PPT、PDF、TXT导出",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <NetworkStatus />
        {children}
      </body>
    </html>
  );
}

