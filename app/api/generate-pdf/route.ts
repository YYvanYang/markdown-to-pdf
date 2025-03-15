import { NextRequest, NextResponse } from 'next/server';
import Api2Pdf from 'api2pdf';

// 获取环境变量中的API密钥
const API2PDF_API_KEY = process.env.API2PDF_API_KEY || '';

// 初始化Api2Pdf客户端
const api2pdf = new Api2Pdf(API2PDF_API_KEY);

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
    
    // 使用Api2Pdf将HTML转换为PDF
    const result = await api2pdf.wkHtmlToPdf.convertHtml({
      html: content,
      fileName: fileName,
      options: {
        marginLeft: '20',
        marginRight: '20',
        marginTop: '20',
        marginBottom: '20',
        pageSize: 'A4',
      }
    });
    
    if (!result || !result.pdf) {
      throw new Error('PDF生成失败');
    }
    
    // 获取PDF文件的URL
    const pdfUrl = result.pdf;
    
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
        'Content-Disposition': `attachment; filename="${fileName}"`,
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