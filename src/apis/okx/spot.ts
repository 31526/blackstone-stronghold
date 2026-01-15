/**
 * OKX Spot Market API 类型定义
 * 基于 https://www.okx.com/docs-v5/zh/
 */

// ============== 枚举类型 ==============

/**
 * 产品类型
 */
export enum InstType {
  /** 现货 */
  SPOT = 'SPOT',
  /** 杠杆 */
  MARGIN = 'MARGIN',
  /** 永续合约 */
  SWAP = 'SWAP',
  /** 交割合约 */
  FUTURES = 'FUTURES',
  /** 期权 */
  OPTION = 'OPTION',
}

/**
 * 产品状态
 */
export enum InstState {
  /** 交易中 */
  LIVE = 'live',
  /** 暂停中 */
  SUSPEND = 'suspend',
  /** 预上线 */
  PREOPEN = 'preopen',
}

// ============== 基础响应接口 ==============

/**
 * OKX API 基础响应结构
 */
export interface OkxResponse<T> {
  code: string;
  msg: string;
  data: T;
}

/**
 * API 响应包装类型 (用于路由)
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  savedTo?: string | null;
}

// ============== 交易产品接口 ==============

/**
 * 交易产品信息
 */
export interface InstrumentInfo {
  /** 产品类型 */
  instType: InstType | string;
  /** 产品ID */
  instId: string;
  /** 基础货币 */
  baseCcy: string;
  /** 计价货币 */
  quoteCcy: string;
  /** 最小下单数量 */
  minSz: string;
  /** 下单数量精度 */
  lotSz: string;
  /** 价格精度 */
  tickSz: string;
  /** 产品状态 */
  state: InstState | string;
  /** 上线时间 */
  listTime: string;
  /** 最大限价单数量 */
  maxLmtSz: string;
  /** 最大市价单数量 */
  maxMktSz: string;
  /** 最大限价单金额 */
  maxLmtAmt: string;
  /** 最大市价单金额 */
  maxMktAmt: string;
  /** 金额精度 */
  quotePrecision?: string;
  /** 分类 */
  category?: string;
  /** 交易品种 */
  instFamily?: string;
  /** 标的指数 */
  uly?: string;
  /** 区域类型 */
  areaSymbol?: string;
  /** 规则类型 */
  ruleType?: string;
  /** 别名 */
  alias?: string;
}

/**
 * 获取交易产品请求参数
 */
export interface GetInstrumentsParams {
  /** 产品类型 (必填) */
  instType: InstType | string;
  /** 产品ID (可选) */
  instId?: string;
  /** 标的指数 (可选，仅适用于交割/永续/期权) */
  uly?: string;
  /** 交易品种 (可选，仅适用于交割/永续/期权) */
  instFamily?: string;
}

/**
 * 获取交易产品响应
 */
export type GetInstrumentsResponse = OkxResponse<InstrumentInfo[]>;

// ============== 行情数据接口 ==============

/**
 * 行情信息
 */
export interface TickerInfo {
  /** 产品类型 */
  instType: InstType | string;
  /** 产品ID */
  instId: string;
  /** 最新成交价 */
  last: string;
  /** 最新成交数量 */
  lastSz: string;
  /** 卖一价 */
  askPx: string;
  /** 卖一量 */
  askSz: string;
  /** 买一价 */
  bidPx: string;
  /** 买一量 */
  bidSz: string;
  /** 24小时开盘价 */
  open24h: string;
  /** 24小时最高价 */
  high24h: string;
  /** 24小时最低价 */
  low24h: string;
  /** 24小时成交额(计价货币) */
  volCcy24h: string;
  /** 24小时成交量(基础货币) */
  vol24h: string;
  /** 数据时间戳 */
  ts: string;
  /** UTC 0点开盘价 */
  sodUtc0: string;
  /** UTC+8 0点开盘价 */
  sodUtc8: string;
}

/**
 * 获取所有行情请求参数
 */
export interface GetTickersParams {
  /** 产品类型 (必填) */
  instType: InstType | string;
  /** 标的指数 (可选) */
  uly?: string;
  /** 交易品种 (可选) */
  instFamily?: string;
}

/**
 * 获取所有行情响应
 */
export type GetTickersResponse = OkxResponse<TickerInfo[]>;

/**
 * 获取单个行情请求参数
 */
export interface GetTickerParams {
  /** 产品ID (必填) */
  instId: string;
}

/**
 * 获取单个行情响应
 */
export type GetTickerResponse = OkxResponse<TickerInfo[]>;

// ============== 访问限制常量 ==============

/**
 * API 访问限制配置
 */
export const API_RATE_LIMITS = {
  /** 获取交易产品信息 - 20次/2秒 */
  GET_INSTRUMENTS: { limit: 20, interval: 2000 },
  /** 获取所有行情 - 20次/2秒 */
  GET_TICKERS: { limit: 20, interval: 2000 },
  /** 获取单个行情 - 20次/2秒 */
  GET_TICKER: { limit: 20, interval: 2000 },
} as const;

// ============== API 端点常量 ==============

/**
 * API 端点路径
 */
export const API_ENDPOINTS = {
  /** 基础 URL */
  BASE_URL: 'https://www.okx.com',
  /** 获取交易产品信息 */
  GET_INSTRUMENTS: '/api/v5/public/instruments',
  /** 获取所有行情 */
  GET_TICKERS: '/api/v5/market/tickers',
  /** 获取单个行情 */
  GET_TICKER: '/api/v5/market/ticker',
} as const;

// ============== 错误码 ==============

/**
 * OKX API 错误码
 */
export const ERROR_CODES = {
  /** 成功 */
  SUCCESS: '0',
  /** 参数错误 */
  PARAM_ERROR: '50000',
  /** 系统繁忙 */
  SYSTEM_BUSY: '50001',
  /** API endpoint请求超时 */
  REQUEST_TIMEOUT: '50004',
  /** 请求频率过高 */
  RATE_LIMIT_EXCEEDED: '50011',
  /** 签名错误 */
  SIGN_ERROR: '50113',
} as const;

// ============== 签名认证相关 ==============

/**
 * 签名认证请求头
 */
export interface OkxAuthHeaders {
  /** API Key */
  'OK-ACCESS-KEY': string;
  /** 签名 (Base64编码的HMAC SHA256) */
  'OK-ACCESS-SIGN': string;
  /** UTC时间戳 */
  'OK-ACCESS-TIMESTAMP': string;
  /** API密码 */
  'OK-ACCESS-PASSPHRASE': string;
}

/**
 * 签名配置
 */
export interface OkxSignatureConfig {
  /** API Key */
  apiKey: string;
  /** Secret Key */
  secretKey: string;
  /** Passphrase */
  passphrase: string;
}
