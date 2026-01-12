"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  Chrome,
  CheckCircle2,
  Copy,
  Puzzle,
  Settings,
  FolderOpen,
  RefreshCw,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ExtensionPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = () => {
    setDownloading(true);

    // Create download link
    const link = document.createElement("a");
    link.href = "/extension/sms-helper-extension.zip";
    link.download = "sms-helper-extension.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "下载已开始",
      description: "请按照下方步骤安装扩展",
    });

    setCurrentStep(1);
    setDownloading(false);
  };

  const copyPath = () => {
    navigator.clipboard.writeText("chrome://extensions/");
    toast({
      title: "已复制",
      description: "请在浏览器地址栏粘贴并访问",
    });
  };

  const steps = [
    {
      title: "下载扩展",
      description: "点击下载按钮获取扩展安装包",
      icon: Download,
      action: (
        <Button onClick={handleDownload} className="w-full" disabled={downloading}>
          {downloading ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          下载扩展安装包
        </Button>
      ),
    },
    {
      title: "解压文件",
      description: "将下载的 ZIP 文件解压到任意文件夹",
      icon: FolderOpen,
      tips: "建议解压到一个固定位置，不要删除",
    },
    {
      title: "打开扩展管理",
      description: "在浏览器地址栏输入扩展管理页面地址",
      icon: Settings,
      action: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg font-mono text-sm">
            <span className="flex-1 text-gray-900 dark:text-white">chrome://extensions/</span>
            <Button variant="ghost" size="icon" onClick={copyPath}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Edge 浏览器请使用: edge://extensions/
          </p>
        </div>
      ),
    },
    {
      title: "开启开发者模式",
      description: "在扩展管理页面右上角找到「开发者模式」开关并开启",
      icon: Settings,
    },
    {
      title: "加载扩展",
      description: "点击「加载已解压的扩展程序」按钮，选择解压后的文件夹",
      icon: Puzzle,
      tips: "选择包含 manifest.json 的文件夹",
    },
    {
      title: "完成安装",
      description: "扩展安装成功后会显示在扩展列表中，登录后即可使用",
      icon: CheckCircle2,
      action: (
        <Link href="/login">
          <Button variant="outline" className="w-full">
            登录使用
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/20 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              IrisSMS
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                登录
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25">
                免费注册
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回首页
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">安装浏览器扩展</h1>
          <p className="text-gray-500 dark:text-gray-400">
            安装扩展后，可在任何网页快速使用接码服务
          </p>
        </div>

        {/* Download card */}
        <Card className="mb-8 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Chrome className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">接码助手浏览器扩展</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  支持 Chrome、Edge、Brave 等 Chromium 内核浏览器
                </p>
                <Button onClick={handleDownload} size="lg" disabled={downloading}>
                  {downloading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  立即下载 (ZIP)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Installation steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>安装步骤</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${currentStep > index ? "opacity-50" : ""}`}
                >
                  {/* Step indicator */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep > index
                          ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                          : currentStep === index
                          ? "bg-primary text-primary-foreground"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {currentStep > index ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-full min-h-[40px] bg-gray-200 dark:bg-gray-700 mt-2" />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <step.icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <h3 className="font-medium text-gray-900 dark:text-white">{step.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {step.description}
                    </p>
                    {step.tips && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 p-2 rounded mb-3">
                        {step.tips}
                      </p>
                    )}
                    {step.action}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>扩展功能</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <Puzzle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">悬浮按钮</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    在任何网页右侧显示悬浮按钮，一键打开接码面板
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <Chrome className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">侧边栏面板</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    侧边栏打开，不影响当前网页浏览，边看边用
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                  <Copy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">一键复制</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    手机号和验证码一键复制，快速填入表单
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                  <RefreshCw className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">实时刷新</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    自动刷新验证码状态，收到立即提醒
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>常见问题</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-1 text-gray-900 dark:text-white">为什么需要开启开发者模式？</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                由于扩展未上架 Chrome 应用商店，需要通过开发者模式加载本地扩展。这是 Chrome 的安全机制。
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1 text-gray-900 dark:text-white">安装后扩展图标不显示？</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                点击浏览器工具栏的拼图图标，找到「接码助手」并点击固定按钮。
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1 text-gray-900 dark:text-white">更新扩展后需要重新安装吗？</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                下载新版本后，在扩展管理页面点击「刷新」按钮即可，无需重新加载。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; 2026 IrisSMS. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
