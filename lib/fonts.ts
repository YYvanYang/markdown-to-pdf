import { Noto_Sans_SC, Roboto, Source_Code_Pro } from 'next/font/google';

// 加载 Noto Sans SC 字体（支持中文）
export const notoSansSC = Noto_Sans_SC({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-sc',
});

// 加载 Roboto 字体
export const roboto = Roboto({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

// 加载 Source Code Pro 字体（等宽字体）
export const sourceCodePro = Source_Code_Pro({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-code-pro',
}); 