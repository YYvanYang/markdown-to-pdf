'use client';

import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Viewer } from '@bytemd/react';

// 导入 ByteMD 官方插件
import gfm from '@bytemd/plugin-gfm';
import mathSsr from '@bytemd/plugin-math-ssr';
import gemoji from '@bytemd/plugin-gemoji';
import highlightSsr from '@bytemd/plugin-highlight-ssr';
import breaks from '@bytemd/plugin-breaks';

// 导入必要的样式
import 'bytemd/dist/index.css';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/default.css';
import 'github-markdown-css/github-markdown-light.css';

interface Api2pdfGeneratorProps {
  markdown: string;
  fileName?: string;
  className?: string;
}

export default function Api2pdfGenerator({ 
  markdown, 
  fileName = 'document.pdf',
  className = ''
}: Api2pdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 确保文件名有.pdf后缀
  const safeFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  
  // 处理LaTeX数学公式，确保所有格式的公式都能被识别
  const processLatexFormulas = (content: string): string => {
    try {
      // 处理行内公式: $formula$ -> $formula$
      let processedContent = content.replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g, (match, formula) => {
        return `$${formula}$`;
      });
      
      // 处理块级公式: $$formula$$ -> $$formula$$
      processedContent = processedContent.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
        return `$$${formula}$$`;
      });
      
      // 处理 \displaystyle 标记确保正确渲染
      processedContent = processedContent.replace(/\\displaystyle/g, '');
      
      return processedContent;
    } catch (err) {
      console.error('处理LaTeX公式失败:', err);
      return content;
    }
  };
  
  const generatePdf = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // 创建一个临时 iframe 来渲染和捕获内容
      const iframe = document.createElement('iframe');
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.position = 'absolute';
      iframe.style.top = '-9999px';
      document.body.appendChild(iframe);
      
      if (!iframe.contentDocument) {
        throw new Error('无法创建 iframe 文档');
      }
      
      // 处理数学公式
      const formulaProcessed = processLatexFormulas(markdown);
      
      // 处理 Mermaid 图表
      const processedContent = await processMermaidInMarkdown(formulaProcessed);
      
      // 在 iframe 中渲染内容
      const htmlContent = await renderContentInIframe(iframe, processedContent, safeFileName);
      
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
      document.body.removeChild(iframe);
      
    } catch (err) {
      console.error('PDF生成错误:', err);
      setError(err instanceof Error ? err.message : '生成PDF时发生未知错误');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // 处理 Mermaid 图表，将它们转换为预渲染的 SVG
  const processMermaidInMarkdown = async (content: string): Promise<string> => {
    try {
      // 动态导入 mermaid
      const mermaid = await import('mermaid');
      await mermaid.default.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'Noto Sans SC, sans-serif'
      });
      
      // 查找所有 mermaid 代码块
      const mermaidPattern = /```mermaid\n([\s\S]*?)\n```/g;
      let match;
      let processedContent = content;
      let index = 0;
      
      // 替换每个 mermaid 代码块为静态 SVG
      while ((match = mermaidPattern.exec(content)) !== null) {
        try {
          const mermaidCode = match[1];
          const id = `mermaid-diagram-${index++}`;
          
          // 渲染 mermaid 为 SVG
          const { svg } = await mermaid.default.render(id, mermaidCode);
          
          // 替换代码块为带有明确尺寸的 SVG
          processedContent = processedContent.replace(
            match[0],
            `<div class="mermaid-svg" style="text-align:center; margin:1em 0;">${svg}</div>`
          );
        } catch (err) {
          console.error('渲染 Mermaid 图表失败:', err);
          // 在失败的情况下添加错误提示
          processedContent = processedContent.replace(
            match[0],
            `<div class="mermaid-error" style="color:red; text-align:center; padding:1em; border:1px solid red;">Mermaid 图表渲染失败: ${err instanceof Error ? err.message : '未知错误'}</div>`
          );
        }
      }
      
      return processedContent;
    } catch (err) {
      console.error('处理 Mermaid 图表失败:', err);
      return content;
    }
  };
  
  // 在 iframe 中渲染内容，这样可以利用浏览器的渲染能力
  const renderContentInIframe = async (iframe: HTMLIFrameElement, content: string, title: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!iframe.contentDocument) {
        reject(new Error('无法访问 iframe 文档'));
        return;
      }
      
      // 创建一个完整的 HTML 文档
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <!-- 预加载字体以确保PDF中显示正确 -->
          <link rel="preload" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap" as="style">
          <link rel="preload" href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600&display=swap" as="style">
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap">
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600&display=swap">
          <!-- 加载 KaTeX CSS -->
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
          <!-- 加载 KaTeX JS 并确保它在页面加载前就准备好 -->
          <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
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
            
            /* KaTeX 样式 */
            .katex {
              font-size: 1.1em !important;
              display: inline-block;
            }
            
            .katex-display {
              display: block;
              margin: 1em 0;
              text-align: center;
              overflow-x: auto;
              overflow-y: hidden;
            }
            
            .katex-display > .katex {
              display: inline-block;
              text-align: initial;
              max-width: 100%;
            }
            
            /* Mermaid SVG 样式 */
            .mermaid-svg {
              text-align: center !important;
              margin: 1em auto !important;
              display: block !important;
              width: 100% !important;
            }
            
            .mermaid-svg svg {
              max-width: 100% !important;
              height: auto !important;
              display: inline-block !important;
            }
            
            /* Gemoji 样式 */
            .emoji {
              height: 1.2em;
              width: 1.2em;
              margin: 0 .05em 0 .1em;
              vertical-align: -0.1em;
            }
            
            /* Markdown 样式 */
            .markdown-body {
              font-family: 'Noto Sans SC', sans-serif;
            }
          </style>
        </head>
        <body>
          <div class="container markdown-body" id="content">
          </div>
          <script>
            // 等待页面加载完成后再处理公式
            document.addEventListener('DOMContentLoaded', function() {
              try {
                // 渲染所有公式
                renderMathInElement(document.body, {
                  delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false}
                  ],
                  throwOnError : false
                });
                
                // 额外处理具有特定类的元素
                document.querySelectorAll('.math').forEach(el => {
                  const displayMode = el.classList.contains('math-display');
                  try {
                    katex.render(el.textContent || '', el, { 
                      displayMode: displayMode,
                      throwOnError: false,
                      output: 'html'
                    });
                  } catch (e) {
                    console.error('KaTeX 渲染错误:', e);
                  }
                });
              } catch (e) {
                console.error('数学公式渲染错误:', e);
              }
            });
          </script>
        </body>
        </html>
      `;
      
      // 写入 HTML 内容
      iframe.contentDocument.open();
      iframe.contentDocument.write(htmlContent);
      iframe.contentDocument.close();
      
      // 使用 ByteMD 渲染 Markdown
      const container = iframe.contentDocument.getElementById('content');
      if (!container) {
        reject(new Error('无法找到内容容器'));
        return;
      }
      
      // 创建 ByteMD Viewer
      const root = createRoot(container);
      const plugins = [
        gfm(),
        mathSsr({
          katexOptions: {
            throwOnError: false,
            output: 'html',
            trust: true
          }
        }),
        gemoji(),
        highlightSsr(),
        breaks()
      ];
      
      // 渲染内容
      root.render(
        <Viewer value={content} plugins={plugins} />
      );
      
      // 等待内容渲染完成 - 增加等待时间确保复杂内容渲染完成
      setTimeout(() => {
        try {
          // 手动触发数学公式渲染
          if (iframe.contentWindow && iframe.contentDocument) {
            // 使用类型断言处理无法识别的全局函数
            const renderMathFn = (iframe.contentWindow as any).renderMathInElement;
            if (typeof renderMathFn === 'function') {
              renderMathFn(iframe.contentDocument.body, {
                delimiters: [
                  {left: '$$', right: '$$', display: true},
                  {left: '$', right: '$', display: false}
                ],
                throwOnError: false
              });
            }
          }
          
          // 捕获完整的 HTML
          const capturedHtml = iframe.contentDocument?.documentElement.outerHTML || '';
          root.unmount();
          resolve(capturedHtml);
        } catch (err) {
          console.error('捕获HTML内容时出错:', err);
          const capturedHtml = iframe.contentDocument?.documentElement.outerHTML || '';
          root.unmount();
          resolve(capturedHtml);
        }
      }, 2000); // 增加等待时间到2秒，让KaTeX和其他内容完全渲染
    });
  };
  
  return (
    <button
      onClick={generatePdf}
      disabled={isGenerating || !markdown}
      className={`flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors ${className} ${(!markdown || isGenerating) ? 'opacity-70 cursor-not-allowed' : ''}`}
      title={error ? `生成PDF时发生错误: ${error}` : '将当前Markdown内容导出为PDF文件'}
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          重试
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          导出PDF
        </>
      )}
    </button>
  );
} 