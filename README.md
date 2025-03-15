# Markdown 到 PDF 转换器

这是一个基于 Next.js、ByteMD 和 React PDF 的 Markdown 到 PDF 在线转换工具，提供实时预览和高质量 PDF 导出功能。

## 功能特点

- **所见即所得编辑器**：使用 ByteMD 编辑器，支持实时预览和分屏编辑
- **完整的 Markdown 支持**：基于 GitHub Flavored Markdown (GFM)，支持表格、任务列表等扩展语法
- **代码语法高亮**：支持多种编程语言的代码块语法高亮显示
- **数学公式**：支持 LaTeX 数学公式渲染
- **图表支持**：集成 Mermaid 支持流程图、状态图等图表绘制
- **高质量 PDF 导出**：生成美观、专业的 PDF 文档
- **响应式设计**：适配桌面和移动设备显示
- **浅色主题**：采用类似 GitHub 的浅色主题，提供舒适的阅读和编辑体验
- **图片上传功能**：直接从本地上传图片到您的 Markdown 文档

## 技术实现

### 核心技术栈

- **Next.js**：React 框架，提供页面路由和服务端渲染能力
- **ByteMD**：基于 Svelte 的 Markdown 编辑器组件
- **React PDF**：用于生成 PDF 文档的 React 库
- **Tailwind CSS**：用于 UI 样式的实用工具类 CSS 框架

### 主要组件

1. **Markdown 编辑器**：集成 ByteMD 组件，支持各种 Markdown 扩展语法
2. **Markdown 上下文**：使用 React Context API 管理编辑器的 Markdown 内容状态
3. **PDF 下载按钮**：提供生成和下载 PDF 功能的按钮组件 
4. **PDF 生成 API**：服务器端 API 路由，处理 PDF 生成请求

### 插件集成

ByteMD 编辑器集成了以下插件：

- **gfm**：支持 GitHub Flavored Markdown 语法
- **highlight**：代码块语法高亮
- **math**：数学公式渲染
- **mermaid**：图表绘制
- **gemoji**：支持 Emoji 表情符号
- **breaks**：支持换行符

## 使用方法

1. 在编辑器左侧区域输入 Markdown 内容
2. 右侧区域会实时显示渲染后的预览效果
3. 点击页面顶部的"导出为 PDF"按钮下载生成的 PDF 文件

## 开发指南

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建和部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 自定义扩展

该项目可以进一步扩展：

1. **深色模式**：添加深色主题支持
2. **更多导出格式**：支持导出为 HTML、Word 等其他格式
3. **图片上传**：添加图片上传和管理功能
4. **协作编辑**：添加多人实时协作功能
5. **文档历史**：实现文档版本历史和比较功能
6. **模板系统**：提供各种预设的文档模板
7. **页眉页脚和页面设置**：自定义 PDF 页面布局

## 使用图片上传功能

1. 在编辑器工具栏中找到"上传图片"按钮（相机图标）
2. 点击按钮打开文件选择对话框
3. 选择您要上传的图片文件
4. 图片将自动上传并插入到当前光标位置

上传的图片将保存在`public/uploads`目录中，并可在Markdown预览和导出的PDF中正常显示。

## 许可证

[MIT License](LICENSE)