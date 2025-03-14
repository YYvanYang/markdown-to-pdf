'use client';

import { useMarkdown } from '@/lib/markdownContext';
import { useState } from 'react';

const templates = [
  { id: 'default', name: '默认模板', path: '/templates/default.md' },
  { id: 'simple', name: '简单模板', path: '/templates/simple.md' },
  { id: 'academic', name: '学术模板', path: '/templates/academic.md' },
];

export function TemplateSelector() {
  const { setMarkdown } = useMarkdown();
  const [isLoading, setIsLoading] = useState(false);

  const loadTemplate = async (templatePath: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(templatePath);
      const text = await response.text();
      setMarkdown(text);
    } catch (error) {
      console.error('加载模板失败:', error);
      setMarkdown('# 模板加载失败\n\n请重试或选择其他模板。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      <span className="text-sm mr-2 hidden sm:inline-block">模板:</span>
      <div className="relative inline-block">
        <div className="flex items-center">
          <select
            className="appearance-none bg-blue-100 border border-blue-300 rounded-md text-sm py-2 pl-3 pr-8 text-blue-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              const selectedTemplate = templates.find(t => t.id === e.target.value);
              if (selectedTemplate) {
                loadTemplate(selectedTemplate.path);
              }
            }}
            disabled={isLoading}
          >
            <option value="">学术模板</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 flex items-center px-2 text-blue-800">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
      {isLoading && <span className="text-sm text-white ml-2">加载中...</span>}
    </div>
  );
} 