'use client';

import { useState, useEffect } from 'react';
import { useMarkdown } from '@/lib/markdownContext';
import { PdfDownloadButton } from '@/components/pdf-download-button';
import { marked } from 'marked';

export default function Home() {
  const { markdown, setMarkdown } = useMarkdown();
  const [isClient, setIsClient] = useState(false);

  // 确保我们在客户端
  useEffect(() => {
    setIsClient(true);
    // 设置默认Markdown内容
    if (!markdown) {
      setMarkdown(`# Markdown 到 PDF 转换器

## 简介

这是一个使用 React 和 @react-pdf/renderer 构建的 Markdown 到 PDF 转换工具。

## 功能特点

- 支持基本的 Markdown 语法
- 实时预览
- 高质量 PDF 导出
- 自定义字体和样式

## 使用方法

1. 在左侧编辑器中输入 Markdown 内容
2. 在右侧查看实时预览
3. 点击"导出为 PDF"按钮下载 PDF 文件

## 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

> 这是一个引用块

**粗体文本** 和 *斜体文本*

---

### 列表示例

- 项目 1
- 项目 2
  - 子项目 A
  - 子项目 B
- 项目 3

1. 第一步
2. 第二步
3. 第三步
`);
    }
  }, [markdown, setMarkdown]);

  if (!isClient) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-slate-800 text-white p-4">
        <h1 className="text-2xl font-bold text-center">Markdown 到 PDF 转换器</h1>
      </header>
      
      <main className="flex flex-1 flex-col md:flex-row p-4 gap-4">
        <div className="flex-1 flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Markdown 编辑器</h2>
          <textarea
            className="flex-1 p-4 border rounded-md font-mono text-sm resize-none"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="在这里输入 Markdown 内容..."
          />
        </div>
        
        <div className="flex-1 flex flex-col">
          <h2 className="text-lg font-semibold mb-2">预览</h2>
          <div 
            className="flex-1 p-4 border rounded-md overflow-auto"
            dangerouslySetInnerHTML={{ 
              __html: isClient 
                ? marked(markdown) 
                : '加载中...' 
            }}
          />
        </div>
      </main>
      
      <footer className="p-4 border-t">
        <div className="max-w-md mx-auto">
          <PdfDownloadButton 
            fileName="markdown-document.pdf"
            className="mt-4"
          />
        </div>
      </footer>
    </div>
  );
}
