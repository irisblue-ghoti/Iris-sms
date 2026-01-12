"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "zh";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    "header.login": "Login",
    "header.register": "Free Register",

    // Hero
    "hero.badge": "International SMS Verification Platform",
    "hero.title1": "International SMS",
    "hero.title2": "Verification Service",
    "hero.desc1": "Support phone numbers from",
    "hero.desc2": "100+ countries worldwide",
    "hero.desc3": "For overseas platforms only. Domestic Chinese platforms are not supported.",
    "hero.cta1": "Get Started",
    "hero.cta2": "Download Browser Extension",

    // Stats
    "stats.countries": "Countries",
    "stats.users": "Registered Users",
    "stats.codes": "Codes Received",
    "stats.uptime": "Uptime",

    // Features
    "features.title": "Why Choose Us",
    "features.desc": "We provide the most stable and fastest SMS verification service to meet all your needs",
    "features.global.title": "Global Coverage",
    "features.global.desc": "Support phone numbers from Russia, USA, UK, India, and 100+ countries and regions",
    "features.platform.title": "Multi-platform Support",
    "features.platform.desc": "Full coverage of Telegram, WhatsApp, Instagram, Facebook and other mainstream social platforms",
    "features.fast.title": "Instant Delivery",
    "features.fast.desc": "Real-time verification code push, average receive time less than 30 seconds, auto-refresh supported",
    "features.secure.title": "Safe & Reliable",
    "features.secure.desc": "Exclusive number usage, strict privacy protection, supports Alipay, WeChat, USDT payments",

    // How it works
    "how.title": "Three Simple Steps",
    "how.desc": "Quick start, easy to use",
    "how.step1.title": "Create Account",
    "how.step1.desc": "Register with email, instant activation, get bonus credit",
    "how.step2.title": "Select Service",
    "how.step2.desc": "Choose country and app, get phone number with one click",
    "how.step3.title": "Receive Code",
    "how.step3.desc": "Auto receive verification code, one-click copy supported",

    // Pricing
    "pricing.title": "Transparent Pricing",
    "pricing.desc": "Pay per use, pay only for what you use, no hidden fees",
    "pricing.popular": "Most Popular",
    "pricing.basic.title": "Basic Service",
    "pricing.basic.price": "¥1.5",
    "pricing.basic.f1": "Common country phone numbers",
    "pricing.basic.f2": "Support mainstream apps",
    "pricing.basic.f3": "15 minutes validity",
    "pricing.basic.f4": "Instant code push",
    "pricing.hot.title": "Popular Service",
    "pricing.hot.price": "¥3.5",
    "pricing.hot.f1": "More country options",
    "pricing.hot.f2": "High success rate guarantee",
    "pricing.hot.f3": "20 minutes validity",
    "pricing.hot.f4": "Priority customer support",
    "pricing.premium.title": "Premium Service",
    "pricing.premium.price": "¥8",
    "pricing.premium.f1": "Rare country numbers",
    "pricing.premium.f2": "Priority resource allocation",
    "pricing.premium.f3": "30 minutes validity",
    "pricing.premium.f4": "Dedicated tech support",
    "pricing.cta": "Start Now",
    "pricing.from": "起",

    // CTA
    "cta.title": "Ready to Get Started?",
    "cta.desc1": "Register now and experience global SMS verification service",
    "cta.desc2": "New users get bonus credit upon registration",
    "cta.register": "Free Register",
    "cta.login": "Already have an account? Login",

    // Footer
    "footer.extension": "Browser Extension",
    "footer.terms": "Terms of Service",
    "footer.privacy": "Privacy Policy",

    // Auth - Register
    "auth.register": "Register",
    "auth.register.desc": "Create your account to get started",
    "auth.register.success": "Registration Successful",
    "auth.register.success.desc": "Please login to your account",
    "auth.register.failed": "Registration Failed",
    "auth.register.password.mismatch": "Passwords do not match",
    "auth.register.password.short": "Password must be at least 6 characters",
    "auth.register.hasAccount": "Already have an account?",
    "auth.register.signin": "Sign in",
    "auth.register.code": "Verification Code",
    "auth.register.code.placeholder": "Enter 6-digit code",
    "auth.register.sendCode": "Send Code",
    "auth.register.codeSent": "Code sent",
    "auth.register.codeSent.desc": "Please check your email",
    "auth.register.codeInvalid": "Invalid or expired verification code",
    "auth.register.resend": "Resend",
    "auth.register.resendIn": "Resend in",

    // Auth - Login
    "auth.login": "Login",
    "auth.login.desc": "Welcome back",
    "auth.login.success": "Login Successful",
    "auth.login.success.desc": "Redirecting to dashboard...",
    "auth.login.failed": "Login Failed",
    "auth.login.noAccount": "Don't have an account?",
    "auth.login.register": "Register now",
    "auth.login.forgot": "Forgot password?",

    // Auth - Common
    "auth.email": "Email",
    "auth.email.placeholder": "your@email.com",
    "auth.password": "Password",
    "auth.password.placeholder": "At least 6 characters",
    "auth.confirmPassword": "Confirm Password",
    "auth.confirmPassword.placeholder": "Enter password again",

    // Auth - Forgot Password
    "auth.forgot.title": "Forgot Password",
    "auth.forgot.desc": "Enter your email to reset password",
    "auth.forgot.submit": "Send Reset Link",
    "auth.forgot.success": "Email Sent",
    "auth.forgot.success.desc": "Please check your email",
    "auth.forgot.sent.to": "Reset link sent to",
    "auth.forgot.check.email": "Please check your email and click the link to reset your password. Link expires in 1 hour.",
    "auth.forgot.not.received": "Didn't receive the email? Check spam folder, or",
    "auth.forgot.resend": "Resend",
    "auth.forgot.back": "Back to login",

    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.getNumber": "Get Number",
    "nav.orders": "Orders",
    "nav.recharge": "Recharge",
    "nav.extension": "Extension",

    // Dashboard
    "dashboard.welcome": "Welcome Back",
    "dashboard.balance": "Balance",
    "dashboard.totalOrders": "Total Orders",
    "dashboard.active": "Active",
    "dashboard.completed": "Completed",
    "dashboard.recharge": "Recharge",
    "dashboard.allTimeOrders": "All time orders",
    "dashboard.waitingForCode": "Waiting for code",
    "dashboard.codeReceived": "Code received",
    "dashboard.quickActions": "Quick Actions",
    "dashboard.getNumber": "Get Number",
    "dashboard.viewOrders": "View Orders",
    "dashboard.startNow": "Start Now",
    "dashboard.recentActivity": "Recent Activity",
    "dashboard.viewAll": "View All",
    "dashboard.noRecentActivity": "No recent activity",
    "dashboard.loading": "Loading...",

    // Status
    "status.completed": "Completed",
    "status.paid": "Paid",
    "status.active": "Active",
    "status.pending": "Pending",
    "status.cancelled": "Cancelled",
    "status.code": "Code",

    // Common
    "common.logout": "Logout",
    "common.balance": "Balance",
    "common.search": "Search...",
    "common.noResults": "No results found",
    "common.hour": "h ",
    "common.minute": "m ",
    "common.second": "s",

    // Recharge Page
    "recharge.title": "Recharge",
    "recharge.subtitle": "Top up your account with card code",
    "recharge.currentBalance": "Current Balance",
    "recharge.howToGet": "How to get card code?",
    "recharge.contactSupport": "Please contact support to purchase card code. Minimum amount",
    "recharge.contactBtn": "Contact Support",
    "recharge.cardRecharge": "Card Code Recharge",
    "recharge.enterFormat": "Enter your card code in format XXXX-XXXX-XXXX-XXXX",
    "recharge.enterCode": "Enter card code",
    "recharge.rechargeNow": "Recharge Now",
    "recharge.instructions": "Instructions",
    "recharge.inst1": "1. Contact support to get card code",
    "recharge.inst2": "2. Minimum recharge amount is ¥10",
    "recharge.inst3": "3. Each card can only be used once",
    "recharge.inst4": "4. Balance never expires",
    "recharge.success": "Recharge Successful",
    "recharge.amount": "Amount",
    "recharge.failed": "Recharge Failed",
    "recharge.emptyCode": "Card code cannot be empty",
    "recharge.checkCode": "Please check your card code",

    // Orders Page
    "orders.title": "Orders",
    "orders.subtitle": "View SMS and recharge orders",
    "orders.refresh": "Refresh",
    "orders.smsOrders": "SMS Orders",
    "orders.rechargeOrders": "Recharge Orders",
    "orders.total": "total",
    "orders.noSmsOrders": "No SMS orders",
    "orders.noRechargeOrders": "No recharge orders",
    "orders.pending": "Pending",
    "orders.orderNo": "Order No",
    "orders.previous": "Previous",
    "orders.next": "Next",
    "orders.copied": "Copied",
    "orders.sms": "SMS",
    "orders.code": "Code",
    "orders.alipay": "Alipay",
    "orders.wxpay": "WeChat Pay",
    "orders.usdt": "USDT",
    "orders.cardCode": "Card Code",
    "orders.country": "Country",
    "orders.areaCode": "Area Code",
    "orders.confirmDelete": "Are you sure you want to delete this order?",
    "orders.deleted": "Deleted",
    "orders.deletedDesc": "Order deleted successfully",
    "orders.deleteFailed": "Failed to delete order",

    // Services Page
    "services.title": "SMS Service",
    "services.subtitle": "Select country and service to get a phone number",
    "services.getNumber": "Get Number",
    "services.selectCountry": "Select Country",
    "services.selectService": "Select Service",
    "services.price": "Price",
    "services.activeOrders": "Active Orders",
    "services.autoRefreshing": "Auto-refreshing",
    "services.noActiveOrders": "No active orders",
    "services.received": "Received",
    "services.waiting": "Waiting",
    "services.verificationCode": "Verification Code",
    "services.checkCode": "Check Code",
    "services.cancel": "Cancel",
    "services.expired": "Expired",
    "services.success": "Success",
    "services.number": "Number",
    "services.failed": "Failed",
    "services.tryAgain": "Please try again",
    "services.selectionRequired": "Selection Required",
    "services.selectBoth": "Please select a country and service",
    "services.codeReceived": "Code Received",
    "services.noCodeYet": "No code received yet",
    "services.cancelled": "Cancelled",
    "services.refunded": "Order cancelled, balance refunded",
    "services.service": "Service",
    "services.country": "Country",
    "services.selectServiceFirst": "Select a service first",
  },
  zh: {
    // Header
    "header.login": "登录",
    "header.register": "免费注册",

    // Hero
    "hero.badge": "国际短信验证平台",
    "hero.title1": "国际短信",
    "hero.title2": "验证码服务",
    "hero.desc1": "支持全球",
    "hero.desc2": "100+ 国家手机号",
    "hero.desc3": "仅支持海外平台，不支持国内平台",
    "hero.cta1": "立即开始使用",
    "hero.cta2": "下载浏览器扩展",

    // Stats
    "stats.countries": "覆盖国家",
    "stats.users": "注册用户",
    "stats.codes": "成功接码",
    "stats.uptime": "服务可用率",

    // Features
    "features.title": "为什么选择我们",
    "features.desc": "我们提供最稳定、最快速的短信接码服务，满足您的各种需求",
    "features.global.title": "全球覆盖",
    "features.global.desc": "支持俄罗斯、美国、英国、印度等 100+ 国家和地区的手机号码",
    "features.platform.title": "多平台支持",
    "features.platform.desc": "Telegram、WhatsApp、Instagram、Facebook 等主流社交平台全覆盖",
    "features.fast.title": "极速接收",
    "features.fast.desc": "验证码实时推送，平均接收时间小于 30 秒，支持自动刷新",
    "features.secure.title": "安全可靠",
    "features.secure.desc": "号码独享使用，隐私严格保护，支持支付宝、微信、USDT 支付",

    // How it works
    "how.title": "简单三步，开始接码",
    "how.desc": "快速上手，轻松使用",
    "how.step1.title": "注册账号",
    "how.step1.desc": "邮箱注册，即刻开通，赠送体验金",
    "how.step2.title": "选择服务",
    "how.step2.desc": "选择国家和应用，一键获取手机号",
    "how.step3.title": "接收验证码",
    "how.step3.desc": "自动接收验证码，支持一键复制",

    // Pricing
    "pricing.title": "透明定价",
    "pricing.desc": "按次收费，用多少付多少，无隐藏费用",
    "pricing.popular": "最受欢迎",
    "pricing.basic.title": "基础服务",
    "pricing.basic.price": "¥1.5",
    "pricing.basic.f1": "常用国家手机号",
    "pricing.basic.f2": "支持主流 APP",
    "pricing.basic.f3": "15 分钟有效期",
    "pricing.basic.f4": "即时验证码推送",
    "pricing.hot.title": "热门服务",
    "pricing.hot.price": "¥3.5",
    "pricing.hot.f1": "更多国家选择",
    "pricing.hot.f2": "高成功率保障",
    "pricing.hot.f3": "20 分钟有效期",
    "pricing.hot.f4": "优先客服支持",
    "pricing.premium.title": "高级服务",
    "pricing.premium.price": "¥8",
    "pricing.premium.f1": "稀缺国家号码",
    "pricing.premium.f2": "优先资源分配",
    "pricing.premium.f3": "30 分钟有效期",
    "pricing.premium.f4": "专属技术支持",
    "pricing.cta": "立即使用",
    "pricing.from": "起",

    // CTA
    "cta.title": "准备好开始了吗？",
    "cta.desc1": "立即注册，即刻体验全球短信接码服务",
    "cta.desc2": "新用户注册即送体验金",
    "cta.register": "免费注册",
    "cta.login": "已有账号？登录",

    // Footer
    "footer.extension": "浏览器扩展",
    "footer.terms": "使用条款",
    "footer.privacy": "隐私政策",

    // Auth - Register
    "auth.register": "注册",
    "auth.register.desc": "创建账户开始使用",
    "auth.register.success": "注册成功",
    "auth.register.success.desc": "请登录您的账户",
    "auth.register.failed": "注册失败",
    "auth.register.password.mismatch": "两次输入的密码不一致",
    "auth.register.password.short": "密码至少需要6个字符",
    "auth.register.hasAccount": "已有账户？",
    "auth.register.signin": "立即登录",
    "auth.register.code": "验证码",
    "auth.register.code.placeholder": "输入6位验证码",
    "auth.register.sendCode": "发送验证码",
    "auth.register.codeSent": "验证码已发送",
    "auth.register.codeSent.desc": "请查收您的邮箱",
    "auth.register.codeInvalid": "验证码无效或已过期",
    "auth.register.resend": "重新发送",
    "auth.register.resendIn": "秒后重发",

    // Auth - Login
    "auth.login": "登录",
    "auth.login.desc": "欢迎回来",
    "auth.login.success": "登录成功",
    "auth.login.success.desc": "正在跳转到控制台...",
    "auth.login.failed": "登录失败",
    "auth.login.noAccount": "还没有账户？",
    "auth.login.register": "立即注册",
    "auth.login.forgot": "忘记密码？",

    // Auth - Common
    "auth.email": "邮箱",
    "auth.email.placeholder": "your@email.com",
    "auth.password": "密码",
    "auth.password.placeholder": "至少6个字符",
    "auth.confirmPassword": "确认密码",
    "auth.confirmPassword.placeholder": "再次输入密码",

    // Auth - Forgot Password
    "auth.forgot.title": "忘记密码",
    "auth.forgot.desc": "输入邮箱重置密码",
    "auth.forgot.submit": "发送重置链接",
    "auth.forgot.success": "邮件已发送",
    "auth.forgot.success.desc": "请查收您的邮箱",
    "auth.forgot.sent.to": "重置链接已发送到",
    "auth.forgot.check.email": "请查收您的邮箱并点击链接重置密码。链接有效期为1小时。",
    "auth.forgot.not.received": "没有收到邮件？请检查垃圾邮件文件夹，或",
    "auth.forgot.resend": "重新发送",
    "auth.forgot.back": "返回登录",

    // Navigation
    "nav.dashboard": "控制台",
    "nav.getNumber": "获取号码",
    "nav.orders": "订单",
    "nav.recharge": "充值",
    "nav.extension": "浏览器扩展",

    // Dashboard
    "dashboard.welcome": "欢迎回来",
    "dashboard.balance": "余额",
    "dashboard.totalOrders": "总订单",
    "dashboard.active": "进行中",
    "dashboard.completed": "已完成",
    "dashboard.recharge": "充值",
    "dashboard.allTimeOrders": "累计订单",
    "dashboard.waitingForCode": "等待验证码",
    "dashboard.codeReceived": "已收到验证码",
    "dashboard.quickActions": "快捷操作",
    "dashboard.getNumber": "获取号码",
    "dashboard.viewOrders": "查看订单",
    "dashboard.startNow": "立即开始",
    "dashboard.recentActivity": "最近活动",
    "dashboard.viewAll": "查看全部",
    "dashboard.noRecentActivity": "暂无活动记录",
    "dashboard.loading": "加载中...",

    // Status
    "status.completed": "已完成",
    "status.paid": "已支付",
    "status.active": "进行中",
    "status.pending": "等待中",
    "status.cancelled": "已取消",
    "status.code": "验证码",

    // Common
    "common.logout": "退出登录",
    "common.balance": "余额",
    "common.search": "搜索...",
    "common.noResults": "无搜索结果",
    "common.hour": "小时",
    "common.minute": "分",
    "common.second": "秒",

    // Recharge Page
    "recharge.title": "充值",
    "recharge.subtitle": "使用卡密为账户充值",
    "recharge.currentBalance": "当前余额",
    "recharge.howToGet": "如何获取卡密？",
    "recharge.contactSupport": "请联系客服购买卡密，最低充值金额",
    "recharge.contactBtn": "联系客服",
    "recharge.cardRecharge": "卡密充值",
    "recharge.enterFormat": "请输入卡密，格式：XXXX-XXXX-XXXX-XXXX",
    "recharge.enterCode": "输入卡密",
    "recharge.rechargeNow": "立即充值",
    "recharge.instructions": "使用说明",
    "recharge.inst1": "1. 联系客服获取卡密",
    "recharge.inst2": "2. 最低充值金额 ¥10",
    "recharge.inst3": "3. 每张卡密只能使用一次",
    "recharge.inst4": "4. 余额永不过期",
    "recharge.success": "充值成功",
    "recharge.amount": "金额",
    "recharge.failed": "充值失败",
    "recharge.emptyCode": "请输入卡密",
    "recharge.checkCode": "请检查卡密是否正确",

    // Orders Page
    "orders.title": "订单",
    "orders.subtitle": "查看短信和充值订单",
    "orders.refresh": "刷新",
    "orders.smsOrders": "短信订单",
    "orders.rechargeOrders": "充值订单",
    "orders.total": "共",
    "orders.noSmsOrders": "暂无短信订单",
    "orders.noRechargeOrders": "暂无充值订单",
    "orders.pending": "等待中",
    "orders.orderNo": "订单号",
    "orders.previous": "上一页",
    "orders.next": "下一页",
    "orders.copied": "已复制",
    "orders.sms": "短信",
    "orders.code": "验证码",
    "orders.alipay": "支付宝",
    "orders.wxpay": "微信支付",
    "orders.usdt": "USDT",
    "orders.cardCode": "卡密充值",
    "orders.country": "国家",
    "orders.areaCode": "区号",
    "orders.confirmDelete": "确定要删除这个订单吗？",
    "orders.deleted": "已删除",
    "orders.deletedDesc": "订单已成功删除",
    "orders.deleteFailed": "删除订单失败",

    // Services Page
    "services.title": "短信服务",
    "services.subtitle": "选择国家和服务以获取手机号",
    "services.getNumber": "获取号码",
    "services.selectCountry": "选择国家",
    "services.selectService": "选择服务",
    "services.price": "价格",
    "services.activeOrders": "进行中的订单",
    "services.autoRefreshing": "自动刷新中",
    "services.noActiveOrders": "暂无进行中的订单",
    "services.received": "已收到",
    "services.waiting": "等待中",
    "services.verificationCode": "验证码",
    "services.checkCode": "查看验证码",
    "services.cancel": "取消",
    "services.expired": "已过期",
    "services.success": "成功",
    "services.number": "号码",
    "services.failed": "失败",
    "services.tryAgain": "请重试",
    "services.selectionRequired": "请选择",
    "services.selectBoth": "请选择国家和服务",
    "services.codeReceived": "收到验证码",
    "services.noCodeYet": "暂未收到验证码",
    "services.cancelled": "已取消",
    "services.refunded": "订单已取消，余额已退回",
    "services.service": "服务",
    "services.country": "国家",
    "services.selectServiceFirst": "请先选择服务",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load saved language preference on mount
    const saved = localStorage.getItem("language") as Language;
    if (saved && (saved === "en" || saved === "zh")) {
      setLanguageState(saved);
      // Sync cookie with localStorage value
      document.cookie = `language=${saved};path=/;max-age=31536000;SameSite=Lax`;
    }
    setIsLoaded(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    // Also set a cookie for browser extension sync
    document.cookie = `language=${lang};path=/;max-age=31536000;SameSite=Lax`;
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Language switcher component
export function LanguageSwitcher({ className = "", collapsed = false }: { className?: string; collapsed?: boolean }) {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "zh" : "en")}
      className={`flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors ${collapsed ? "w-10 h-10 p-0" : "px-3 py-1.5"} ${className}`}
      title={collapsed ? (language === "en" ? "Switch to Chinese" : "切换到英文") : undefined}
    >
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      {!collapsed && (language === "en" ? "EN" : "中文")}
    </button>
  );
}
