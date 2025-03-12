'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MarkdownContextType {
  markdown: string;
  setMarkdown: (markdown: string) => void;
}

const MarkdownContext = createContext<MarkdownContextType | undefined>(undefined);

export function MarkdownProvider({ children }: { children: ReactNode }) {
  const [markdown, setMarkdown] = useState<string>('');

  return (
    <MarkdownContext.Provider value={{ markdown, setMarkdown }}>
      {children}
    </MarkdownContext.Provider>
  );
}

export function useMarkdown() {
  const context = useContext(MarkdownContext);
  if (context === undefined) {
    throw new Error('useMarkdown must be used within a MarkdownProvider');
  }
  return context;
} 