#!/bin/bash

# 接码平台停止脚本

echo "正在停止接码平台..."

# 查找并杀掉占用3000端口的进程
PID=$(lsof -t -i :3000)

if [ -z "$PID" ]; then
    echo "没有发现运行在端口 3000 的服务"
else
    echo "发现进程 PID: $PID"
    kill -9 $PID 2>/dev/null
    echo "服务已停止"
fi
