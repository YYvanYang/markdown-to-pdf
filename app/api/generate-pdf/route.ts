import { NextRequest, NextResponse } from 'next/server';

// 获取环境变量中的API密钥
const API2PDF_API_KEY = process.env.API2PDF_API_KEY || '';

// API2PDF v2 的基础URL
const API2PDF_BASE_URL = 'https://v2.api2pdf.com';

// 预处理 HTML，添加必要的库和脚本
function enhanceHtml(html: string): string {
  // 创建一个基础的 HTML 模板，包含所有必要的库
  const enhancedHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enhanced Markdown</title>
  
  <!-- Gemoji 支持 -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/emoji-toolkit@7.0.0/extras/css/joypixels.min.css">
  <script src="https://cdn.jsdelivr.net/npm/emoji-toolkit@7.0.0/lib/js/joypixels.min.js"></script>
  
  <!-- MathJax 支持 -->
  <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  
  <!-- Mermaid 支持 -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>
    // 初始化 Mermaid
    document.addEventListener('DOMContentLoaded', function() {
      mermaid.initialize({ startOnLoad: true });
      
      // 处理 Gemoji
      document.body.innerHTML = joypixels.shortnameToImage(document.body.innerHTML);
      
      // 确保 MathJax 重新渲染
      if (typeof MathJax !== 'undefined') {
        MathJax.typeset();
      }
      
      // 给 Chrome 引擎一些时间来渲染所有内容
      setTimeout(function() {
        // 发送一个信号表明内容已准备好
        console.log('Content fully rendered');
      }, 2000);
    });
  </script>
  
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      padding: 20px;
    }
    pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
    }
    code {
      font-family: 'Courier New', Courier, monospace;
    }
    .mermaid {
      text-align: center;
    }
    /* 确保 MathJax 公式正确显示 */
    .math-display {
      overflow-x: auto;
      margin: 1em 0;
    }
  </style>
</head>
<body>
  ${html}
  
  <script>
    // 查找所有 Mermaid 代码块并处理
    document.querySelectorAll('pre code.language-mermaid').forEach(function(element) {
      const mermaidDiv = document.createElement('div');
      mermaidDiv.className = 'mermaid';
      mermaidDiv.innerHTML = element.textContent;
      element.parentNode.replaceWith(mermaidDiv);
    });
  </script>
</body>
</html>
  `;
  
  return enhancedHtml;
}

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const { content, fileName } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: '缺少HTML内容' },
        { status: 400 }
      );
    }

    // 检查API密钥是否已配置
    if (!API2PDF_API_KEY) {
      return NextResponse.json(
        { error: '未配置API2PDF API密钥，请在环境变量中设置API2PDF_API_KEY' },
        { status: 500 }
      );
    }
    
    // 增强 HTML 内容，添加必要的库和脚本
    const enhancedContent = enhanceHtml(content);
    
    // 使用API2PDF v2 API的Chrome引擎 - 根据curl示例调整参数
    const response = await fetch(`${API2PDF_BASE_URL}/chrome/pdf/html`, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': API2PDF_API_KEY
      },
      body: JSON.stringify({
        Html: enhancedContent,
        FileName: fileName || 'document.pdf',
        Inline: false,
        UseCustomStorage: false,
        Options: {
          Delay: 2000, // 增加延迟，给 JS 足够的时间渲染
          Scale: 1,
          DisplayHeaderFooter: false,
          HeaderTemplate: "<span></span>",
          FooterTemplate: "<span></span>",
          PrintBackground: true,
          Landscape: false,
          PageRanges: "",
          Width: "8.27in",
          Height: "11.69in",
          MarginTop: ".4in",
          MarginBottom: ".4in",
          MarginLeft: ".4in",
          MarginRight: ".4in",
          PreferCSSPageSize: true,
          OmitBackground: false,
          Tagged: true,
          Outline: false,
          UsePrintCss: true,
          WaitForNetworkIdle: true // 等待网络空闲，确保所有资源加载完成
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API2PDF 请求失败: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result || !result.FileUrl) {
      throw new Error('PDF生成失败');
    }
    
    // 获取PDF文件的URL
    const pdfUrl = result.FileUrl;
    
    // 获取PDF文件内容
    const pdfResponse = await fetch(pdfUrl);
    
    if (!pdfResponse.ok) {
      throw new Error(`获取PDF文件失败: ${pdfResponse.statusText}`);
    }
    
    const pdfBuffer = await pdfResponse.arrayBuffer();
    
    // 返回PDF文件
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName || 'document.pdf'}"`,
      },
    });
    
  } catch (error) {
    console.error('PDF生成错误:', error);
    return NextResponse.json(
      { error: '生成PDF时发生错误' },
      { status: 500 }
    );
  }
} 