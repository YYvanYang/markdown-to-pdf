'use client';

import React from 'react';
import { use } from 'react';
import { MarkdownContext } from '@/lib/markdownContext';

interface ConditionalMarkdownDisplayProps {
  condition: boolean;
  fallback?: React.ReactNode;
}

export function ConditionalMarkdownDisplay({ 
  condition, 
  fallback = <p>条件不满足，无法显示内容</p> 
}: ConditionalMarkdownDisplayProps) {
  
  // 使用use API的优势：可以在条件语句中使用
  if (condition) {
    // 只有当条件满足时才会访问Context
    const context = use(MarkdownContext);
    
    if (!context) {
      return <p>未找到Markdown上下文</p>;
    }
    
    const { markdown } = context;
    
    if (!markdown.trim()) {
      return <p>没有Markdown内容可显示</p>;
    }
    
    return (
      <div className="p-4 border rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">条件性显示的Markdown内容</h3>
        <div className="prose">
          <pre className="whitespace-pre-wrap">{markdown.substring(0, 100)}...</pre>
        </div>
      </div>
    );
  }
  
  // 条件不满足时返回fallback
  return <>{fallback}</>;
} 