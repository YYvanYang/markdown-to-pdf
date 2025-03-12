import type { Metadata } from "next";
import "./globals.css";
import { MarkdownProvider } from "@/lib/markdownContext";
import { notoSansSC, roboto, sourceCodePro } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Markdown to PDF Converter",
  description: "Convert Markdown to PDF with React",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${notoSansSC.variable} ${roboto.variable} ${sourceCodePro.variable} antialiased`}
      >
        <MarkdownProvider>
          {children}
        </MarkdownProvider>
      </body>
    </html>
  );
}
