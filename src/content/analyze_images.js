const fs = require('fs');
const path = require('path');

// 图片文件目录
const imagesDir = 'D:\UserData\Documents\fuwari\src\content\assets\images';
const postsDir = 'D:\UserData\Documents\fuwari\src\content\posts';

// 存储图片组和最大尺寸图片
const imageGroups = {};

// 获取所有图片文件
function getAllImageFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (/\.(png|jpe?g|gif|webp|svg)$/i.test(item)) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// 从文件名提取基础名称（去除尺寸信息）
function getBaseImageName(filename) {
  // 移除尺寸信息，例如 "wp4729537-1024x576.jpg" -> "wp4729537"
  // 移除 "cropped-", "-scaled", "-150x150" 等前缀和后缀
  let baseName = filename;
  
  // 移除文件扩展名
  baseName = baseName.replace(/\.[^.]+$/, '');
  
  // 移除尺寸信息
  baseName = baseName.replace(/-\d+x\d+$/, '');
  baseName = baseName.replace(/^cropped-/, '');
  baseName = baseName.replace(/-scaled$/, '');
  baseName = baseName.replace(/-\d+$/, '');
  
  return baseName;
}

// 获取图片尺寸
function getImageSize(filePath) {
  try {
    // 从文件名中提取尺寸信息
    const filename = path.basename(filePath);
    const sizeMatch = filename.match(/-(\d+)x(\d+)/);
    
    if (sizeMatch) {
      return {
        width: parseInt(sizeMatch[1]),
        height: parseInt(sizeMatch[2])
      };
    }
    
    // 如果文件名中没有尺寸信息，检查是否有 "-scaled" 或无尺寸标记
    if (filename.includes('-scaled') || !filename.match(/-\d+x\d+/)) {
      // 对于 scaled 或无尺寸标记的图片，假设是最大尺寸
      return { width: 999999, height: 999999 };
    }
    
    return { width: 0, height: 0 };
  } catch (error) {
    console.error('获取图片尺寸失败:', filePath, error);
    return { width: 0, height: 0 };
  }
}

// 主函数
function main() {
  const imageFiles = getAllImageFiles(imagesDir);
  
  // 分组图片
  for (const filePath of imageFiles) {
    const filename = path.basename(filePath);
    const baseName = getBaseImageName(filename);
    const size = getImageSize(filePath);
    
    if (!imageGroups[baseName]) {
      imageGroups[baseName] = {
        maxSize: { width: 0, height: 0 },
        maxFile: null,
        allFiles: []
      };
    }
    
    imageGroups[baseName].allFiles.push({
      path: filePath,
      filename: filename,
      size: size
    });
    
    // 比较尺寸，找出最大的
    const currentMax = imageGroups[baseName].maxSize;
    if (size.width > currentMax.width || size.height > currentMax.height) {
      imageGroups[baseName].maxSize = size;
      imageGroups[baseName].maxFile = {
        path: filePath,
        filename: filename,
        size: size
      };
    }
  }
  
  // 输出结果
  console.log('=== 图片分组结果 ===');
  for (const [baseName, group] of Object.entries(imageGroups)) {
    console.log(`\n基础名称: ${baseName}`);
    console.log(`最大尺寸: ${group.maxSize.width}x${group.maxSize.height}`);
    console.log(`最大文件: ${group.maxFile.filename}`);
    console.log('所有文件:');
    group.allFiles.forEach(file => {
      console.log(`  - ${file.filename} (${file.size.width}x${file.size.height})`);
    });
  }
  
  // 生成复制脚本
  console.log('\n=== 复制最大尺寸图片到主目录的脚本 ===');
  const targetDir = 'D:\UserData\Documents\fuwari\src\content\assets\images';
  
  for (const [baseName, group] of Object.entries(imageGroups)) {
    if (group.maxFile) {
      const sourcePath = group.maxFile.path;
      const targetPath = path.join(targetDir, group.maxFile.filename);
      console.log(`copy "${sourcePath}" "${targetPath}"`);
    }
  }
}

main();