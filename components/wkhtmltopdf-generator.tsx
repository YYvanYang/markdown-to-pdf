'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
    const markdownHtml = await renderMarkdownToHtml(content);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${fileName}</title>
        <style>
          body {
            font-family: "Noto Sans SC", "Noto Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-weight: 600;
            line-height: 1.25;
          }
          h1 {
            font-size: 2em;
            border-bottom: 1px solid #eaecef;
            padding-bottom: 0.3em;
          }
          h2 {
            font-size: 1.5em;
            border-bottom: 1px solid #eaecef;
            padding-bottom: 0.3em;
          }
          h3 { font-size: 1.25em; }
          h4 { font-size: 1em; }
          h5 { font-size: 0.875em; }
          h6 { font-size: 0.85em; color: #6a737d; }
          
          p, ul, ol, blockquote {
            margin-top: 0;
            margin-bottom: 16px;
          }
          
          a { color: #0366d6; text-decoration: none; }
          a:hover { text-decoration: underline; }
          
          code {
            font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
            background-color: rgba(27, 31, 35, 0.05);
            border-radius: 3px;
            font-size: 85%;
            padding: 0.2em 0.4em;
          }
          
          pre {
            background-color: #f6f8fa;
            border-radius: 3px;
            font-size: 85%;
            line-height: 1.45;
            overflow: auto;
            padding: 16px;
            border: 1px solid #e1e4e8;
            margin-bottom: 16px;
          }
          
          pre code {
            background-color: transparent;
            padding: 0;
            font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
          }
          
          /* Kindle 优化的代码高亮样式 */
          .token.comment,
          .token.prolog,
          .token.doctype,
          .token.cdata {
            color: #5D6C79;
            font-style: italic;
          }
          
          .token.punctuation {
            color: #24292e;
          }
          
          .token.property,
          .token.tag,
          .token.boolean,
          .token.number,
          .token.constant,
          .token.symbol {
            color: #005CC5;
          }
          
          .token.selector,
          .token.attr-name,
          .token.string,
          .token.char,
          .token.builtin {
            color: #032F62;
          }
          
          .token.operator,
          .token.entity,
          .token.url,
          .token.variable {
            color: #24292e;
            background: transparent;
          }
          
          .token.atrule,
          .token.attr-value,
          .token.keyword {
            color: #D73A49;
            font-weight: bold;
          }
          
          .token.function {
            color: #6F42C1;
          }
          
          .token.regex,
          .token.important {
            color: #C71A16;
          }
          
          .token.important,
          .token.bold {
            font-weight: bold;
          }
          
          .token.italic {
            font-style: italic;
          }
          
          /* 提高Kindle上的代码可读性 */
          @media print {
            pre, code {
              page-break-inside: avoid;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            
            pre code {
              font-size: 14px !important;
              line-height: 1.5 !important;
            }
            
            .token.comment,
            .token.prolog,
            .token.doctype,
            .token.cdata {
              font-style: italic;
              font-weight: normal;
            }
            
            .token.keyword,
            .token.important,
            .token.bold {
              font-weight: 700;
            }
          }
          
          blockquote {
            border-left: 0.25em solid #dfe2e5;
            color: #6a737d;
            padding: 0 1em;
          }
          
          img {
            max-width: 100%;
          }
          
          table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 16px;
          }
          
          table th, table td {
            border: 1px solid #dfe2e5;
            padding: 6px 13px;
          }
          
          table tr {
            background-color: #fff;
            border-top: 1px solid #c6cbd1;
          }
          
          table tr:nth-child(2n) {
            background-color: #f6f8fa;
          }
          
          hr {
            height: 0.25em;
            padding: 0;
            margin: 24px 0;
            background-color: #e1e4e8;
            border: 0;
          }
          
          .footer {
            margin-top: 30px;
            text-align: right;
            font-size: 0.8em;
            color: #6a737d;
          }
        </style>
      </head>
      <body>
        <div class="markdown-body">
          ${markdownHtml}
        </div>
        <div class="footer">
          Generated: ${new Date().toISOString().replace('T', ' ').substring(0, 19)}
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
    <Button
      onClick={generatePdf}
      disabled={isGenerating}
      className={`w-full h-12 md:h-14 text-base flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 shadow-md hover:shadow-lg ${className}`}
    >
      {isGenerating ? (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <svg className="animate-spin" style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating PDF...
        </span>
      ) : error ? (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          Generation failed, please try again
        </span>
      ) : (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export to PDF
        </span>
      )}
    </Button>
  );
} 