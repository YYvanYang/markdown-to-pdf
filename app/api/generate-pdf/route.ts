import { NextRequest, NextResponse } from 'next/server';

// 获取环境变量中的API密钥
const API2PDF_API_KEY = process.env.API2PDF_API_KEY || '';

// API2PDF v2 的基础URL
const API2PDF_BASE_URL = 'https://v2.api2pdf.com';

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
    
    // 在内容中替换可能有问题的SVG为纯图片（最后的保护措施）
    const processedContent = content
      .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '<img src="https://i.imgur.com/IGLrpej.png" alt="图表" style="max-width:90%; margin:0 auto; display:block;">')
      .replace(/\@import url\([^\)]+\);/g, ''); // 移除所有@import，可能会导致问题
    
    // 使用API2PDF v2 API的Chrome引擎，使用最保守的设置
    const response = await fetch(`${API2PDF_BASE_URL}/chrome/pdf/html`, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': API2PDF_API_KEY
      },
      body: JSON.stringify({
        Html: processedContent,
        FileName: fileName || 'document.pdf',
        Inline: false,
        UseCustomStorage: false,
        Options: {
          Delay: 5000, // 5秒延迟
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
          UsePrintCss: false, // 不使用print CSS
          WaitForNetworkIdle: true,
          ExtraHTTPHeaders: {
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Accept': 'image/*,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124 Safari/537.36',
            'Cache-Control': 'no-cache'
          },
          EmulateMediaType: "screen",
          WaitForReadyState: "complete", // 等待页面完全加载
          BlockAds: false,
          BlockedUrls: [],
          AllowedUrls: ["*", "https://i.imgur.com/*"],
          Timeout: 30000
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
      { error: '生成PDF时发生错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
} 