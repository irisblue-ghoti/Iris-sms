const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 计算
function crc32(data) {
  let crc = 0xffffffff;
  const table = [];

  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }

  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff];
  }

  return (crc ^ 0xffffffff) >>> 0;
}

// 创建 PNG chunk
function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type);
  const crc = crc32(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// 创建带透明背景的圆形图标
function createPNG(size) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk - RGBA 格式
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);  // width
  ihdrData.writeUInt32BE(size, 4);  // height
  ihdrData[8] = 8;   // bit depth
  ihdrData[9] = 6;   // color type: RGBA
  ihdrData[10] = 0;  // compression
  ihdrData[11] = 0;  // filter
  ihdrData[12] = 0;  // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // 创建图像数据
  const rawData = [];
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 0.5;

  for (let y = 0; y < size; y++) {
    rawData.push(0); // filter byte for each row

    for (let x = 0; x < size; x++) {
      const dist = Math.sqrt((x - cx + 0.5) ** 2 + (y - cy + 0.5) ** 2);

      if (dist <= radius) {
        // 在圆内 - 绘制蓝色渐变
        const t = dist / radius;

        // 蓝色渐变 (从 #3b82f6 到 #1d4ed8)
        const r1 = 59, g1 = 130, b1 = 246;
        const r2 = 29, g2 = 78, b2 = 216;

        let r = Math.round(r1 + (r2 - r1) * t);
        let g = Math.round(g1 + (g2 - g1) * t);
        let b = Math.round(b1 + (b2 - b1) * t);

        // 边缘抗锯齿
        let alpha = 255;
        if (dist > radius - 1) {
          alpha = Math.round(255 * Math.max(0, radius - dist + 1));
        }

        // 绘制白色图标
        const iconPadding = size * 0.25;
        const iconX = x - iconPadding;
        const iconY = y - iconPadding;
        const iconW = size - iconPadding * 2;
        const iconH = iconW * 0.7;
        const iconTop = (size - iconPadding * 2 - iconH) / 2;

        const lineW = Math.max(1.5, size * 0.08);

        // 消息框检测
        let isWhite = false;

        // 框的边界
        if (iconX >= 0 && iconX <= iconW && iconY >= iconTop && iconY <= iconTop + iconH) {
          // 上边
          if (iconY <= iconTop + lineW) isWhite = true;
          // 下边
          if (iconY >= iconTop + iconH - lineW) isWhite = true;
          // 左边
          if (iconX <= lineW) isWhite = true;
          // 右边
          if (iconX >= iconW - lineW) isWhite = true;
        }

        // 中间横线
        const midY = iconTop + iconH * 0.5;
        if (iconX >= iconW * 0.15 && iconX <= iconW * 0.85 &&
            iconY >= midY - lineW/2 && iconY <= midY + lineW/2) {
          isWhite = true;
        }

        if (isWhite && alpha > 0) {
          r = 255;
          g = 255;
          b = 255;
        }

        rawData.push(r, g, b, alpha);
      } else {
        // 透明
        rawData.push(0, 0, 0, 0);
      }
    }
  }

  // 压缩图像数据
  const compressed = zlib.deflateSync(Buffer.from(rawData), { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// 创建所有尺寸的图标
const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

sizes.forEach(size => {
  const png = createPNG(size);
  const filePath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`Created icon${size}.png (${png.length} bytes)`);
});

console.log('\n图标创建完成！');
