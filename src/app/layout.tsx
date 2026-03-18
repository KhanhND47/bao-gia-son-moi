import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Báo giá sơn xe ô tô",
  description: "Ứng dụng báo giá sơn xe ô tô cho garage/xưởng dịch vụ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
