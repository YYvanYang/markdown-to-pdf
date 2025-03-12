'use client';

import { useState, useEffect } from 'react';
import { useMarkdown } from '@/lib/markdownContext';
import { PdfDownloadButton } from '@/components/pdf-download-button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Home() {
  const { markdown, setMarkdown } = useMarkdown();
  const [isClient, setIsClient] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // 确保我们在客户端
  useEffect(() => {
    setIsClient(true);
    
    // 检测设备类型，在桌面端默认不显示预览
    const isMobile = window.innerWidth < 768;
    setShowPreview(isMobile ? false : false);
    
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

  // 切换到编辑器模式
  const switchToEditor = () => {
    setShowPreview(false);
  };

  // 切换到预览模式
  const switchToPreview = () => {
    setShowPreview(true);
  };

  if (!isClient) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-slate-800 text-white p-4 sticky top-0 z-10">
        <h1 className="text-xl md:text-2xl font-bold text-center">Markdown 到 PDF 转换器</h1>
      </header>
      
      {/* 移动端切换按钮 */}
      <div className="md:hidden flex border-b">
        <button 
          className={`flex-1 py-3 text-center font-medium ${!showPreview ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-gray-600'}`}
          onClick={switchToEditor}
          aria-label="切换到编辑器模式"
        >
          编辑器
        </button>
        <button 
          className={`flex-1 py-3 text-center font-medium ${showPreview ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-gray-600'}`}
          onClick={switchToPreview}
          aria-label="切换到预览模式"
        >
          预览
        </button>
      </div>
      
      <main className="flex flex-1 flex-col md:flex-row p-2 md:p-4 gap-4">
        {/* 编辑器区域 - 在移动端根据状态显示/隐藏 */}
        <div className={`flex-1 flex flex-col ${showPreview ? 'hidden md:flex' : 'flex'}`}>
          <h2 className="text-base md:text-lg font-semibold mb-2">Markdown 编辑器</h2>
          <textarea
            className="flex-1 p-3 md:p-4 border rounded-md font-mono text-sm resize-none"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="在这里输入 Markdown 内容..."
          />
        </div>
        
        {/* 预览区域 - 在移动端根据状态显示/隐藏 */}
        <div className={`flex-1 flex flex-col ${!showPreview ? 'hidden md:flex' : 'flex'}`}>
          <h2 className="text-base md:text-lg font-semibold mb-2">预览</h2>
          <div className="flex-1 p-3 md:p-4 border rounded-md overflow-auto prose prose-sm md:prose max-w-none">
            {isClient && (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            )}
            {!isClient && <p>加载中...</p>}
          </div>
        </div>
      </main>
      
      <footer className="p-3 md:p-4 border-t">
        <div className="max-w-md mx-auto">
          <PdfDownloadButton 
            fileName="markdown-document.pdf"
            className="mt-3 md:mt-4"
          />
        </div>
      </footer>
    </div>
  );
}
