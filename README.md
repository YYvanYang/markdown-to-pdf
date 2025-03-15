# Markdown to PDF 转换器

一个简单但功能强大的Markdown到PDF转换器，基于Next.js、ByteMD和Html到PDF转换功能。

## 功能特点

- 使用ByteMD的Markdown编辑器，支持实时预览
- 支持常见Markdown扩展（GFM、数学公式、Mermaid图表等）
- 提供多种PDF模板选择
- 使用浏览器原生功能生成高质量PDF文件
- 可部署到Vercel等无服务器平台

## 部署到Vercel

1. Fork或克隆此仓库
2. 部署项目到Vercel

## 本地开发

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm run dev
```

### 构建生产版本

```bash
pnpm run build
```

## 技术栈

- Next.js 15
- React 19
- ByteMD (Markdown编辑器)
- Tailwind CSS (样式)

## 依赖的主要包

- @bytemd/react - Markdown编辑器组件
- @bytemd/plugin-* - 各种Markdown扩展插件（GFM、数学公式、Mermaid图表等）
- github-markdown-css - GitHub风格的Markdown样式
- highlight.js - 代码高亮
- katex - 数学公式渲染
- mermaid - 图表渲染

## 许可证

[MIT](LICENSE)