/**
 * Bitget Spot Market API 类型定义
 * 基于 https://www.bitget.com/zh-CN/api-doc/spot/market
 */

// ============== 枚举类型 ==============

/**
 * 交易对状态
 */
export enum SymbolStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  SUSPEND = 'suspend',
}

/**
 * 交易方向
 */
export enum TradeSide {
  BUY = 'buy',
  SELL = 'sell',
}

/**
 * 网络拥堵状态
 */
export enum CongestionStatus {
  NORMAL = 'normal',
  CONGESTED = 'congested',
}

// ============== 基础响应接口 ==============

/**
 * Bitget API 基础响应结构
 */
export interface BitgetResponse<T> {
  code: string;
  msg: string;
  requestTime: number;
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

// ============== 币种相关接口 ==============

/**
 * 链信息
 */
export interface ChainInfo {
  /** 链名称 */
  chain: string;
  /** 是否需要 tag/memo */
  needTag: string;
  /** 是否可提现 */
  withdrawable: string;
  /** 是否可充值 */
  rechargeable: string;
  /** 提现手续费 */
  withdrawFee: string;
  /** 额外提现费用 */
  extraWithdrawFee: string;
  /** 充值确认数 */
  depositConfirm: string;
  /** 提现确认数 */
  withdrawConfirm: string;
  /** 最小充值金额 */
  minDepositAmount: string;
  /** 最小提现金额 */
  minWithdrawAmount: string;
  /** 区块浏览器 URL */
  browserUrl: string;
  /** 合约地址 */
  contractAddress: string | null;
  /** 提现步长 */
  withdrawStep: string;
  /** 提现最小精度 */
  withdrawMinScale: string;
  /** 网络拥堵状态 */
  congestion: CongestionStatus | string;
}

/**
 * 币种信息
 */
export interface CoinInfo {
  /** 币种 ID */
  coinId: string;
  /** 币种名称 */
  coin: string;
  /** 是否可划转 */
  transfer: string;
  /** 支持的链列表 */
  chains: ChainInfo[];
  /** 是否为区域币种 */
  areaCoin: string;
}

/**
 * 获取币种列表响应
 */
export type GetCoinsResponse = BitgetResponse<CoinInfo[]>;

// ============== 交易对相关接口 ==============

/**
 * 交易对信息
 */
export interface SymbolInfo {
  /** 交易对名称 */
  symbol: string;
  /** 基础币种 */
  baseCoin: string;
  /** 计价币种 */
  quoteCoin: string;
  /** 最小交易数量 */
  minTradeAmount: string;
  /** 最大交易数量 */
  maxTradeAmount: string;
  /** Taker 手续费率 */
  takerFeeRate: string;
  /** Maker 手续费率 */
  makerFeeRate: string;
  /** 价格精度 */
  pricePrecision: string;
  /** 数量精度 */
  quantityPrecision: string;
  /** 金额精度 */
  quotePrecision: string;
  /** 交易对状态 */
  status: SymbolStatus | string;
  /** 最小交易金额(USDT) */
  minTradeUSDT: string;
  /** 买入限价比例 */
  buyLimitPriceRatio: string;
  /** 卖出限价比例 */
  sellLimitPriceRatio: string;
  /** 是否为区域交易对 */
  areaSymbol: string;
  /** 最大订单数量 */
  orderQuantity: string;
  /** 开盘时间 */
  openTime: string;
  /** 下线时间 */
  offTime: string;
}

/**
 * 获取交易对请求参数
 */
export interface GetSymbolsParams {
  /** 交易对名称 (可选) */
  symbol?: string;
}

/**
 * 获取交易对列表响应
 */
export type GetSymbolsResponse = BitgetResponse<SymbolInfo[]>;

// ============== 行情相关接口 ==============

/**
 * 行情信息
 */
export interface TickerInfo {
  /** 交易对名称 */
  symbol: string;
  /** 24小时开盘价 */
  open: string;
  /** 24小时最高价 */
  high24h: string;
  /** 24小时最低价 */
  low24h: string;
  /** 最新成交价 */
  lastPr: string;
  /** 24小时成交额(计价币种) */
  quoteVolume: string;
  /** 24小时成交量(基础币种) */
  baseVolume: string;
  /** 24小时成交额(USDT) */
  usdtVolume: string;
  /** 时间戳 */
  ts: string;
  /** 买一价 */
  bidPr: string;
  /** 卖一价 */
  askPr: string;
  /** 买一量 */
  bidSz: string;
  /** 卖一量 */
  askSz: string;
  /** UTC 0点开盘价 */
  openUtc: string;
  /** UTC 24小时涨跌幅 */
  changeUtc24h: string;
  /** 24小时涨跌幅 */
  change24h: string;
}

/**
 * 获取行情请求参数
 */
export interface GetTickersParams {
  /** 交易对名称 (可选，不传则返回所有) */
  symbol?: string;
}

/**
 * 获取行情响应
 */
export type GetTickersResponse = BitgetResponse<TickerInfo[]>;

// ============== 成交记录相关接口 ==============

/**
 * 成交记录
 */
export interface TradeRecord {
  /** 交易对名称 */
  symbol: string;
  /** 成交 ID */
  tradeId: string;
  /** 交易方向 */
  side: TradeSide | string;
  /** 成交价格 */
  price: string;
  /** 成交数量 */
  size: string;
  /** 成交时间戳 */
  ts: string;
}

/**
 * 获取最近成交记录请求参数
 */
export interface GetRecentTradesParams {
  /** 交易对名称 (必填) */
  symbol: string;
  /** 返回数量，默认 100，最大 500 */
  limit?: string;
}

/**
 * 获取最近成交记录响应
 */
export type GetRecentTradesResponse = BitgetResponse<TradeRecord[]>;

/**
 * 获取历史成交记录请求参数
 */
export interface GetMarketTradesParams {
  /** 交易对名称 (必填) */
  symbol: string;
  /** 返回数量，默认 100，最大 500 */
  limit?: string;
  /** 结束时间戳(毫秒) */
  endTime?: string;
}

/**
 * 获取历史成交记录响应
 */
export type GetMarketTradesResponse = BitgetResponse<TradeRecord[]>;

// ============== 访问限制常量 ==============

/**
 * API 访问限制配置
 */
export const API_RATE_LIMITS = {
  /** 获取币种列表 - 20次/秒 */
  GET_COINS: { limit: 20, interval: 1000 },
  /** 获取交易对列表 - 20次/秒 */
  GET_SYMBOLS: { limit: 20, interval: 1000 },
  /** 获取行情 - 20次/秒 */
  GET_TICKERS: { limit: 20, interval: 1000 },
  /** 获取最近成交 - 10次/秒 */
  GET_RECENT_TRADES: { limit: 10, interval: 1000 },
  /** 获取历史成交 - 10次/秒 */
  GET_MARKET_TRADES: { limit: 10, interval: 1000 },
} as const;

// ============== API 端点常量 ==============

/**
 * API 端点路径
 */
export const API_ENDPOINTS = {
  /** 基础 URL */
  BASE_URL: 'https://api.bitget.com',
  /** 获取币种列表 */
  GET_COINS: '/api/v2/spot/public/coins',
  /** 获取交易对列表 */
  GET_SYMBOLS: '/api/v2/spot/public/symbols',
  /** 获取行情 */
  GET_TICKERS: '/api/v2/spot/market/tickers',
  /** 获取最近成交 */
  GET_RECENT_TRADES: '/api/v2/spot/market/fills',
  /** 获取历史成交 */
  GET_MARKET_TRADES: '/api/v2/spot/market/fills-history',
} as const;

// ============== 错误码 ==============

/**
 * Bitget API 错误码
 */
export const ERROR_CODES = {
  /** 成功 */
  SUCCESS: '00000',
  /** 参数错误 */
  PARAM_ERROR: '40001',
  /** 签名错误 */
  SIGN_ERROR: '40002',
  /** 权限不足 */
  PERMISSION_DENIED: '40003',
  /** 系统错误 */
  SYSTEM_ERROR: '50001',
} as const;
