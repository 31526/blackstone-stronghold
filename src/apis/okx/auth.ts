/**
 * OKX API 鉴权模块
 * 支持 HMAC SHA256 签名 + Base64 编码
 *
 * 签名方式:
 * 1. 创建预签名字符串: timestamp + method + requestPath + body
 * 2. 使用 SecretKey 进行 HMAC SHA256 签名
 * 3. 对签名结果进行 Base64 编码
 */

import crypto from 'crypto';

/**
 * OKX API 配置接口
 */
export interface OkxApiConfig {
  apiKey: string;
  secretKey: string;
  passphrase: string;
}

/**
 * OKX 请求头接口
 */
export interface OkxAuthHeaders {
  'OK-ACCESS-KEY': string;
  'OK-ACCESS-SIGN': string;
  'OK-ACCESS-TIMESTAMP': string;
  'OK-ACCESS-PASSPHRASE': string;
  'Content-Type': string;
}

/**
 * 获取 API Key（动态获取以确保环境变量已加载）
 */
function getApiKeyFromEnv(): string {
  return process.env.OKX_API_KEY || '';
}

/**
 * 获取 API Secret（动态获取以确保环境变量已加载）
 */
function getApiSecretFromEnv(): string {
  return process.env.OKX_API_SECRET || '';
}

/**
 * 获取 API Passphrase（动态获取以确保环境变量已加载）
 */
function getPassphraseFromEnv(): string {
  return process.env.OKX_API_PASSPHRASE || '';
}

/**
 * 获取当前 ISO 8601 格式时间戳
 * @returns ISO 8601 格式的 UTC 时间戳
 */
export function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * 生成 HMAC SHA256 签名并进行 Base64 编码
 * @param preHash - 预签名字符串 (timestamp + method + requestPath + body)
 * @param secretKey - 可选的密钥，默认使用环境变量
 * @returns Base64 编码的签名字符串
 */
export function createSignature(preHash: string, secretKey?: string): string {
  const secret = secretKey || getApiSecretFromEnv();
  if (!secret) {
    throw new Error('缺少 OKX_API_SECRET 环境变量');
  }
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(preHash);
  return hmac.digest('base64');
}

/**
 * 生成签名
 * @param timestamp - ISO 8601 格式的 UTC 时间戳
 * @param method - HTTP 方法 (GET, POST, etc.)
 * @param requestPath - 请求路径 (包含查询参数)
 * @param body - 请求体 (POST 请求时使用)
 * @param secretKey - 可选的密钥
 * @returns Base64 编码的签名
 */
export function sign(
  timestamp: string,
  method: string,
  requestPath: string,
  body: string = '',
  secretKey?: string
): string {
  const preHash = timestamp + method.toUpperCase() + requestPath + body;
  return createSignature(preHash, secretKey);
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

  const queryString = new URLSearchParams(filteredParams).toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * 获取鉴权请求头
 * @param method - HTTP 方法
 * @param requestPath - 请求路径 (包含查询参数)
 * @param body - 请求体 (POST 请求时使用)
 * @param config - 可选的 API 配置
 * @returns 鉴权请求头对象
 */
export function getAuthHeaders(
  method: string,
  requestPath: string,
  body: string = '',
  config?: Partial<OkxApiConfig>
): OkxAuthHeaders {
  const apiKey = config?.apiKey || getApiKeyFromEnv();
  const secretKey = config?.secretKey || getApiSecretFromEnv();
  const passphrase = config?.passphrase || getPassphraseFromEnv();

  if (!apiKey) {
    throw new Error('缺少 OKX_API_KEY 环境变量');
  }
  if (!secretKey) {
    throw new Error('缺少 OKX_API_SECRET 环境变量');
  }
  if (!passphrase) {
    throw new Error('缺少 OKX_API_PASSPHRASE 环境变量');
  }

  const timestamp = getTimestamp();
  const signature = sign(timestamp, method, requestPath, body, secretKey);

  return {
    'OK-ACCESS-KEY': apiKey,
    'OK-ACCESS-SIGN': signature,
    'OK-ACCESS-TIMESTAMP': timestamp,
    'OK-ACCESS-PASSPHRASE': passphrase,
    'Content-Type': 'application/json',
  };
}

/**
 * 检查 API 密钥是否配置
 * @returns 是否已配置
 */
export function isApiKeyConfigured(): boolean {
  return !!(getApiKeyFromEnv() && getApiSecretFromEnv() && getPassphraseFromEnv());
}

/**
 * 获取 API 配置
 * @returns API 配置对象
 */
export function getApiConfig(): OkxApiConfig {
  const apiKey = getApiKeyFromEnv();
  const secretKey = getApiSecretFromEnv();
  const passphrase = getPassphraseFromEnv();

  if (!apiKey || !secretKey || !passphrase) {
    throw new Error('OKX API 配置不完整，请检查环境变量');
  }

  return {
    apiKey,
    secretKey,
    passphrase,
  };
}

/**
 * 验证签名（用于测试）
 * @param timestamp - 时间戳
 * @param method - HTTP 方法
 * @param requestPath - 请求路径
 * @param body - 请求体
 * @param signature - 待验证的签名
 * @param secretKey - 可选的密钥
 * @returns 是否匹配
 */
export function verifySignature(
  timestamp: string,
  method: string,
  requestPath: string,
  body: string,
  signature: string,
  secretKey?: string
): boolean {
  const expectedSignature = sign(timestamp, method, requestPath, body, secretKey);
  return expectedSignature === signature;
}

export default {
  getTimestamp,
  createSignature,
  sign,
  buildQueryString,
  getAuthHeaders,
  isApiKeyConfigured,
  getApiConfig,
  verifySignature,
};
