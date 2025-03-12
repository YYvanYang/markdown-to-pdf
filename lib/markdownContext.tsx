'use client';

import React, { createContext, useState, ReactNode, use } from 'react';

interface MarkdownContextType {
  markdown: string;
  setMarkdown: (markdown: string) => void;
}

// 导出MarkdownContext，使其可以在其他组件中直接使用
export const MarkdownContext = createContext<MarkdownContextType | undefined>(undefined);

export function MarkdownProvider({ children }: { children: ReactNode }) {
  const [markdown, setMarkdown] = useState<string>('');

  return (
    <MarkdownContext.Provider value={{ markdown, setMarkdown }}>
      {children}
    </MarkdownContext.Provider>
  );
}

export function useMarkdown() {
  const context = use(MarkdownContext);
  if (context === undefined) {
    throw new Error('useMarkdown must be used within a MarkdownProvider');
  }
  return context;
} 