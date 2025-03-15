'use server';

import path from 'path';
import fs from 'fs/promises';

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return { error: '没有上传文件' };
    }

    // 验证文件类型
    const fileType = file.type;
    if (!fileType.startsWith('image/')) {
      return { error: '只允许上传图片文件' };
    }

    // 创建唯一的文件名
    const buffer = await file.arrayBuffer();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.name.split('.').pop();
    const filename = `image-${uniqueSuffix}.${ext}`;
    
    // 保存文件到公共目录，使其可通过网络访问
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // 确保上传目录存在
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, filename);
    
    await fs.writeFile(filePath, Buffer.from(buffer));

    // 返回图片URL（相对于公共目录）
    return { 
      success: true, 
      url: `/uploads/${filename}`
    };
  } catch (error) {
    console.error('图片上传错误:', error);
    return { error: '上传图片时出错' };
  }
} 