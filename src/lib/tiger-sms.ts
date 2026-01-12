const API_KEY = process.env.TIGER_SMS_API_KEY || "";
const BASE_URL = process.env.TIGER_SMS_BASE_URL || "https://api.tiger-sms.com/stubs/handler_api.php";

interface TigerSmsResponse {
  success: boolean;
  data?: string;
  error?: string;
}

// 完整国家列表 (从cn.txt解析)
export const COUNTRIES: Array<{ id: string; name: string }> = [
  { id: "74", name: "阿富汗" },
  { id: "155", name: "阿尔巴尼亚" },
  { id: "58", name: "阿尔及利亚" },
  { id: "76", name: "安哥拉" },
  { id: "181", name: "安圭拉" },
  { id: "169", name: "安提瓜和巴布达" },
  { id: "39", name: "阿根廷" },
  { id: "148", name: "亚美尼亚" },
  { id: "179", name: "阿鲁巴" },
  { id: "175", name: "澳大利亚" },
  { id: "50", name: "奥地利" },
  { id: "35", name: "阿塞拜疆" },
  { id: "122", name: "巴哈马" },
  { id: "145", name: "巴林" },
  { id: "60", name: "孟加拉" },
  { id: "118", name: "巴巴多斯" },
  { id: "51", name: "白俄罗斯" },
  { id: "82", name: "比利时" },
  { id: "124", name: "伯利兹" },
  { id: "120", name: "贝宁" },
  { id: "195", name: "百慕大" },
  { id: "158", name: "不丹" },
  { id: "92", name: "玻利维亚" },
  { id: "108", name: "波斯尼亚和黑塞哥维那" },
  { id: "123", name: "博茨瓦纳" },
  { id: "73", name: "巴西" },
  { id: "121", name: "文莱达鲁萨兰国" },
  { id: "83", name: "保加利亚" },
  { id: "152", name: "布基纳法索" },
  { id: "119", name: "布隆迪" },
  { id: "24", name: "柬埔寨" },
  { id: "41", name: "喀麦隆" },
  { id: "36", name: "加拿大" },
  { id: "186", name: "佛得角" },
  { id: "170", name: "开曼群岛" },
  { id: "125", name: "中非共和国" },
  { id: "42", name: "乍得" },
  { id: "151", name: "智利" },
  { id: "33", name: "哥伦比亚" },
  { id: "133", name: "科摩罗" },
  { id: "150", name: "刚果" },
  { id: "18", name: "刚果民主共和国" },
  { id: "93", name: "哥斯达黎加" },
  { id: "27", name: "科特迪瓦" },
  { id: "45", name: "克罗地亚" },
  { id: "113", name: "古巴" },
  { id: "77", name: "塞浦路斯" },
  { id: "63", name: "捷克" },
  { id: "172", name: "丹麦" },
  { id: "168", name: "吉布提" },
  { id: "126", name: "多米尼克" },
  { id: "109", name: "多米尼加共和国" },
  { id: "105", name: "厄瓜多尔" },
  { id: "21", name: "埃及" },
  { id: "101", name: "萨尔瓦多" },
  { id: "167", name: "赤道几内亚" },
  { id: "176", name: "厄立特里亚" },
  { id: "34", name: "爱沙尼亚" },
  { id: "71", name: "埃塞俄比亚" },
  { id: "189", name: "斐济" },
  { id: "163", name: "芬兰" },
  { id: "78", name: "法国" },
  { id: "162", name: "法属圭亚那" },
  { id: "154", name: "加蓬" },
  { id: "28", name: "冈比亚" },
  { id: "128", name: "格鲁吉亚" },
  { id: "43", name: "德国" },
  { id: "38", name: "加纳" },
  { id: "201", name: "直布罗陀" },
  { id: "129", name: "希腊" },
  { id: "127", name: "格林纳达" },
  { id: "160", name: "瓜德罗普岛" },
  { id: "94", name: "危地马拉" },
  { id: "68", name: "几内亚" },
  { id: "130", name: "几内亚比绍" },
  { id: "131", name: "圭亚那" },
  { id: "26", name: "海地" },
  { id: "88", name: "洪都拉斯" },
  { id: "14", name: "香港" },
  { id: "84", name: "匈牙利" },
  { id: "132", name: "冰岛" },
  { id: "22", name: "印度" },
  { id: "6", name: "印度尼西亚" },
  { id: "57", name: "伊朗" },
  { id: "47", name: "伊拉克" },
  { id: "23", name: "爱尔兰" },
  { id: "13", name: "以色列" },
  { id: "86", name: "意大利" },
  { id: "103", name: "牙买加" },
  { id: "182", name: "日本" },
  { id: "116", name: "约旦" },
  { id: "2", name: "哈萨克斯坦" },
  { id: "8", name: "肯尼亚" },
  { id: "190", name: "韩国" },
  { id: "203", name: "科索沃" },
  { id: "100", name: "科威特" },
  { id: "11", name: "吉尔吉斯斯坦" },
  { id: "25", name: "老挝" },
  { id: "49", name: "拉脱维亚" },
  { id: "153", name: "黎巴嫩" },
  { id: "136", name: "莱索托" },
  { id: "135", name: "利比里亚" },
  { id: "102", name: "利比亚" },
  { id: "44", name: "立陶宛" },
  { id: "165", name: "卢森堡" },
  { id: "20", name: "澳门" },
  { id: "183", name: "北马其顿" },
  { id: "17", name: "马达加斯加" },
  { id: "137", name: "马拉维" },
  { id: "7", name: "马来西亚" },
  { id: "159", name: "马尔代夫" },
  { id: "69", name: "马里" },
  { id: "199", name: "马耳他" },
  { id: "114", name: "毛里塔尼亚" },
  { id: "157", name: "毛里求斯" },
  { id: "54", name: "墨西哥" },
  { id: "85", name: "摩尔多瓦共和国" },
  { id: "144", name: "摩纳哥" },
  { id: "72", name: "蒙古" },
  { id: "171", name: "黑山" },
  { id: "180", name: "蒙特塞拉特" },
  { id: "37", name: "摩洛哥" },
  { id: "80", name: "莫桑比克" },
  { id: "5", name: "缅甸" },
  { id: "138", name: "纳米比亚" },
  { id: "81", name: "尼泊尔" },
  { id: "48", name: "荷兰" },
  { id: "185", name: "新喀里多尼亚" },
  { id: "67", name: "新西兰" },
  { id: "90", name: "尼加拉瓜" },
  { id: "139", name: "尼日尔" },
  { id: "19", name: "尼日利亚" },
  { id: "174", name: "挪威" },
  { id: "107", name: "阿曼" },
  { id: "66", name: "巴基斯坦" },
  { id: "188", name: "巴勒斯坦" },
  { id: "112", name: "巴拿马" },
  { id: "79", name: "巴布亚新几内亚" },
  { id: "87", name: "巴拉圭" },
  { id: "65", name: "秘鲁" },
  { id: "4", name: "菲律宾" },
  { id: "15", name: "波兰" },
  { id: "117", name: "葡萄牙" },
  { id: "97", name: "波多黎各" },
  { id: "111", name: "卡塔尔" },
  { id: "146", name: "留尼汪岛" },
  { id: "32", name: "罗马尼亚" },
  { id: "140", name: "卢旺达" },
  { id: "134", name: "圣基茨和尼维斯" },
  { id: "164", name: "圣卢西亚" },
  { id: "166", name: "圣文森特和格林纳丁斯" },
  { id: "198", name: "萨摩亚" },
  { id: "178", name: "圣多美和普林西比" },
  { id: "53", name: "沙特阿拉伯" },
  { id: "61", name: "塞内加尔" },
  { id: "29", name: "塞尔维亚" },
  { id: "184", name: "塞舌尔" },
  { id: "115", name: "塞拉利昂" },
  { id: "196", name: "新加坡" },
  { id: "141", name: "斯洛伐克" },
  { id: "59", name: "斯洛文尼亚" },
  { id: "193", name: "所罗门群岛" },
  { id: "149", name: "索马里" },
  { id: "31", name: "南非" },
  { id: "177", name: "南苏丹" },
  { id: "56", name: "西班牙" },
  { id: "64", name: "斯里兰卡" },
  { id: "98", name: "苏丹" },
  { id: "142", name: "苏里南" },
  { id: "106", name: "斯威士兰" },
  { id: "46", name: "瑞典" },
  { id: "173", name: "瑞士" },
  { id: "110", name: "阿拉伯叙利亚共和国" },
  { id: "55", name: "台湾" },
  { id: "143", name: "塔吉克斯坦" },
  { id: "9", name: "坦桑尼亚" },
  { id: "52", name: "泰国" },
  { id: "91", name: "东帝汶" },
  { id: "99", name: "多哥" },
  { id: "197", name: "汤加" },
  { id: "104", name: "特立尼达和多巴哥" },
  { id: "89", name: "突尼斯" },
  { id: "62", name: "土耳其" },
  { id: "161", name: "土库曼斯坦" },
  { id: "75", name: "乌干达" },
  { id: "1", name: "乌克兰" },
  { id: "95", name: "阿拉伯联合酋长国" },
  { id: "16", name: "英国" },
  { id: "187", name: "美国" },
  { id: "1001", name: "美国 VIP" },
  { id: "12", name: "美国虚拟号" },
  { id: "156", name: "乌拉圭" },
  { id: "40", name: "乌兹别克斯坦" },
  { id: "70", name: "委内瑞拉" },
  { id: "10", name: "越南" },
  { id: "30", name: "也门" },
  { id: "147", name: "赞比亚" },
  { id: "96", name: "津巴布韦" },
];

// 完整服务列表 (从pj.txt解析 - 常用服务)
const ALL_SERVICES: Array<{ code: string; name: string }> = [
  { code: "tg", name: "Telegram" },
  { code: "wa", name: "Whatsapp" },
  { code: "wa2", name: "WhatsApp2" },
  { code: "ig", name: "Instagram+Threads" },
  { code: "fb", name: "facebook" },
  { code: "tw", name: "Twitter" },
  { code: "go", name: "Google,youtube,Gmail" },
  { code: "dr", name: "ChatGPT" },
  { code: "ds", name: "Discord" },
  { code: "lf", name: "TikTok/Douyin" },
  { code: "wb", name: "WeChat" },
  { code: "am", name: "Amazon" },
  { code: "nf", name: "Netflix" },
  { code: "mm", name: "Microsoft" },
  { code: "vi", name: "Viber" },
  { code: "me", name: "Line messenger" },
  { code: "kt", name: "KakaoTalk" },
  { code: "tn", name: "LinkedIN" },
  { code: "fu", name: "Snapchat" },
  { code: "ub", name: "Uber" },
  { code: "mb", name: "Yahoo" },
  { code: "ma", name: "Mail.ru" },
  { code: "vk", name: "Вконтакте" },
  { code: "ok", name: "Одноклассники" },
  { code: "ya", name: "Яндекс" },
  { code: "ts", name: "PayPal" },
  { code: "qw", name: "QIWl" },
  { code: "sg", name: "OZON" },
  { code: "uu", name: "Wildberries" },
  { code: "av", name: "avito" },
  { code: "ab", name: "Alibaba" },
  { code: "hx", name: "AliExpress" },
  { code: "dl", name: "Lazada" },
  { code: "ka", name: "Shopee" },
  { code: "xd", name: "Tokopedia" },
  { code: "jg", name: "Grab" },
  { code: "ni", name: "Gojek" },
  { code: "tx", name: "Bolt" },
  { code: "fr", name: "Dana" },
  { code: "xh", name: "OVO" },
  { code: "bc", name: "GCash" },
  { code: "ge", name: "Paytm" },
  { code: "ti", name: "cryptocom" },
  { code: "re", name: "Coinbase" },
  { code: "ij", name: "Revolut" },
  { code: "bo", name: "Wise" },
  { code: "nc", name: "Payoneer" },
  { code: "ag", name: "Agoda" },
  { code: "uk", name: "Airbnb" },
  { code: "ot", name: "Any other" },
  { code: "mt", name: "Steam" },
  { code: "bz", name: "Blizzard" },
  { code: "hb", name: "Twitch" },
  { code: "zs", name: "Bilibili" },
  { code: "bl", name: "BIGO LIVE" },
  { code: "jf", name: "Likee" },
  { code: "vp", name: "Kwai" },
  { code: "ai", name: "CELEBe" },
  { code: "mx", name: "SoulApp" },
  { code: "oi", name: "Tinder" },
  { code: "mo", name: "Bumble" },
  { code: "qv", name: "Badoo" },
  { code: "df", name: "Happn" },
  { code: "rt", name: "hily" },
  { code: "yw", name: "Grindr" },
  { code: "ac", name: "Doordash" },
  { code: "aq", name: "Glovo" },
  { code: "jx", name: "Swiggy" },
  { code: "dy", name: "Zomato" },
  { code: "pd", name: "IFood" },
  { code: "xt", name: "Flipkart" },
  { code: "hp", name: "Meesho" },
  { code: "cq", name: "Mercado" },
  { code: "wr", name: "Walmart" },
  { code: "dh", name: "eBay" },
  { code: "cn", name: "fiverr" },
  { code: "er", name: "Kwork" },
  { code: "aws", name: "AWS" },
  { code: "ex", name: "Linode" },
  { code: "nu", name: "Stripe" },
  { code: "lr", name: "Okta" },
  { code: "eh", name: "Telegram 2.0" },
  { code: "qq", name: "Tencent QQ" },
  { code: "kf", name: "Weibo" },
  { code: "li", name: "Baidu" },
  { code: "za", name: "JDcom" },
  { code: "qd", name: "Taobao" },
  { code: "zp", name: "Pinduoduo" },
  { code: "es", name: "iQIYI" },
  { code: "nv", name: "Naver" },
  { code: "ep", name: "Temu" },
  { code: "wx", name: "Apple" },
  { code: "yu", name: "Xiaomi" },
  { code: "lo", name: "Oppo" },
  { code: "kx", name: "Vivo" },
  { code: "gs", name: "SamsungShop" },
  { code: "hw", name: "Alipay/Alibaba/1688" },
];

// 屏蔽的国内服务列表
const BLOCKED_SERVICES = new Set([
  "wb",  // WeChat 微信
  "qq",  // Tencent QQ 腾讯QQ
  "kf",  // Weibo 微博
  "li",  // Baidu 百度
  "za",  // JDcom 京东
  "qd",  // Taobao 淘宝
  "zp",  // Pinduoduo 拼多多
  "es",  // iQIYI 爱奇艺
  "zs",  // Bilibili 哔哩哔哩
  "hw",  // Alipay/Alibaba/1688 支付宝
  "ab",  // Alibaba 阿里巴巴
  "hx",  // AliExpress 速卖通
  "yu",  // Xiaomi 小米
  "lo",  // Oppo
  "kx",  // Vivo
  "lf",  // TikTok/Douyin 抖音
  "vp",  // Kwai 快手
  "ep",  // Temu
]);

// 过滤后的服务列表
export const SERVICES = ALL_SERVICES.filter(s => !BLOCKED_SERVICES.has(s.code));

// 国家ID到名称的映射
export const COUNTRY_MAP: Record<string, string> = Object.fromEntries(
  COUNTRIES.map(c => [c.id, c.name])
);

// 服务代码到名称的映射
export const SERVICE_MAP: Record<string, string> = Object.fromEntries(
  SERVICES.map(s => [s.code, s.name])
);

async function makeRequest(params: Record<string, string>): Promise<TigerSmsResponse> {
  const url = new URL(BASE_URL);
  url.searchParams.set("api_key", API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  try {
    const response = await fetch(url.toString());
    const text = await response.text();

    // API 返回格式：
    // 成功: ACCESS_NUMBER:ID:PHONE, ACCESS_BALANCE:123.45, STATUS_OK:CODE
    // 等待: STATUS_WAIT_CODE, STATUS_WAIT_RETRY
    // 错误: BAD_KEY, NO_BALANCE, NO_NUMBERS, BAD_ACTION 等

    if (text.startsWith("ACCESS_") || text.startsWith("STATUS_")) {
      return { success: true, data: text };
    }

    // JSON 响应 (国家/服务/价格列表)
    if (text.startsWith("{") || text.startsWith("[")) {
      return { success: true, data: text };
    }

    // 错误响应
    return { success: false, error: text };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// 获取余额
export async function getBalance(): Promise<{ balance: number } | { error: string }> {
  const result = await makeRequest({ action: "getBalance" });

  if (result.success && result.data) {
    const match = result.data.match(/ACCESS_BALANCE:(\d+\.?\d*)/);
    if (match) {
      return { balance: parseFloat(match[1]) };
    }
  }

  return { error: result.error || "获取余额失败" };
}

// 获取可用国家列表
export async function getCountries(): Promise<{ countries: Array<{ id: string; name: string }> } | { error: string }> {
  return { countries: COUNTRIES };
}

// 获取可用服务列表
export async function getServices(): Promise<{ services: Array<{ code: string; name: string }> } | { error: string }> {
  return { services: SERVICES };
}

// Provider 接口
interface Provider {
  id: string;
  name: string;
  numbers_count: number;
  delivery_percent: number;
  number_lifetime: number;
  price?: number;
}

// 获取服务提供商列表 (用于检查可用性和价格)
export async function getProviders(
  service: string,
  country: string
): Promise<{ providers: Provider[] } | { error: string }> {
  const result = await makeRequest({
    action: "getProviders",
    service,
    country,
  });

  if (result.success && result.data) {
    try {
      const data = JSON.parse(result.data);
      if (Array.isArray(data)) {
        return { providers: data };
      }
      // 可能是对象格式
      if (typeof data === 'object' && data !== null) {
        const providers = Object.values(data) as Provider[];
        return { providers };
      }
    } catch {
      // 解析失败
    }
  }

  return { error: result.error || "获取提供商失败" };
}

// 获取指定服务在所有国家的价格 (带可用数量)
export async function getCountriesWithPrices(
  service: string
): Promise<{ countries: Array<{ id: string; name: string; price: number; count: number }> } | { error: string }> {
  const result = await makeRequest({
    action: "getPrices",
    service,
  });

  console.log("Tiger SMS getPrices response:", result);

  if (result.success && result.data) {
    try {
      const data = JSON.parse(result.data);
      const countries: Array<{ id: string; name: string; price: number; count: number }> = [];

      // 格式1: { "countryId": { "serviceCode": { "cost": "x", "count": y } } }
      // 格式2: 直接是国家对象列表
      for (const [countryId, value] of Object.entries(data)) {
        let serviceData: { cost: string; count: number } | undefined;

        // 尝试格式1: 嵌套结构 { "tg": { "cost": "x", "count": y } }
        if (typeof value === 'object' && value !== null) {
          const serviceObj = value as Record<string, { cost: string; count: number }>;
          serviceData = serviceObj[service];

          // 如果没有找到，可能直接就是 { "cost": "x", "count": y }
          if (!serviceData && 'cost' in serviceObj) {
            serviceData = serviceObj as unknown as { cost: string; count: number };
          }
        }

        if (serviceData && serviceData.count > 0) {
          const countryName = COUNTRY_MAP[countryId];
          // 只添加在 COUNTRY_MAP 中有定义的国家，过滤掉未知的国家ID
          if (countryName) {
            countries.push({
              id: countryId,
              name: countryName,
              price: parseFloat(serviceData.cost) * 2,
              count: serviceData.count,
            });
          }
        }
      }

      // 按价格排序
      countries.sort((a, b) => a.price - b.price);

      console.log("Parsed countries:", countries.length);
      return { countries };
    } catch (e) {
      console.error("Parse error:", e);
    }
  }

  return { error: result.error || "获取价格失败" };
}

// 获取号码价格
export async function getPrice(
  service: string,
  country: string
): Promise<{ price: number; count: number } | { error: string }> {
  const result = await makeRequest({
    action: "getPrices",
    service,
    country,
  });

  if (result.success && result.data) {
    try {
      const data = JSON.parse(result.data);

      // 格式1: {"country":{"service":{"cost":"35.00","count":89}}}
      if (data[country] && data[country][service]) {
        return {
          price: parseFloat(data[country][service].cost) * 2,
          count: parseInt(data[country][service].count),
        };
      }

      // 格式2: [{"service":{"cost":"170.00","count":82}}]
      if (Array.isArray(data) && data.length > 0) {
        const serviceData = data[0][service];
        if (serviceData) {
          return {
            price: parseFloat(serviceData.cost) * 2,
            count: parseInt(serviceData.count),
          };
        }
      }

      // 格式3: {"service":{"cost":"x","count":y}} (直接服务对象)
      if (data[service] && data[service].cost) {
        return {
          price: parseFloat(data[service].cost) * 2,
          count: parseInt(data[service].count),
        };
      }
    } catch {
      // 尝试正则解析
      const costMatch = result.data.match(/"cost":"(\d+\.?\d*)"/);
      const countMatch = result.data.match(/"count":(\d+)/);
      if (costMatch) {
        return {
          price: parseFloat(costMatch[1]) * 2,
          count: countMatch ? parseInt(countMatch[1]) : 0
        };
      }
    }
  }

  // 价格获取失败
  return { error: "无法获取价格" };
}

// 获取手机号
export async function getNumber(
  service: string,
  country: string
): Promise<{ id: string; phone: string } | { error: string }> {
  const result = await makeRequest({
    action: "getNumber",
    service,
    country,
  });

  if (result.success && result.data) {
    // 格式: ACCESS_NUMBER:ID:PHONE
    const match = result.data.match(/ACCESS_NUMBER:(\d+):(\d+)/);
    if (match) {
      return { id: match[1], phone: match[2] };
    }
  }

  return { error: result.error || "获取号码失败" };
}

// 获取验证码状态
export async function getStatus(
  id: string
): Promise<{ status: string; code?: string } | { error: string }> {
  const result = await makeRequest({
    action: "getStatus",
    id,
  });

  if (result.success && result.data) {
    // STATUS_WAIT_CODE - 等待验证码
    // STATUS_WAIT_RETRY - 等待重试
    // STATUS_WAIT_RESEND - 等待重发
    // STATUS_CANCEL - 已取消
    // STATUS_OK:CODE - 收到验证码

    if (result.data === "STATUS_WAIT_CODE") {
      return { status: "waiting" };
    }
    if (result.data === "STATUS_CANCEL") {
      return { status: "cancelled" };
    }

    const codeMatch = result.data.match(/STATUS_OK:(.+)/);
    if (codeMatch) {
      return { status: "received", code: codeMatch[1] };
    }
  }

  return { error: result.error || "获取状态失败" };
}

// 设置状态(确认/取消)
export async function setStatus(
  id: string,
  status: "confirm" | "cancel" | "resend"
): Promise<{ success: boolean } | { error: string }> {
  const statusMap = {
    confirm: "6", // ACCESS_ACTIVATION
    cancel: "8",  // ACCESS_CANCEL
    resend: "3",  // ACCESS_RETRY_GET
  };

  const result = await makeRequest({
    action: "setStatus",
    id,
    status: statusMap[status],
  });

  if (result.success) {
    return { success: true };
  }

  return { error: result.error || "设置状态失败" };
}

export const tigerSms = {
  getBalance,
  getCountries,
  getServices,
  getProviders,
  getCountriesWithPrices,
  getPrice,
  getNumber,
  getStatus,
  setStatus,
  COUNTRIES,
  SERVICES,
  COUNTRY_MAP,
  SERVICE_MAP,
};

export default tigerSms;
