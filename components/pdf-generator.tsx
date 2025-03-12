'use client';

import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFDownloadLink,
  Font,
} from '@react-pdf/renderer';

// 注册字体
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontStyle: 'italic' },
  ],
});

// 创建样式
const styles = StyleSheet.create({
  page: { 
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 1.5,
  },
  section: { 
    marginBottom: 10,
  },
  heading1: { 
    fontSize: 24, 
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    borderBottomStyle: 'solid',
    paddingBottom: 4
  },
  heading2: { 
    fontSize: 20, 
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
  },
  heading3: { 
    fontSize: 16, 
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  heading4: { 
    fontSize: 14, 
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12,
  },
  heading5: { 
    fontSize: 13, 
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 10,
  },
  heading6: { 
    fontSize: 12, 
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 10,
  },
  paragraph: { 
    marginBottom: 12 
  },
  listItem: {
    marginBottom: 4,
    flexDirection: 'row',
  },
  listItemContent: {
    flex: 1,
  },
  listItemBullet: {
    width: 10,
    marginRight: 6,
  },
  listItemNumber: {
    width: 20,
    marginRight: 6,
  },
  blockquote: {
    marginLeft: 16,
    paddingLeft: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EEE',
    borderLeftStyle: 'solid',
    fontStyle: 'italic',
    marginVertical: 10,
  },
  code: {
    fontFamily: 'Courier',
    backgroundColor: '#F3F3F3',
    padding: 4,
    borderRadius: 3,
  },
  codeBlock: {
    fontFamily: 'Courier',
    backgroundColor: '#F3F3F3',
    padding: 8,
    marginVertical: 10,
    fontSize: 10,
    lineHeight: 1.6,
  },
  link: {
    color: '#2563EB',
    textDecoration: 'underline',
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  image: {
    maxWidth: '100%',
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    borderBottomStyle: 'solid',
    marginVertical: 20,
  },
  tableContainer: {
    marginVertical: 10,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#EEE',
    borderStyle: 'solid',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    borderBottomStyle: 'solid',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    borderBottomStyle: 'solid',
    backgroundColor: '#F9F9F9',
  },
  tableHeaderCell: {
    padding: 6,
    fontWeight: 'bold',
    flex: 1,
  },
  tableCell: {
    padding: 6,
    flex: 1,
  },
});

// 解析Markdown内容为PDF组件树
function renderMarkdownElements(content: string) {
  // 这里实现一个简化版的Markdown解析
  // 在实际项目中，您可能需要使用更复杂的解析库
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let inCodeBlock = false;
  let codeBlockContent = '';
  let inOrderedList = false;
  let inUnorderedList = false;
  let listItems: string[] = [];
  let listItemCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 处理代码块
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <View key={`code-${i}`} style={styles.codeBlock}>
            <Text>{codeBlockContent}</Text>
          </View>
        );
        inCodeBlock = false;
        codeBlockContent = '';
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeBlockContent += line + '\n';
      continue;
    }
    
    // 处理有序列表
    if (line.match(/^\d+\.\s/) && !inOrderedList) {
      inOrderedList = true;
      listItems = [line.replace(/^\d+\.\s+/, '')];
    } else if (line.match(/^\d+\.\s/) && inOrderedList) {
      listItems.push(line.replace(/^\d+\.\s+/, ''));
    } else if (inOrderedList && line.trim() === '') {
      // 列表结束
      elements.push(
        <View key={`ol-${i}`} style={styles.section}>
          {listItems.map((item, index) => (
            <View key={`oli-${index}`} style={styles.listItem}>
              <Text style={styles.listItemNumber}>{index + 1}.</Text>
              <Text style={styles.listItemContent}>{item}</Text>
            </View>
          ))}
        </View>
      );
      inOrderedList = false;
      listItems = [];
      listItemCounter = 1;
    }
    
    // 处理无序列表
    else if ((line.trim().startsWith('- ') || line.trim().startsWith('* ')) && !inUnorderedList) {
      inUnorderedList = true;
      listItems = [line.replace(/^[\-\*]\s+/, '')];
    } else if ((line.trim().startsWith('- ') || line.trim().startsWith('* ')) && inUnorderedList) {
      listItems.push(line.replace(/^[\-\*]\s+/, ''));
    } else if (inUnorderedList && line.trim() === '') {
      // 列表结束
      elements.push(
        <View key={`ul-${i}`} style={styles.section}>
          {listItems.map((item, index) => (
            <View key={`uli-${index}`} style={styles.listItem}>
              <Text style={styles.listItemBullet}>•</Text>
              <Text style={styles.listItemContent}>{item}</Text>
            </View>
          ))}
        </View>
      );
      inUnorderedList = false;
      listItems = [];
    }
    
    // 处理标题
    else if (line.startsWith('# ')) {
      elements.push(
        <Text key={`h1-${i}`} style={styles.heading1}>
          {line.substring(2)}
        </Text>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <Text key={`h2-${i}`} style={styles.heading2}>
          {line.substring(3)}
        </Text>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <Text key={`h3-${i}`} style={styles.heading3}>
          {line.substring(4)}
        </Text>
      );
    } else if (line.startsWith('#### ')) {
      elements.push(
        <Text key={`h4-${i}`} style={styles.heading4}>
          {line.substring(5)}
        </Text>
      );
    } else if (line.startsWith('##### ')) {
      elements.push(
        <Text key={`h5-${i}`} style={styles.heading5}>
          {line.substring(6)}
        </Text>
      );
    } else if (line.startsWith('###### ')) {
      elements.push(
        <Text key={`h6-${i}`} style={styles.heading6}>
          {line.substring(7)}
        </Text>
      );
    }
    
    // 处理块引用
    else if (line.startsWith('> ')) {
      elements.push(
        <View key={`quote-${i}`} style={styles.blockquote}>
          <Text>{line.substring(2)}</Text>
        </View>
      );
    }
    
    // 处理水平线
    else if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      elements.push(<View key={`hr-${i}`} style={styles.hr} />);
    }
    
    // 处理普通段落
    else if (line.trim() !== '') {
      // 处理基本的内联样式（粗体、斜体、链接等）
      let text = line;
      
      // 粗体
      text = text.replace(/\*\*(.*?)\*\*/g, (match, p1) => `<strong>${p1}</strong>`);
      text = text.replace(/__(.*?)__/g, (match, p1) => `<strong>${p1}</strong>`);
      
      // 斜体
      text = text.replace(/\*(.*?)\*/g, (match, p1) => `<em>${p1}</em>`);
      text = text.replace(/_(.*?)_/g, (match, p1) => `<em>${p1}</em>`);
      
      // 内联代码
      text = text.replace(/`(.*?)`/g, (match, p1) => `<code>${p1}</code>`);
      
      // 分割特殊标签并渲染
      const parts = text.split(/(<[^>]+>.*?<\/[^>]+>)/g);
      
      elements.push(
        <Text key={`p-${i}`} style={styles.paragraph}>
          {parts.map((part, index) => {
            if (part.startsWith('<strong>')) {
              const content = part.replace(/<\/?strong>/g, '');
              return <Text key={index} style={styles.strong}>{content}</Text>;
            } else if (part.startsWith('<em>')) {
              const content = part.replace(/<\/?em>/g, '');
              return <Text key={index} style={styles.em}>{content}</Text>;
            } else if (part.startsWith('<code>')) {
              const content = part.replace(/<\/?code>/g, '');
              return <Text key={index} style={styles.code}>{content}</Text>;
            } else {
              return part;
            }
          })}
        </Text>
      );
    }
  }
  
  // 处理可能的未结束列表
  if (inOrderedList) {
    elements.push(
      <View key="ol-end" style={styles.section}>
        {listItems.map((item, index) => (
          <View key={`oli-end-${index}`} style={styles.listItem}>
            <Text style={styles.listItemNumber}>{index + 1}.</Text>
            <Text style={styles.listItemContent}>{item}</Text>
          </View>
        ))}
      </View>
    );
  } else if (inUnorderedList) {
    elements.push(
      <View key="ul-end" style={styles.section}>
        {listItems.map((item, index) => (
          <View key={`uli-end-${index}`} style={styles.listItem}>
            <Text style={styles.listItemBullet}>•</Text>
            <Text style={styles.listItemContent}>{item}</Text>
          </View>
        ))}
      </View>
    );
  }
  
  return elements;
}

// Markdown PDF 组件
const MarkdownPDF = ({ content }: { content: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {renderMarkdownElements(content)}
    </Page>
  </Document>
);

// PDF 预览和下载组件
interface PdfGeneratorProps {
  markdown: string;
  fileName?: string;
}

export default function PdfGenerator({ markdown, fileName = 'document.pdf' }: PdfGeneratorProps) {
  return (
    <PDFDownloadLink
      document={<MarkdownPDF content={markdown} />}
      fileName={fileName}
      style={{
        textDecoration: 'none',
        padding: '10px 16px',
        borderRadius: '0.375rem',
        backgroundColor: '#0284c7',
        color: 'white',
        fontWeight: '500',
        display: 'inline-block',
        textAlign: 'center',
        width: '100%',
      }}
    >
      {({ blob, url, loading, error }) => 
        loading ? '生成PDF中...' : '导出为 PDF'
      }
    </PDFDownloadLink>
  );
}