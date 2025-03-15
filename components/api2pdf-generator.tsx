'use client';

import { useState } from 'react';

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
  
  const generatePdf = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // 查找包含页面渲染内容的元素
      const mainContent = document.querySelector('.markdown-body') || 
                          document.querySelector('.bytemd-preview') || 
                          document.querySelector('main');
      
      if (!mainContent) {
        throw new Error('无法找到页面内容，请确保ByteMD已渲染');
      }
      
      console.log('找到内容元素:', mainContent.tagName);
      
      // 获取页面上的所有CSS链接
      const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map(link => link.getAttribute('href'))
        .filter(href => href) as string[];
      
      console.log('找到样式表:', cssLinks.length);
      
      // 创建打印窗口的HTML
      const printHTML = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${safeFileName}</title>
        
        <!-- 引入必要的样式 -->
        ${cssLinks.map(href => `<link rel="stylesheet" href="${href}">`).join('\n')}
        
        <!-- 额外引入一些基本样式确保显示正确 -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css/github-markdown-light.css">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js/styles/default.css">
        
        <style>
          @media print {
            @page {
              size: A4;
              margin: 1.5cm;
            }
            
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .no-print {
              display: none !important;
            }
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 
                         'Open Sans', 'Helvetica Neue', sans-serif;
            padding: 40px;
            background: white;
            color: #333;
            line-height: 1.6;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            border-radius: 5px;
          }
          
          .print-controls {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f5f5f5;
            padding: 10px 15px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            z-index: 1000;
          }
          
          .print-btn {
            background: #0066cc;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            margin-right: 10px;
          }
          
          pre, code, blockquote, table, img {
            page-break-inside: avoid;
          }
          
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          
          img {
            max-width: 100%;
          }
          
          pre {
            background-color: #f6f8fa;
            border-radius: 3px;
            padding: 16px;
            overflow-x: auto;
          }
          
          code {
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 85%;
            background-color: rgba(27, 31, 35, 0.05);
            border-radius: 3px;
            padding: 0.2em 0.4em;
          }
          
          pre code {
            background-color: transparent;
            padding: 0;
          }
          
          /* 针对打印的颜色调整 */
          @media print {
            pre, code {
              background-color: #f6f8fa !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-controls no-print">
          <button class="print-btn" onclick="window.print()">打印</button>
          <button class="print-btn" style="background:#444;" onclick="window.close()">关闭</button>
        </div>
        
        <div class="container markdown-body" id="content">
          <!-- 内容将被插入这里 -->
        </div>
        
        <script>
          // 在页面加载完成后自动打开打印对话框
          window.addEventListener('load', function() {
            // 等待一秒确保样式加载完成
            setTimeout(function() {
              console.log('页面加载完成，准备好进行打印');
            }, 1000);
          });
        </script>
      </body>
      </html>
      `;
      
      // 打开一个新窗口
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        throw new Error('无法创建打印窗口，请检查浏览器是否阻止了弹出窗口');
      }
      
      // 写入基本HTML
      printWindow.document.open();
      printWindow.document.write(printHTML);
      
      // 获取要复制的HTML内容
      const contentHtml = mainContent.innerHTML;
      
      // 直接写入内容，不等待onload
      const contentContainer = printWindow.document.getElementById('content');
      if (contentContainer) {
        contentContainer.innerHTML = contentHtml;
        console.log('已复制内容到打印窗口');
      }
      
      // 关闭文档流
      printWindow.document.close();
      
      // 设置计时器，确保内容已完全加载
      setTimeout(() => {
        try {
          if (printWindow.document.getElementById('content')?.childElementCount === 0) {
            // 内容为空，尝试再次插入
            const container = printWindow.document.getElementById('content');
            if (container) {
              container.innerHTML = contentHtml;
              console.log('重试: 已复制内容到打印窗口');
            }
          }
          
          // 最终设置为未生成状态
          setTimeout(() => {
            setIsGenerating(false);
          }, 2000);
          
        } catch (err) {
          console.error('内容检查时出错:', err);
          setIsGenerating(false);
        }
      }, 1000);
      
      // 添加打印完成事件监听
      printWindow.addEventListener('afterprint', () => {
        setIsGenerating(false);
      });
      
    } catch (err) {
      console.error('PDF导出错误:', err);
      setError(err instanceof Error ? err.message : '导出PDF时发生未知错误');
      setIsGenerating(false);
    }
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
          准备打印...
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