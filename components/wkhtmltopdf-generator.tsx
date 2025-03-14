'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { createRoot } from 'react-dom/client';

// 添加类型声明
declare module 'react-syntax-highlighter';
declare module 'react-syntax-highlighter/dist/cjs/styles/prism';

interface WkhtmltopdfGeneratorProps {
  markdown: string;
  fileName?: string;
  className?: string;
}

export default function WkhtmltopdfGenerator({ 
  markdown, 
  fileName = 'document.pdf',
  className = ''
}: WkhtmltopdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 确保文件名有.pdf后缀
  const safeFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  
  const generatePdf = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // 获取HTML内容
      const htmlContent = await getHtmlContent(markdown, safeFileName);
      
      // 发送到服务器端API进行PDF生成
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: htmlContent,
          fileName: safeFileName,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`PDF生成失败: ${response.statusText}`);
      }
      
      // 获取PDF文件的blob
      const blob = await response.blob();
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', safeFileName);
      document.body.appendChild(link);
      link.click();
      
      // 清理
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('PDF生成错误:', err);
      setError(err instanceof Error ? err.message : '生成PDF时发生未知错误');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // 获取HTML内容
  async function getHtmlContent(content: string, fileName: string): Promise<string> {
    // 定义HTML模板
    return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${fileName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600&display=swap');
        
        :root {
          --text-color: #333;
          --bg-color: #fff;
          --code-bg: #f5f5f5;
          --border-color: #e0e0e0;
          --link-color: #0066cc;
          --heading-color: #111;
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        html, body {
          font-family: 'Noto Sans SC', sans-serif;
          line-height: 1.6;
          color: var(--text-color);
          background: var(--bg-color);
          font-size: 14px;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2em;
        }
        
        h1, h2, h3, h4, h5, h6 {
          color: var(--heading-color);
          margin-top: 1.5em;
          margin-bottom: 0.75em;
          line-height: 1.3;
        }
        
        h1 {
          font-size: 2em;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.3em;
          margin-top: 0;
        }
        
        h2 {
          font-size: 1.5em;
        }
        
        h3 {
          font-size: 1.25em;
        }
        
        p {
          margin-bottom: 1em;
        }
        
        a {
          color: var(--link-color);
          text-decoration: none;
        }
        
        a:hover {
          text-decoration: underline;
        }
        
        code {
          font-family: 'Source Code Pro', monospace;
          background-color: var(--code-bg);
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-size: 0.9em;
        }
        
        pre {
          background-color: var(--code-bg);
          padding: 1em;
          overflow-x: auto;
          border-radius: 5px;
          margin: 1em 0;
          line-height: 1.45;
        }
        
        pre code {
          background-color: transparent;
          padding: 0;
          border-radius: 0;
          font-size: 0.9em;
        }
        
        blockquote {
          border-left: 4px solid #ddd;
          padding-left: 1em;
          color: #555;
          margin: 1em 0;
        }
        
        img {
          max-width: 100%;
          height: auto;
        }
        
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        
        table, th, td {
          border: 1px solid var(--border-color);
        }
        
        th, td {
          padding: 0.5em;
          text-align: left;
        }
        
        th {
          background-color: var(--code-bg);
          font-weight: 600;
        }
        
        ul, ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        li {
          margin: 0.3em 0;
        }
        
        hr {
          border: none;
          border-top: 1px solid var(--border-color);
          margin: 2em 0;
        }
        
        @media print {
          body {
            font-size: 12pt;
          }
          
          .container {
            max-width: 100%;
            padding: 0;
          }
          
          pre, code {
            background-color: #f9f9f9;
            border: 1px solid #eee;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${await renderMarkdownToHtml(content)}
      </div>
    </body>
    </html>
    `;
  }
  
  // 将Markdown渲染为HTML
  async function renderMarkdownToHtml(content: string): Promise<string> {
    return new Promise((resolve) => {
      // 创建一个临时容器
      const tempDiv = document.createElement('div');
      const reactRoot = document.createElement('div');
      tempDiv.appendChild(reactRoot);
      
      // 使用createRoot将ReactMarkdown渲染到临时div
      const root = createRoot(reactRoot);
      root.render(
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            code({className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '');
              // 检查是否是代码块而不是内联代码
              const isCodeBlock = Boolean(match && className?.includes('language-'));
              
              return isCodeBlock ? (
                <SyntaxHighlighter
                  // @ts-expect-error - 类型定义问题
                  style={solarizedlight}
                  language={match ? match[1] : ''}
                  PreTag="div"
                  customStyle={{
                    // 添加自定义样式，提高可读性
                    fontSize: '14px',
                    lineHeight: '1.5',
                    border: '1px solid #e1e4e8',
                    borderRadius: '6px',
                    // 确保高对比度，适合Kindle
                    backgroundColor: '#fdf6e3',
                    color: '#333',
                  }}
                  codeTagProps={{
                    style: {
                      // 确保代码文本有足够对比度
                      fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                      fontSize: '14px',
                    }
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code 
                  className={className} 
                  style={{
                    // 内联代码样式优化，适合Kindle阅读
                    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                    backgroundColor: '#f6f8fa',
                    border: '1px solid #eaecef',
                    borderRadius: '3px',
                    fontSize: '85%',
                    padding: '0.2em 0.4em',
                    color: '#24292e',
                    // 增加字重，提高在Kindle上的可读性
                    fontWeight: '600',
                  }}
                  {...props}
                >
                  {children}
                </code>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      );
      
      // 等待一小段时间以确保渲染完成
      setTimeout(() => {
        const html = tempDiv.innerHTML;
        root.unmount();
        resolve(html);
      }, 100);
    });
  }
  
  return (
    <button
      onClick={generatePdf}
      disabled={isGenerating || !markdown}
      className={`flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors ${className} ${(!markdown || isGenerating) ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {isGenerating ? (
        <>
          <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          生成中...
        </>
      ) : error ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          重试
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export to PDF
        </>
      )}
    </button>
  );
} 