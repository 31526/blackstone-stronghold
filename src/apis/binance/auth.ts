/**
 * 币安 API 鉴权模块
 * 支持 HMAC SHA256 签名
 */

import crypto from 'crypto';

/**
 * 获取 API Key（动态获取以确保环境变量已加载）
 */
function getApiKeyFromEnv(): string {
  return process.env.BINANCE_API_KEY || '';
}

/**
 * 获取 API Secret（动态获取以确保环境变量已加载）
 */
function getApiSecretFromEnv(): string {
  return process.env.BINANCE_API_SECRET || '';
}

/**
 * 获取当前时间戳（毫秒）
 */
export function getTimestamp(): number {
  return Date.now();
}

/**
 * 生成 HMAC SHA256 签名
 * @param queryString - 需要签名的查询字符串
 * @param secretKey - 可选的密钥，默认使用环境变量
 * @returns 签名字符串
 */
export function createSignature(queryString: string, secretKey?: string): string {
  const secret = secretKey || getApiSecretFromEnv();
  if (!secret) {
    throw new Error('缺少 API Secret Key');
  }
  return crypto.createHmac('sha256', secret).update(queryString).digest('hex');
}

/**
 * 将对象转换为查询字符串
 * @param params - 参数对象
 * @returns 查询字符串
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const filteredParams: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      filteredParams[key] = String(value);
    }
  }

  return new URLSearchParams(filteredParams).toString();
}

/**
 * 为请求添加签名
 * @param params - 请求参数
 * @param secretKey - 可选的密钥
 * @returns 带签名的参数对象
 */
export function signRequest<T extends Record<string, unknown>>(
  params: T,
  secretKey?: string
): T & { signature: string } {
  // 确保有时间戳
  const paramsWithTimestamp = {
    ...params,
    timestamp: params.timestamp || getTimestamp(),
  };

  // 构建查询字符串
  const queryString = buildQueryString(paramsWithTimestamp);

  // 生成签名
  const signature = createSignature(queryString, secretKey);

  return {
    ...paramsWithTimestamp,
    signature,
  } as T & { signature: string };
}

/**
 * 获取用于请求头的 API Key
 */
export function getApiKey(): string {
  const apiKey = getApiKeyFromEnv();
  if (!apiKey) {
    throw new Error('缺少 BINANCE_API_KEY 环境变量');
  }
  return apiKey;
}

/**
 * 获取鉴权请求头
 */
export function getAuthHeaders(): Record<string, string> {
  return {
    'X-MBX-APIKEY': getApiKey(),
  };
}

/**
 * 检查 API 密钥是否配置
 */
export function isApiKeyConfigured(): boolean {
  return !!(getApiKeyFromEnv() && getApiSecretFromEnv());
}

/**
 * 验证签名（用于测试）
 * @param queryString - 原始查询字符串
 * @param signature - 待验证的签名
 * @param secretKey - 可选的密钥
 * @returns 是否匹配
 */
export function verifySignature(
  queryString: string,
  signature: string,
  secretKey?: string
): boolean {
  const expectedSignature = createSignature(queryString, secretKey);
  return expectedSignature.toLowerCase() === signature.toLowerCase();
}

/**
 * URL 编码（用于非 ASCII 字符）
 */
export function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}
