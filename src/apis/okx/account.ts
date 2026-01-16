/**
 * OKX Account API 类型定义
 * 基于 https://www.okx.com/docs-v5/zh/#trading-account-rest-api
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
 * 保证金模式
 */
export enum MgnMode {
  /** 全仓 */
  CROSS = 'cross',
  /** 逐仓 */
  ISOLATED = 'isolated',
}

/**
 * 合约类型
 */
export enum CtType {
  /** 正向合约 */
  LINEAR = 'linear',
  /** 反向合约 */
  INVERSE = 'inverse',
}

/**
 * 平仓类型
 */
export enum CloseType {
  /** 部分平仓 */
  PARTIAL = '1',
  /** 完全平仓 */
  FULL = '2',
  /** 强平 */
  LIQUIDATION = '3',
  /** 强减 */
  ADL_CLOSE = '4',
  /** ADL自动减仓 */
  ADL = '5',
}

/**
 * 手续费计价方式
 */
export enum FeeType {
  /** USDT计价 */
  USDT = '0',
  /** 交易币种计价 */
  TRADE_CCY = '1',
}

/**
 * 账户等级
 */
export enum AcctLv {
  /** 简单交易模式 */
  SIMPLE = '1',
  /** 单币种保证金模式 */
  SINGLE = '2',
  /** 跨币种保证金模式 */
  MULTI = '3',
  /** 组合保证金模式 */
  PORTFOLIO = '4',
}

/**
 * 持仓方向
 */
export enum PosSide {
  /** 多头 */
  LONG = 'long',
  /** 空头 */
  SHORT = 'short',
  /** 净头寸 */
  NET = 'net',
}

/**
 * 季度
 */
export enum Quarter {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
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

// ============== 账户余额接口 ==============

/**
 * 币种余额详情
 */
export interface BalanceDetail {
  /** 可用余额 */
  availBal: string;
  /** 可用权益 */
  availEq: string;
  /** 已借出的余额 */
  borrowFroz: string;
  /** 现金余额 */
  cashBal: string;
  /** 币种 */
  ccy: string;
  /** 是否可作为保证金 */
  collateralEnabled: boolean;
  /** 全仓负债 */
  crossLiab: string;
  /** 折算权益 */
  disEq: string;
  /** 总权益 */
  eq: string;
  /** 美元总权益 */
  eqUsd: string;
  /** 冻结余额 */
  frozenBal: string;
  /** 利息 */
  interest: string;
  /** 逐仓权益 */
  isoEq: string;
  /** 逐仓负债 */
  isoLiab: string;
  /** 逐仓未实现盈亏 */
  isoUpl: string;
  /** 负债 */
  liab: string;
  /** 最大可借 */
  maxLoan: string;
  /** 保证金率 */
  mgnRatio: string;
  /** 维持保证金 */
  mmr: string;
  /** 杠杆倍数 */
  notionalLever: string;
  /** 挂单冻结 */
  ordFrozen: string;
  /** 奖励余额 */
  rewardBal: string;
  /** 现货余额 */
  spotBal: string;
  /** 策略权益 */
  stgyEq: string;
  /** 未实现盈亏 */
  upl: string;
  /** 未实现盈亏负债 */
  uplLiab: string;
  /** 更新时间 */
  uTime: string;
}

/**
 * 账户余额信息
 */
export interface AccountBalance {
  /** 调整权益 */
  adjEq: string;
  /** 可用权益 */
  availEq: string;
  /** 已借出的余额冻结 */
  borrowFroz: string;
  /** 币种详情 */
  details: BalanceDetail[];
  /** 初始保证金 */
  imr: string;
  /** 逐仓权益 */
  isoEq: string;
  /** 保证金率 */
  mgnRatio: string;
  /** 维持保证金 */
  mmr: string;
  /** 名义价值 */
  notionalUsd: string;
  /** 挂单冻结 */
  ordFroz: string;
  /** 总权益 */
  totalEq: string;
  /** 更新时间 */
  uTime: string;
  /** 未实现盈亏 */
  upl: string;
}

/**
 * 获取账户余额请求参数
 */
export interface GetBalanceParams {
  /** 币种，如 BTC。支持多币种查询（不超过20个），币种之间半角逗号分隔 */
  ccy?: string;
}

/**
 * 获取账户余额响应
 */
export type GetBalanceResponse = OkxResponse<AccountBalance[]>;

// ============== 持仓信息接口 ==============

/**
 * 持仓信息
 */
export interface Position {
  /** 产品类型 */
  instType: string;
  /** 产品ID */
  instId: string;
  /** 保证金模式 */
  mgnMode: string;
  /** 持仓ID */
  posId: string;
  /** 持仓方向 */
  posSide: string;
  /** 持仓数量 */
  pos: string;
  /** 基础货币持仓数量 */
  baseBal: string;
  /** 计价货币持仓数量 */
  quoteBal: string;
  /** 持仓美元价值 */
  notionalUsd: string;
  /** 可用持仓 */
  availPos: string;
  /** 开仓均价 */
  avgPx: string;
  /** 未实现盈亏 */
  upl: string;
  /** 未实现盈亏比率 */
  uplRatio: string;
  /** 以最新价计算的未实现盈亏 */
  uplLastPx: string;
  /** 以最新价计算的未实现盈亏比率 */
  uplRatioLastPx: string;
  /** 杠杆倍数 */
  lever: string;
  /** 预估强平价 */
  liqPx: string;
  /** 标记价格 */
  markPx: string;
  /** 初始保证金 */
  imr: string;
  /** 保证金 */
  margin: string;
  /** 保证金率 */
  mgnRatio: string;
  /** 维持保证金 */
  mmr: string;
  /** 负债 */
  liab: string;
  /** 负债币种 */
  liabCcy: string;
  /** 利息 */
  interest: string;
  /** 最新成交ID */
  tradeId: string;
  /** 期权市值 */
  optVal: string;
  /** 已实现盈亏 */
  realizedPnl: string;
  /** 累计手续费 */
  fee: string;
  /** 累计资金费 */
  fundingFee: string;
  /** 信号区 */
  adl: string;
  /** 币种 */
  ccy: string;
  /** 最新价格 */
  last: string;
  /** 最新指数价格 */
  idxPx: string;
  /** 美元价格 */
  usdPx: string;
  /** 盈亏平衡价 */
  bePx: string;
  /** 仓位创建时间 */
  cTime: string;
  /** 更新时间 */
  uTime: string;
}

/**
 * 获取持仓请求参数
 */
export interface GetPositionsParams {
  /** 产品类型 */
  instType?: InstType | string;
  /** 产品ID */
  instId?: string;
  /** 持仓ID */
  posId?: string;
}

/**
 * 获取持仓响应
 */
export type GetPositionsResponse = OkxResponse<Position[]>;

// ============== 历史持仓信息接口 ==============

/**
 * 历史持仓信息
 */
export interface PositionHistory {
  /** 产品类型 */
  instType: string;
  /** 产品ID */
  instId: string;
  /** 标的指数 */
  uly: string;
  /** 保证金模式 */
  mgnMode: string;
  /** 持仓ID */
  posId: string;
  /** 持仓方向 */
  posSide: string;
  /** 平仓类型 */
  type: string;
  /** 仓位创建时间 */
  cTime: string;
  /** 更新时间 */
  uTime: string;
  /** 开仓均价 */
  openAvgPx: string;
  /** 平仓均价 */
  closeAvgPx: string;
  /** 开仓最大数量 */
  openMaxPos: string;
  /** 平仓总数量 */
  closeTotalPos: string;
  /** 已实现盈亏 */
  realizedPnl: string;
  /** 盈亏 */
  pnl: string;
  /** 盈亏比率 */
  pnlRatio: string;
  /** 累计手续费 */
  fee: string;
  /** 累计资金费 */
  fundingFee: string;
  /** 累计强平罚金 */
  liqPenalty: string;
  /** 杠杆倍数 */
  lever: string;
  /** 方向 */
  direction: string;
  /** 触发价 */
  triggerPx: string;
  /** 结算盈亏 */
  settledPnl: string;
  /** 未结算均价 */
  nonSettleAvgPx: string;
  /** 币种 */
  ccy: string;
}

/**
 * 获取历史持仓请求参数
 */
export interface GetPositionsHistoryParams {
  /** 产品类型 */
  instType?: InstType | string;
  /** 产品ID */
  instId?: string;
  /** 保证金模式 */
  mgnMode?: MgnMode | string;
  /** 平仓类型 */
  type?: CloseType | string;
  /** 持仓ID */
  posId?: string;
  /** 请求此时间戳之前的数据 */
  after?: string;
  /** 请求此时间戳之后的数据 */
  before?: string;
  /** 返回结果的数量，最大为100 */
  limit?: string;
}

/**
 * 获取历史持仓响应
 */
export type GetPositionsHistoryResponse = OkxResponse<PositionHistory[]>;

// ============== 账户持仓风险接口 ==============

/**
 * 持仓风险数据
 */
export interface PositionRiskData {
  /** 持仓ID */
  posId: string;
  /** 产品ID */
  instId: string;
  /** 产品类型 */
  instType: string;
  /** 保证金模式 */
  mgnMode: string;
  /** 持仓方向 */
  posSide: string;
  /** 持仓数量 */
  pos: string;
  /** 币种 */
  ccy: string;
  /** 持仓美元价值 */
  notionalUsd: string;
  /** 标记价格 */
  markPx: string;
  /** 名义杠杆 */
  notionalLever: string;
}

/**
 * 余额风险数据
 */
export interface BalanceRiskData {
  /** 币种 */
  ccy: string;
  /** 权益 */
  eq: string;
  /** 折算权益 */
  disEq: string;
}

/**
 * 账户持仓风险
 */
export interface AccountPositionRisk {
  /** 调整权益 */
  adjEq: string;
  /** 余额数据 */
  balData: BalanceRiskData[];
  /** 持仓数据 */
  posData: PositionRiskData[];
  /** 数据时间戳 */
  ts: string;
}

/**
 * 获取账户持仓风险请求参数
 */
export interface GetAccountPositionRiskParams {
  /** 产品类型 */
  instType?: InstType | string;
}

/**
 * 获取账户持仓风险响应
 */
export type GetAccountPositionRiskResponse = OkxResponse<AccountPositionRisk[]>;

// ============== 账单流水接口 ==============

/**
 * 账单流水信息
 */
export interface Bill {
  /** 账单ID */
  billId: string;
  /** 产品类型 */
  instType: string;
  /** 产品ID */
  instId: string;
  /** 保证金模式 */
  mgnMode: string;
  /** 账单类型 */
  type: string;
  /** 账单子类型 */
  subType: string;
  /** 数量变化 */
  balChg: string;
  /** 持仓变化 */
  posBalChg: string;
  /** 变化后余额 */
  bal: string;
  /** 变化后持仓 */
  posBal: string;
  /** 数量 */
  sz: string;
  /** 价格 */
  px: string;
  /** 币种 */
  ccy: string;
  /** 盈亏 */
  pnl: string;
  /** 手续费 */
  fee: string;
  /** 利息 */
  interest: string;
  /** 标签 */
  tag: string;
  /** 备注 */
  notes: string;
  /** 时间戳 */
  ts: string;
  /** 最近成交ID */
  tradeId: string;
  /** 订单ID */
  ordId: string;
  /** 客户自定义订单ID */
  clOrdId: string;
  /** 成交数量 */
  fillSz: string;
  /** 成交价格 */
  fillPx: string;
  /** 成交费用 */
  fillFee: string;
  /** 成交时间 */
  fillTime: string;
  /** 成交手续费币种 */
  fillFeeCcy: string;
  /** 执行类型 */
  execType: string;
  /** 来源币种 */
  fromCcy: string;
  /** 目标币种 */
  toCcy: string;
}

/**
 * 获取账单流水请求参数
 */
export interface GetBillsParams {
  /** 产品类型 */
  instType?: InstType | string;
  /** 币种 */
  ccy?: string;
  /** 保证金模式 */
  mgnMode?: MgnMode | string;
  /** 合约类型 */
  ctType?: CtType | string;
  /** 账单类型 */
  type?: string;
  /** 账单子类型 */
  subType?: string;
  /** 请求此ID之前的数据 */
  after?: string;
  /** 请求此ID之后的数据 */
  before?: string;
  /** 筛选的开始时间戳 */
  begin?: string;
  /** 筛选的结束时间戳 */
  end?: string;
  /** 返回结果的数量，最大为100 */
  limit?: string;
}

/**
 * 获取账单流水响应
 */
export type GetBillsResponse = OkxResponse<Bill[]>;

// ============== 申请账单流水（自2021年）接口 ==============

/**
 * 申请账单流水请求参数
 */
export interface ApplyBillsHistoryArchiveParams {
  /** 年份 (必填) */
  year: string;
  /** 季度 (必填) */
  quarter: Quarter | string;
}

/**
 * 申请账单流水响应数据
 */
export interface BillsHistoryArchiveResult {
  /** 结果 */
  result: string;
}

/**
 * 申请账单流水响应
 */
export type ApplyBillsHistoryArchiveResponse = OkxResponse<BillsHistoryArchiveResult[]>;

// ============== 获取账单流水（自2021年）接口 ==============

/**
 * 获取账单流水请求参数
 */
export interface GetBillsHistoryArchiveParams {
  /** 年份 (必填) */
  year: string;
  /** 季度 (必填) */
  quarter: Quarter | string;
}

/**
 * 账单流水归档信息
 */
export interface BillsHistoryArchive {
  /** 文件下载地址 */
  downloadLink: string;
  /** 进度 */
  progress: string;
  /** 状态 */
  state: string;
  /** 年份 */
  year: string;
  /** 季度 */
  quarter: string;
}

/**
 * 获取账单流水归档响应
 */
export type GetBillsHistoryArchiveResponse = OkxResponse<BillsHistoryArchive[]>;

// ============== 账户配置接口 ==============

/**
 * 账户配置信息
 */
export interface AccountConfig {
  /** 账户等级 */
  acctLv: string;
  /** 自成交防护模式 */
  acctStpMode: string;
  /** 自动借贷 */
  autoLoan: boolean;
  /** 逐仓模式 */
  ctIsoMode: string;
  /** 是否开启现货借贷 */
  enableSpotBorrow: boolean;
  /** 手续费计价方式 */
  feeType: string;
  /** greeks类型 */
  greeksType: string;
  /** IP限制 */
  ip: string;
  /** KYC等级 */
  kycLv: string;
  /** API Key备注 */
  label: string;
  /** VIP等级 */
  level: string;
  /** 临时等级 */
  levelTmp: string;
  /** 强平档位 */
  liquidationGear: string;
  /** 主账户UID */
  mainUid: string;
  /** 保证金逐仓模式 */
  mgnIsoMode: string;
  /** 操作权限 */
  opAuth: string;
  /** API Key权限 */
  perm: string;
  /** 持仓模式 */
  posMode: string;
  /** 角色类型 */
  roleType: string;
  /** 结算币种 */
  settleCcy: string;
  /** 可选结算币种列表 */
  settleCcyList: string[];
  /** 现货借贷自动还款 */
  spotBorrowAutoRepay: boolean;
  /** 现货偏移类型 */
  spotOffsetType: string;
  /** 现货角色类型 */
  spotRoleType: string;
  /** 现货跟单产品列表 */
  spotTraderInsts: string[];
  /** 策略类型 */
  stgyType: string;
  /** 跟单产品列表 */
  traderInsts: string[];
  /** 账户类型 */
  type: string;
  /** 用户ID */
  uid: string;
}

/**
 * 获取账户配置响应
 */
export type GetAccountConfigResponse = OkxResponse<AccountConfig[]>;

// ============== 设置手续费计价方式接口 ==============

/**
 * 设置手续费计价方式请求参数
 */
export interface SetFeeTypeParams {
  /** 手续费计价方式 */
  feeType: FeeType | string;
}

/**
 * 设置手续费计价方式响应数据
 */
export interface SetFeeTypeResult {
  /** 手续费计价方式 */
  feeType: string;
}

/**
 * 设置手续费计价方式响应
 */
export type SetFeeTypeResponse = OkxResponse<SetFeeTypeResult[]>;

// ============== 交易产品基础信息接口 ==============

/**
 * 交易产品信息
 */
export interface InstrumentInfo {
  /** 产品类型 */
  instType: string;
  /** 产品ID */
  instId: string;
  /** 标的指数 */
  uly: string;
  /** 交易品种 */
  instFamily: string;
  /** 基础货币 */
  baseCcy: string;
  /** 计价货币 */
  quoteCcy: string;
  /** 结算和保证金货币 */
  settleCcy: string;
  /** 合约乘数 */
  ctVal: string;
  /** 合约乘数货币 */
  ctMult: string;
  /** 合约类型 */
  ctType: string;
  /** 期权类型 */
  optType: string;
  /** 行权价 */
  stk: string;
  /** 上市时间 */
  listTime: string;
  /** 到期时间 */
  expTime: string;
  /** 杠杆倍数 */
  lever: string;
  /** 下单价格精度 */
  tickSz: string;
  /** 下单数量精度 */
  lotSz: string;
  /** 最小下单数量 */
  minSz: string;
  /** 合约面值 */
  ctValCcy: string;
  /** 别名 */
  alias: string;
  /** 产品状态 */
  state: string;
  /** 最大杠杆倍数 */
  maxLmtSz: string;
  /** 最大市价单数量 */
  maxMktSz: string;
  /** 最大限价单金额 */
  maxLmtAmt: string;
  /** 最大市价单金额 */
  maxMktAmt: string;
}

/**
 * 获取交易产品请求参数
 */
export interface GetInstrumentsParams {
  /** 产品类型 (必填) */
  instType: InstType | string;
  /** 产品ID */
  instId?: string;
  /** 标的指数 */
  uly?: string;
  /** 交易品种 */
  instFamily?: string;
}

/**
 * 获取交易产品响应
 */
export type GetInstrumentsResponse = OkxResponse<InstrumentInfo[]>;

// ============== API 端点常量 ==============

/**
 * API 端点路径
 */
export const API_ENDPOINTS = {
  /** 基础 URL */
  BASE_URL: 'https://www.okx.com',

  // 公共接口 (无需认证)
  /** 获取交易产品基础信息 */
  GET_INSTRUMENTS: '/api/v5/public/instruments',

  // 账户接口 (需要认证)
  /** 查看账户余额 */
  GET_BALANCE: '/api/v5/account/balance',
  /** 查看持仓信息 */
  GET_POSITIONS: '/api/v5/account/positions',
  /** 查看历史持仓信息 */
  GET_POSITIONS_HISTORY: '/api/v5/account/positions-history',
  /** 查看账户持仓风险 */
  GET_ACCOUNT_POSITION_RISK: '/api/v5/account/account-position-risk',
  /** 账单流水查询（近七天） */
  GET_BILLS: '/api/v5/account/bills',
  /** 账单流水查询（近三个月） */
  GET_BILLS_ARCHIVE: '/api/v5/account/bills-archive',
  /** 账单流水（自2021年）- GET获取/POST申请 */
  BILLS_HISTORY_ARCHIVE: '/api/v5/account/bills-history-archive',
  /** 查看账户配置 */
  GET_CONFIG: '/api/v5/account/config',
  /** 设置手续费计价方式 */
  SET_FEE_TYPE: '/api/v5/account/set-fee-type',
} as const;

// ============== 访问限制常量 ==============

/**
 * API 访问限制配置
 */
export const API_RATE_LIMITS = {
  /** 获取交易产品基础信息 - 20次/2秒 */
  GET_INSTRUMENTS: { limit: 20, interval: 2000 },
  /** 查看账户余额 - 10次/2秒 */
  GET_BALANCE: { limit: 10, interval: 2000 },
  /** 查看持仓信息 - 10次/2秒 */
  GET_POSITIONS: { limit: 10, interval: 2000 },
  /** 查看历史持仓信息 - 1次/10秒 */
  GET_POSITIONS_HISTORY: { limit: 1, interval: 10000 },
  /** 查看账户持仓风险 - 10次/2秒 */
  GET_ACCOUNT_POSITION_RISK: { limit: 10, interval: 2000 },
  /** 账单流水查询（近七天）- 5次/秒 */
  GET_BILLS: { limit: 5, interval: 1000 },
  /** 账单流水查询（近三个月）- 5次/2秒 */
  GET_BILLS_ARCHIVE: { limit: 5, interval: 2000 },
  /** 申请/获取账单流水（自2021年）- 1次/5秒 */
  BILLS_HISTORY_ARCHIVE: { limit: 1, interval: 5000 },
  /** 查看账户配置 - 5次/2秒 */
  GET_CONFIG: { limit: 5, interval: 2000 },
  /** 设置手续费计价方式 - 5次/2秒 */
  SET_FEE_TYPE: { limit: 5, interval: 2000 },
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
  /** 无效的API Key */
  INVALID_API_KEY: '50102',
  /** API Key权限不足 */
  NO_PERMISSION: '50110',
} as const;
