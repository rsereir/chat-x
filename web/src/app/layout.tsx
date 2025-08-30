import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "antd/dist/reset.css";
import { App as AntApp, ConfigProvider, theme as antdTheme } from "antd";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChatX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ConfigProvider
          theme={{
            algorithm: antdTheme.defaultAlgorithm,
            token: {
              colorPrimary: "#2563eb",
              colorInfo: "#0ea5e9",
              borderRadiusLG: 16,
              borderRadius: 12,
              colorBgBase: "#f7f8fb",
              colorTextBase: "#0f172a",
            },
          }}
        >
          <div className="background" />
          <AntApp>{children}</AntApp>
        </ConfigProvider>
      </body>
    </html>
  );
}
