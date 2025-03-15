import type { BytemdPlugin, BytemdEditorContext } from 'bytemd';
import { uploadImage } from '@/app/actions/upload';

// 图片上传插件
export function uploadImagePlugin(): BytemdPlugin {
  return {
    actions: [
      {
        title: '上传图片',
        icon: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path></svg>',
        handler: {
          type: 'action',
          click: (ctx: BytemdEditorContext) => {
            // 创建文件输入元素
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';
            document.body.appendChild(input);

            // 监听文件选择
            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;

              try {
                // 创建FormData对象
                const formData = new FormData();
                formData.append('file', file);

                // 显示上传指示器
                const loadingText = `![上传中...](loading)`;
                const loadingPos = ctx.appendBlock(loadingText);
                
                // 调用服务器动作上传图片
                const result = await uploadImage(formData);

                if (result.success && result.url) {
                  // 获取当前内容
                  const value = ctx.editor.getValue();
                  
                  // 查找并删除"上传中..."文本所在行
                  const lines = value.split('\n');
                  const loadingLine = loadingPos.line;
                  
                  if (loadingLine >= 0 && loadingLine < lines.length) {
                    // 删除包含"上传中..."的行
                    lines.splice(loadingLine, 1);
                    
                    // 更新编辑器内容
                    ctx.editor.setValue(lines.join('\n'));
                    
                    // 添加实际图片
                    ctx.appendBlock(`![${file.name}](${result.url})`);
                  } else {
                    // 如果找不到加载行，直接添加图片
                    ctx.appendBlock(`![${file.name}](${result.url})`);
                  }
                } else {
                  // 获取当前内容
                  const value = ctx.editor.getValue();
                  
                  // 查找并删除"上传中..."文本所在行
                  const lines = value.split('\n');
                  const loadingLine = loadingPos.line;
                  
                  if (loadingLine >= 0 && loadingLine < lines.length) {
                    // 删除包含"上传中..."的行
                    lines.splice(loadingLine, 1);
                    
                    // 更新编辑器内容
                    ctx.editor.setValue(lines.join('\n'));
                  }
                  
                  // 显示错误信息
                  alert(result.error || '上传图片失败');
                }
              } catch (error) {
                console.error('上传过程出错:', error);
                alert('上传图片失败');
                
                // 获取当前内容
                const value = ctx.editor.getValue();
                
                // 查找并删除"上传中..."文本所在行
                const lines = value.split('\n');
                
                // 查找包含"上传中..."的行
                const loadingLineIndex = lines.findIndex(line => line.includes('![上传中...](loading)'));
                
                if (loadingLineIndex !== -1) {
                  // 删除包含"上传中..."的行
                  lines.splice(loadingLineIndex, 1);
                  
                  // 更新编辑器内容
                  ctx.editor.setValue(lines.join('\n'));
                }
              } finally {
                // 移除文件输入元素
                document.body.removeChild(input);
              }
            };

            // 触发文件选择对话框
            input.click();
          },
        },
      },
    ],
  };
} 