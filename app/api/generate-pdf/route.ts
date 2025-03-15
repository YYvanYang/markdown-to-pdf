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
    
    // 使用API2PDF v2 API的Chrome引擎 - 根据curl示例调整参数
    const response = await fetch(`${API2PDF_BASE_URL}/chrome/pdf/html`, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': API2PDF_API_KEY
      },
      body: JSON.stringify({
        Html: content,
        FileName: fileName || 'document.pdf',
        Inline: false,
        UseCustomStorage: false,
        Options: {
          Delay: 0,
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
          UsePrintCss: true
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