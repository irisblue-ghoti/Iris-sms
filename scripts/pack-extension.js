const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const extensionDir = path.join(__dirname, '../browser-extension');
const outputDir = path.join(__dirname, '../public/extension');
const outputFile = path.join(outputDir, 'sms-helper-extension.zip');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 删除旧的 ZIP 文件
if (fs.existsSync(outputFile)) {
  fs.unlinkSync(outputFile);
}

// 创建 ZIP 文件
console.log('正在打包浏览器扩展...');
execSync(
  `cd "${extensionDir}" && zip -r "${outputFile}" manifest.json icons/ src/ -x "*.DS_Store"`,
  { stdio: 'inherit' }
);

// 输出文件信息
const stats = fs.statSync(outputFile);
console.log(`\n打包完成！`);
console.log(`文件: ${outputFile}`);
console.log(`大小: ${(stats.size / 1024).toFixed(2)} KB`);
