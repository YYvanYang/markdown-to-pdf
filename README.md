# Markdown to PDF 转换器

一个简单但功能强大的Markdown到PDF转换器，基于Next.js、ByteMD和Api2Pdf。

## 功能特点

- 使用ByteMD的Markdown编辑器，支持实时预览
- 支持常见Markdown扩展（GFM、数学公式、Mermaid图表等）
- 提供多种PDF模板选择
- 使用Api2Pdf云服务生成高质量PDF文件
- 可部署到Vercel等无服务器平台

## 部署到Vercel

1. Fork或克隆此仓库
2. 在[Api2Pdf](https://app.api2pdf.com/signup)注册账号并获取API密钥
3. 在Vercel项目设置中添加环境变量`API2PDF_API_KEY`，值为你的Api2Pdf API密钥
4. 部署项目到Vercel

## 本地开发

### 环境变量设置

1. 复制`.env.local.example`文件为`.env.local`
2. 在`.env.local`文件中设置你的Api2Pdf API密钥：
```
API2PDF_API_KEY=your_api2pdf_key_here
```

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 技术栈

- Next.js 15
- React 19
- ByteMD (Markdown编辑器)
- Api2Pdf (PDF生成服务)
- Tailwind CSS (样式)

## 依赖的主要包

- @bytemd/react - Markdown编辑器组件
- @bytemd/plugin-* - 各种Markdown扩展插件
- api2pdf - Api2Pdf REST API客户端
- react-markdown - 用于HTML预览生成

## 许可证

[MIT](LICENSE)