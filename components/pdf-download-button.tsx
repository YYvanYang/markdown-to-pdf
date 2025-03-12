'use client';

import React from 'react';
import { useMarkdown } from '@/lib/markdownContext';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

// 动态导入PDF生成器组件，避免SSR问题
const PdfGenerator = dynamic(() => import('./pdf-generator'), { 
  ssr: false,
  loading: () => <Button size="lg" className="w-full" disabled>加载PDF组件...</Button> 
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
    return <Button size="lg" className={`w-full ${className}`} disabled>正在加载...</Button>;
  }

  // 如果没有内容，禁用按钮
  if (!markdown.trim()) {
    return <Button size="lg" className={`w-full ${className}`} disabled>请先添加内容</Button>;
  }

  return (
    <div className={`w-full ${className}`}>
      <PdfGenerator 
        markdown={markdown} 
        fileName={fileName}
      />
    </div>
  );
}