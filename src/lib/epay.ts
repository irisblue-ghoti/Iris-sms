import crypto from "crypto";

const EPAY_URL = process.env.EPAY_URL || "";
const EPAY_PID = process.env.EPAY_PID || "";
const EPAY_KEY = process.env.EPAY_KEY || "";

interface PaymentParams {
  orderNo: string;
  amount: number;
  type: "alipay" | "wxpay";
  notifyUrl: string;
  returnUrl: string;
  name?: string;
}

function generateSign(params: Record<string, string>): string {
  // 按ASCII码排序
  const sortedKeys = Object.keys(params).sort();
  const stringA = sortedKeys
    .filter((key) => params[key] && key !== "sign" && key !== "sign_type")
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  const stringSignTemp = stringA + EPAY_KEY;
  return crypto.createHash("md5").update(stringSignTemp).digest("hex");
}

export function createPaymentUrl(params: PaymentParams): string {
  const payParams: Record<string, string> = {
    pid: EPAY_PID,
    type: params.type,
    out_trade_no: params.orderNo,
    notify_url: params.notifyUrl,
    return_url: params.returnUrl,
    name: params.name || "余额充值",
    money: params.amount.toFixed(2),
    sitename: "IrisSMS",
  };

  const sign = generateSign(payParams);
  payParams.sign = sign;
  payParams.sign_type = "MD5";

  const url = new URL(`${EPAY_URL}/submit.php`);
  Object.entries(payParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
}

export function verifyNotify(params: Record<string, string>): boolean {
  const { sign, sign_type, ...rest } = params;

  if (!sign) return false;

  const expectedSign = generateSign(rest);
  return sign.toLowerCase() === expectedSign.toLowerCase();
}

export const epay = {
  createPaymentUrl,
  verifyNotify,
};

export default epay;
