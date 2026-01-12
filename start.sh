#!/bin/bash

# 接码平台启动脚本

cd "$(dirname "$0")"

echo "正在启动接码平台..."

# 检查是否已有进程在运行
if lsof -i :3000 > /dev/null 2>&1; then
    echo "警告: 端口 3000 已被占用"
    echo "请先运行 ./stop.sh 停止现有服务"
    exit 1
fi

# 清理缓存（避免 webpack cache 警告）
if [ -d ".next/cache" ]; then
    echo "清理构建缓存..."
    rm -rf .next/cache
fi

# 启动开发服务器
pnpm dev &

echo "服务启动中，请稍候..."
echo "访问地址: http://localhost:3000"
