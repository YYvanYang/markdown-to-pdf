'use client';

import { useState, useEffect } from 'react';
import { useMarkdown } from '@/lib/markdownContext';
import { PdfDownloadButton } from '@/components/pdf-download-button';
import { ConditionalMarkdownDisplay } from '@/components/conditional-markdown-display';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Home() {
  const { markdown, setMarkdown } = useMarkdown();
  const [isClient, setIsClient] = useState(false);
  const [showConditional, setShowConditional] = useState(false);

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

### 表格示例

| 名称 | 类型 | 描述 |
| ---- | ---- | ---- |
| 名称1 | 类型1 | 这是描述1 |
| 名称2 | 类型2 | 这是描述2 |

### 任务列表

- [x] 已完成任务
- [ ] 未完成任务
- [ ] 另一个未完成任务
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
          <div className="flex-1 p-4 border rounded-md overflow-auto prose prose-sm max-w-none">
            {isClient && (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            )}
            {!isClient && <p>加载中...</p>}
          </div>
        </div>
      </main>
      
      <div className="p-4 bg-gray-50 border-t border-b">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-2">React use API 演示</h3>
          <p className="mb-4">这个示例展示了如何在条件语句中使用 Context（传统的 useContext 无法做到）</p>
          
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
            onClick={() => setShowConditional(!showConditional)}
          >
            {showConditional ? '隐藏' : '显示'} Markdown 摘要
          </button>
          
          <ConditionalMarkdownDisplay 
            condition={showConditional} 
            fallback={<p className="italic text-gray-500">点击上面的按钮查看 Markdown 摘要</p>}
          />
        </div>
      </div>
      
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
