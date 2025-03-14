'use client';

import { useState, useEffect } from 'react';
import { useMarkdown } from '@/lib/markdownContext';
import { PdfDownloadButton } from '@/components/pdf-download-button';

// ByteMD 导入
import { Editor } from '@bytemd/react';
import type { BytemdLocale, BytemdPlugin } from 'bytemd';
import 'bytemd/dist/index.css';

// ByteMD 插件
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import math from '@bytemd/plugin-math';
import mermaid from '@bytemd/plugin-mermaid';
import gemoji from '@bytemd/plugin-gemoji';
import breaks from '@bytemd/plugin-breaks';

// 导入插件样式
import 'highlight.js/styles/github.css';
import 'katex/dist/katex.css';

export default function Home() {
  const { markdown, setMarkdown } = useMarkdown();
  const [isClient, setIsClient] = useState(false);

  // ByteMD 插件配置
  const plugins: BytemdPlugin[] = [
    gfm(),
    highlight(),
    math(),
    mermaid(),
    gemoji(),
    breaks(),
  ];

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

1. 在编辑器中输入 Markdown 内容
2. 点击预览按钮查看效果
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
      <header className="bg-slate-800 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold">Markdown 到 PDF 转换器</h1>
          <div className="w-auto">
            <PdfDownloadButton 
              fileName="markdown-document.pdf"
              className="w-auto"
            />
          </div>
        </div>
      </header>
      
      <main className="flex flex-1 flex-col p-4 md:p-6 max-w-6xl mx-auto w-full">
        <div className="flex-1 border rounded-md shadow-md overflow-hidden h-[calc(100vh-180px)]">
          {isClient && (
            <Editor
              value={markdown}
              plugins={plugins}
              onChange={setMarkdown}
              mode="split"
              locale={{
                write: '编辑',
                preview: '预览',
                fullscreen: '全屏',
                exitFullscreen: '退出全屏',
                // 基本操作
                h1: '一级标题',
                h2: '二级标题',
                h3: '三级标题',
                h4: '四级标题',
                h5: '五级标题',
                h6: '六级标题',
                bold: '粗体',
                italic: '斜体',
                strikethrough: '删除线',
                quote: '引用',
                link: '链接',
                image: '图片',
                code: '代码',
                codeBlock: '代码块',
                unorderedList: '无序列表',
                orderedList: '有序列表',
                taskList: '任务列表',
                table: '表格',
                help: '帮助',
              } as Partial<BytemdLocale>}
            />
          )}
        </div>
      </main>
      
      <footer className="p-3 md:p-4 border-t bg-white dark:bg-gray-900 text-center text-sm text-gray-500">
        <div className="max-w-6xl mx-auto">
          Markdown 到 PDF 转换器 &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
