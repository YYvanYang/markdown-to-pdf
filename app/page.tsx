'use client';

import { useState, useEffect } from 'react';
import { useMarkdown } from '@/lib/markdownContext';
import { PdfDownloadButton } from '@/components/pdf-download-button';
import { TemplateSelector } from '@/components/template-selector';

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

// 导入自定义图片上传插件
import { uploadImagePlugin } from '@/lib/uploadImagePlugin';

// 导入插件样式
import 'highlight.js/styles/default.css';
import 'katex/dist/katex.css';

// 添加GitHub Markdown样式（浅色主题）
import 'github-markdown-css/github-markdown-light.css';

export default function Home() {
  const { markdown, setMarkdown } = useMarkdown();
  const [isClient, setIsClient] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // ByteMD 插件配置
  const plugins: BytemdPlugin[] = [
    gfm(),
    highlight(),
    math(),
    mermaid(),
    gemoji(),
    breaks(),
    uploadImagePlugin(),
  ];

  // 确保我们在客户端
  useEffect(() => {
    setIsClient(true);
    
    // 设置默认Markdown内容
    if (!markdown && !initialized) {
      // 从文件加载默认内容
      fetch('/templates/default.md')
        .then(response => response.text())
        .then(text => {
          setMarkdown(text);
          setInitialized(true);
        })
        .catch(error => {
          console.error('加载默认Markdown内容失败:', error);
          // 如果加载失败，使用简短的默认内容
          setMarkdown('# Markdown 到 PDF 转换器\n\n内容加载失败，请重试。');
          setInitialized(true);
        });
    }
  }, [markdown, setMarkdown, initialized]);

  if (!isClient) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      <header className="bg-slate-800 text-white p-2 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold">Markdown 到 PDF 转换器</h1>
          <div className="flex items-center gap-4">
            <TemplateSelector />
            <PdfDownloadButton 
              fileName="markdown-document.pdf"
              className="w-auto"
            />
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden w-full flex flex-col">
        <div className="flex-1 border rounded-md shadow-md overflow-hidden grid grid-rows-1">
          <style jsx global>{`
            .bytemd {
              height: 100%;
            }
            .grid-rows-1 > div {
              height: 100%;
            }
            /* 确保预览区域使用浅色主题 */
            .bytemd-preview {
              color: #24292e;
              background-color: #fff;
            }
            /* 为markdown-body添加内边距但不修改其主题 */
            .markdown-body {
              padding: 1rem;
            }
          `}</style>
          {isClient && (
            <Editor
              value={markdown}
              plugins={plugins}
              onChange={setMarkdown}
              mode="auto"
              editorConfig={{
                mode: 'text/markdown',
                lineWrapping: true,
                theme: 'default',
              }}
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
      
      <footer className="p-1.5 border-t bg-white dark:bg-gray-900 text-center text-xs text-gray-500">
        <div className="max-w-6xl mx-auto">
          Markdown 到 PDF 转换器 &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
