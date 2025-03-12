'use client';

import React from 'react';
import { useMarkdown } from '@/lib/markdownContext';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

// 动态导入PDF生成器组件，避免SSR问题
const WkhtmltopdfGenerator = dynamic(() => import('./wkhtmltopdf-generator'), { 
  ssr: false,
  loading: () => (
    <Button 
      size="lg" 
      className="w-full h-12 md:h-14 text-base flex items-center justify-center" 
      disabled
    >
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      加载PDF组件...
    </Button>
  )
});

interface PdfDownloadButtonProps {
  fileName?: string;
  className?: string;
}

export function PdfDownloadButton({ 
  fileName = 'markdown-document.pdf',
  className = ''
}: PdfDownloadButtonProps) {
  const { markdown } = useMarkdown();
  const [isClient, setIsClient] = React.useState(false);

  // 确保我们在客户端
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Button 
        size="lg" 
        className={`w-full h-12 md:h-14 text-base flex items-center justify-center ${className}`} 
        disabled
      >
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        正在加载...
      </Button>
    );
  }

  // 如果没有内容，禁用按钮
  if (!markdown.trim()) {
    return (
      <Button 
        size="lg" 
        className={`w-full h-12 md:h-14 text-base ${className}`} 
        disabled
      >
        请先添加内容
      </Button>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <WkhtmltopdfGenerator 
        markdown={markdown} 
        fileName={fileName}
        className={className}
      />
    </div>
  );
}