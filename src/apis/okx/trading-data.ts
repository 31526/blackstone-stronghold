/**
 * OKX Trading Statistics API 类型定义
 * 基于 https://www.okx.com/docs-v5/zh/#trading-statistics-rest-api
 */

// ============== 枚举类型 ==============

/**
 * 时间周期
 */
export enum Period {
  /** 5分钟 */
  FIVE_MINUTES = '5m',
  /** 1小时 */
  ONE_HOUR = '1H',
  /** 1天 */
  ONE_DAY = '1D',
  /** 8小时 (期权专用) */
  EIGHT_HOURS = '8H',
}

/**
 * 产品类型
 */
export enum InstType {
  /** 现货 */
  SPOT = 'SPOT',
  /** 永续合约 */
  SWAP = 'SWAP',
  /** 交割合约 */
  FUTURES = 'FUTURES',
  /** 期权 */
  OPTION = 'OPTION',
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

// ============== 支持币种接口 ==============

/**
 * 交易大数据支持币种
 */
export interface SupportCoinData {
  /** 合约支持币种列表 */
  contract: string[];
  /** 期权支持币种列表 */
  option: string[];
  /** 现货支持币种列表 */
  spot: string[];
}

/**
 * 获取支持币种响应
 */
export type GetSupportCoinResponse = OkxResponse<SupportCoinData>;

// ============== 合约持仓量历史接口 ==============

/**
 * 获取合约持仓量历史请求参数
 */
export interface GetContractOpenInterestHistoryParams {
  /** 产品ID (必填) */
  instId: string;
  /** 时间周期 (5m/1H/1D，默认5m) */
  period?: Period | string;
}

/**
 * 合约持仓量历史数据 [时间戳, 持仓量(张), 持仓量(币), 持仓量(USD)]
 */
export type ContractOpenInterestHistoryData = [string, string, string, string];

/**
 * 获取合约持仓量历史响应
 */
export type GetContractOpenInterestHistoryResponse = OkxResponse<ContractOpenInterestHistoryData[]>;

// ============== 主动买入/卖出接口 ==============

/**
 * 获取主动买入/卖出请求参数
 */
export interface GetTakerVolumeParams {
  /** 币种 (必填) */
  ccy: string;
  /** 产品类型 (必填: SPOT) */
  instType: InstType | string;
  /** 时间周期 (5m/1H/1D，默认5m) */
  period?: Period | string;
}

/**
 * 主动买入/卖出数据 [时间戳, 主动卖出量, 主动买入量]
 */
export type TakerVolumeData = [string, string, string];

/**
 * 获取主动买入/卖出响应
 */
export type GetTakerVolumeResponse = OkxResponse<TakerVolumeData[]>;

// ============== 合约主动买入/卖出接口 ==============

/**
 * 获取合约主动买入/卖出请求参数
 */
export interface GetContractTakerVolumeParams {
  /** 产品ID (必填) */
  instId: string;
  /** 时间周期 (5m/1H/1D，默认5m) */
  period?: Period | string;
}

/**
 * 合约主动买入/卖出数据 [时间戳, 主动卖出量(张), 主动买入量(张)]
 */
export type ContractTakerVolumeData = [string, string, string];

/**
 * 获取合约主动买入/卖出响应
 */
export type GetContractTakerVolumeResponse = OkxResponse<ContractTakerVolumeData[]>;

// ============== 杠杆多空比接口 ==============

/**
 * 获取杠杆多空比请求参数
 */
export interface GetMarginLoanRatioParams {
  /** 币种 (必填) */
  ccy: string;
  /** 时间周期 (5m/1H/1D，默认5m) */
  period?: Period | string;
}

/**
 * 杠杆多空比数据 [时间戳, 多空比]
 */
export type MarginLoanRatioData = [string, string];

/**
 * 获取杠杆多空比响应
 */
export type GetMarginLoanRatioResponse = OkxResponse<MarginLoanRatioData[]>;

// ============== 期权持仓量比/交易量比接口 ==============

/**
 * 获取期权持仓量比/交易量比请求参数
 */
export interface GetPutCallRatioParams {
  /** 币种 (必填) */
  ccy: string;
  /** 时间周期 (8H/1D，默认8H) */
  period?: Period | string;
}

/**
 * 期权持仓量比/交易量比数据 [时间戳, 持仓量比, 交易量比]
 */
export type PutCallRatioData = [string, string, string];

/**
 * 获取期权持仓量比/交易量比响应
 */
export type GetPutCallRatioResponse = OkxResponse<PutCallRatioData[]>;

// ============== 合约多空持仓人数比接口 ==============

/**
 * 获取合约多空持仓人数比请求参数
 */
export interface GetContractLongShortRatioParams {
  /** 币种 (必填) */
  ccy: string;
  /** 时间周期 (5m/1H/1D，默认5m) */
  period?: Period | string;
}

/**
 * 合约多空持仓人数比数据 [时间戳, 多空比]
 */
export type ContractLongShortRatioData = [string, string];

/**
 * 获取合约多空持仓人数比响应
 */
export type GetContractLongShortRatioResponse = OkxResponse<ContractLongShortRatioData[]>;

// ============== 合约持仓量及交易量接口 ==============

/**
 * 获取合约持仓量及交易量请求参数
 */
export interface GetContractsOpenInterestVolumeParams {
  /** 币种 (必填) */
  ccy: string;
  /** 时间周期 (5m/1H/1D，默认5m) */
  period?: Period | string;
}

/**
 * 合约持仓量及交易量数据 [时间戳, 持仓量(USD), 交易量(USD)]
 */
export type ContractsOpenInterestVolumeData = [string, string, string];

/**
 * 获取合约持仓量及交易量响应
 */
export type GetContractsOpenInterestVolumeResponse = OkxResponse<ContractsOpenInterestVolumeData[]>;

// ============== 期权持仓量及交易量接口 ==============

/**
 * 获取期权持仓量及交易量请求参数
 */
export interface GetOptionsOpenInterestVolumeParams {
  /** 币种 (必填) */
  ccy: string;
  /** 时间周期 (8H/1D，默认8H) */
  period?: Period | string;
}

/**
 * 期权持仓量及交易量数据 [时间戳, 持仓量(币), 交易量(币)]
 */
export type OptionsOpenInterestVolumeData = [string, string, string];

/**
 * 获取期权持仓量及交易量响应
 */
export type GetOptionsOpenInterestVolumeResponse = OkxResponse<OptionsOpenInterestVolumeData[]>;

// ============== 期权按到期日持仓量及交易量接口 ==============

/**
 * 获取期权按到期日持仓量及交易量请求参数
 */
export interface GetOpenInterestVolumeExpiryParams {
  /** 币种 (必填) */
  ccy: string;
  /** 时间周期 (8H/1D，默认8H) */
  period?: Period | string;
}

/**
 * 期权按到期日持仓量及交易量数据 [时间戳, 到期日, 看涨持仓量, 看跌持仓量, 看涨交易量, 看跌交易量]
 */
export type OpenInterestVolumeExpiryData = [string, string, string, string, string, string];

/**
 * 获取期权按到期日持仓量及交易量响应
 */
export type GetOpenInterestVolumeExpiryResponse = OkxResponse<OpenInterestVolumeExpiryData[]>;

// ============== 期权按执行价格持仓量及交易量接口 ==============

/**
 * 获取期权按执行价格持仓量及交易量请求参数
 */
export interface GetOpenInterestVolumeStrikeParams {
  /** 币种 (必填) */
  ccy: string;
  /** 到期日 (必填，格式YYYYMMDD) */
  expTime: string;
  /** 时间周期 (8H/1D，默认8H) */
  period?: Period | string;
}

/**
 * 期权按执行价格持仓量及交易量数据 [时间戳, 执行价格, 看涨持仓量, 看跌持仓量, 看涨交易量, 看跌交易量]
 */
export type OpenInterestVolumeStrikeData = [string, string, string, string, string, string];

/**
 * 获取期权按执行价格持仓量及交易量响应
 */
export type GetOpenInterestVolumeStrikeResponse = OkxResponse<OpenInterestVolumeStrikeData[]>;

// ============== 期权主动买入/卖出量接口 ==============

/**
 * 获取期权主动买入/卖出量请求参数
 */
export interface GetOptionTakerFlowParams {
  /** 币种 (必填) */
  ccy: string;
  /** 时间周期 (8H/1D，默认8H) */
  period?: Period | string;
}

/**
 * 期权主动买入/卖出量数据
 * [时间戳, 看涨主动卖出量, 看涨主动买入量, 看跌主动卖出量, 看跌主动买入量, 看涨大宗交易量, 看跌大宗交易量]
 * 注意: API 返回的是单个数组而非数组的数组
 */
export type OptionTakerFlowData = string[];

/**
 * 获取期权主动买入/卖出量响应
 */
export type GetOptionTakerFlowResponse = OkxResponse<OptionTakerFlowData>;

// ============== 访问限制常量 ==============

/**
 * API 访问限制配置
 */
export const API_RATE_LIMITS = {
  /** 获取支持币种 - 5次/2秒 */
  GET_SUPPORT_COIN: { limit: 5, interval: 2000 },
  /** 获取合约持仓量历史 - 5次/2秒 */
  GET_CONTRACT_OPEN_INTEREST_HISTORY: { limit: 5, interval: 2000 },
  /** 获取主动买入/卖出 - 5次/2秒 */
  GET_TAKER_VOLUME: { limit: 5, interval: 2000 },
  /** 获取合约主动买入/卖出 - 5次/2秒 */
  GET_CONTRACT_TAKER_VOLUME: { limit: 5, interval: 2000 },
  /** 获取杠杆多空比 - 5次/2秒 */
  GET_MARGIN_LOAN_RATIO: { limit: 5, interval: 2000 },
  /** 获取期权持仓量比/交易量比 - 5次/2秒 */
  GET_PUT_CALL_RATIO: { limit: 5, interval: 2000 },
  /** 获取合约多空持仓人数比 - 5次/2秒 */
  GET_CONTRACT_LONG_SHORT_RATIO: { limit: 5, interval: 2000 },
  /** 获取合约持仓量及交易量 - 5次/2秒 */
  GET_CONTRACTS_OPEN_INTEREST_VOLUME: { limit: 5, interval: 2000 },
  /** 获取期权持仓量及交易量 - 5次/2秒 */
  GET_OPTIONS_OPEN_INTEREST_VOLUME: { limit: 5, interval: 2000 },
  /** 获取期权按到期日持仓量 - 5次/2秒 */
  GET_OPEN_INTEREST_VOLUME_EXPIRY: { limit: 5, interval: 2000 },
  /** 获取期权按执行价格持仓量 - 5次/2秒 */
  GET_OPEN_INTEREST_VOLUME_STRIKE: { limit: 5, interval: 2000 },
  /** 获取期权主动买入/卖出量 - 5次/2秒 */
  GET_OPTION_TAKER_FLOW: { limit: 5, interval: 2000 },
} as const;

// ============== API 端点常量 ==============

/**
 * API 端点路径
 */
export const API_ENDPOINTS = {
  /** 基础 URL */
  BASE_URL: 'https://www.okx.com',
  /** 获取支持币种 */
  GET_SUPPORT_COIN: '/api/v5/rubik/stat/trading-data/support-coin',
  /** 获取合约持仓量历史 */
  GET_CONTRACT_OPEN_INTEREST_HISTORY: '/api/v5/rubik/stat/contracts/open-interest-history',
  /** 获取主动买入/卖出 */
  GET_TAKER_VOLUME: '/api/v5/rubik/stat/taker-volume',
  /** 获取合约主动买入/卖出 */
  GET_CONTRACT_TAKER_VOLUME: '/api/v5/rubik/stat/taker-volume-contract',
  /** 获取杠杆多空比 */
  GET_MARGIN_LOAN_RATIO: '/api/v5/rubik/stat/margin/loan-ratio',
  /** 获取期权持仓量比/交易量比 */
  GET_PUT_CALL_RATIO: '/api/v5/rubik/stat/option/open-interest-volume-ratio',
  /** 获取合约多空持仓人数比 */
  GET_CONTRACT_LONG_SHORT_RATIO: '/api/v5/rubik/stat/contracts/long-short-account-ratio',
  /** 获取合约持仓量及交易量 */
  GET_CONTRACTS_OPEN_INTEREST_VOLUME: '/api/v5/rubik/stat/contracts/open-interest-volume',
  /** 获取期权持仓量及交易量 */
  GET_OPTIONS_OPEN_INTEREST_VOLUME: '/api/v5/rubik/stat/option/open-interest-volume',
  /** 获取期权按到期日持仓量 */
  GET_OPEN_INTEREST_VOLUME_EXPIRY: '/api/v5/rubik/stat/option/open-interest-volume-expiry',
  /** 获取期权按执行价格持仓量 */
  GET_OPEN_INTEREST_VOLUME_STRIKE: '/api/v5/rubik/stat/option/open-interest-volume-strike',
  /** 获取期权主动买入/卖出量 */
  GET_OPTION_TAKER_FLOW: '/api/v5/rubik/stat/option/taker-block-volume',
} as const;

// ============== 错误码 ==============

/**
 * OKX API 错误码
 */
export const ERROR_CODES = {
  /** 成功 */
  SUCCESS: '0',
  /** 参数错误 */
  PARAM_ERROR: '51000',
  /** 系统繁忙 */
  SYSTEM_BUSY: '50001',
  /** API endpoint请求超时 */
  REQUEST_TIMEOUT: '50004',
  /** 请求频率过高 */
  RATE_LIMIT_EXCEEDED: '50011',
  /** 缺少必填参数 */
  MISSING_PARAM: '50014',
} as const;
