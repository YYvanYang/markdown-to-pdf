import type { BytemdPlugin, BytemdEditorContext } from 'bytemd';
import { uploadImage } from '@/app/actions/upload';

// 图片上传插件
export function uploadImagePlugin(): BytemdPlugin {
  return {
    name: 'upload-image',
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

                // 显示上传指示器（可选）
                ctx.appendBlock(`![上传中...](loading)`);

                // 调用服务器动作上传图片
                const result = await uploadImage(formData);

                if (result.success && result.url) {
                  // 替换加载占位符为上传的图片URL
                  const lastPos = ctx.codemirror.lastLine();
                  const lastText = ctx.codemirror.getLine(lastPos);
                  
                  if (lastText.includes('![上传中...](loading)')) {
                    ctx.codemirror.replaceRange(
                      `![${file.name}](${result.url})`,
                      { line: lastPos, ch: 0 },
                      { line: lastPos, ch: lastText.length }
                    );
                  } else {
                    // 直接在光标位置插入图片
                    ctx.appendBlock(`![${file.name}](${result.url})`);
                  }
                } else {
                  // 显示错误信息
                  alert(result.error || '上传图片失败');
                }
              } catch (error) {
                console.error('上传过程出错:', error);
                alert('上传图片失败');
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