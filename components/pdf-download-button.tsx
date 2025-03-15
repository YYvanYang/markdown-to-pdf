'use client';

import React from 'react';
import { useMarkdown } from '@/lib/markdownContext';
import dynamic from 'next/dynamic';

// 动态导入PDF生成器组件，避免SSR问题
const Api2pdfGenerator = dynamic(() => import('./api2pdf-generator'), { 
  ssr: false,
  loading: () => (
    <button 
      className="flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-md opacity-80 cursor-not-allowed"
      disabled
    >
      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      加载中...
    </button>
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
      <button 
        className="flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-md opacity-80 cursor-not-allowed"
        disabled
      >
        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        加载中...
      </button>
    );
  }

  return (
    <div className={`${className}`}>
      <Api2pdfGenerator 
        markdown={markdown} 
        fileName={fileName} 
      />
    </div>
  );
}