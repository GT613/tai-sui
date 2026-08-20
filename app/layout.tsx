import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "太岁：雾下见天光",
  description: "以 priest 小说《太岁》世界观改编的搜打撤网页游戏。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
