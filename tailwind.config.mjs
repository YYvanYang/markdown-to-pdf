/** @type {import('tailwindcss').Config} */
export default {
  // 在 Tailwind CSS v4.0 中，content 配置是可选的，但我们仍然可以指定
  // content: [
  //   "./app/**/*.{js,ts,jsx,tsx,mdx}",
  //   "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  //   "./components/**/*.{js,ts,jsx,tsx,mdx}",
  // ],
  theme: {
    extend: {},
  },
  plugins: [
    // 使用 ESM 语法导入 typography 插件
    (await import('@tailwindcss/typography')).default,
  ],
} 