/**
 * 币安现货 API 类型定义和枚举
 */

// ==================== 枚举定义 ====================

/**
 * 交易对状态
 */
export enum SymbolStatus {
  TRADING = 'TRADING',
  END_OF_DAY = 'END_OF_DAY',
  HALT = 'HALT',
  BREAK = 'BREAK',
}

/**
 * 订单状态
 */
export enum OrderStatus {
  NEW = 'NEW',
  PENDING_NEW = 'PENDING_NEW',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  FILLED = 'FILLED',
  CANCELED = 'CANCELED',
  PENDING_CANCEL = 'PENDING_CANCEL',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  EXPIRED_IN_MATCH = 'EXPIRED_IN_MATCH',
}

/**
 * 订单类型
 */
export enum OrderType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
  STOP_LOSS = 'STOP_LOSS',
  STOP_LOSS_LIMIT = 'STOP_LOSS_LIMIT',
  TAKE_PROFIT = 'TAKE_PROFIT',
  TAKE_PROFIT_LIMIT = 'TAKE_PROFIT_LIMIT',
  LIMIT_MAKER = 'LIMIT_MAKER',
}

/**
 * 订单方向
 */
export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

/**
 * 有效期类型
 */
export enum TimeInForce {
  GTC = 'GTC', // Good Til Canceled - 成交为止
  IOC = 'IOC', // Immediate Or Cancel - 立即成交或取消
  FOK = 'FOK', // Fill or Kill - 全部成交或取消
}

/**
 * K线间隔
 */
export enum KlineInterval {
  SECOND_1 = '1s',
  MINUTE_1 = '1m',
  MINUTE_3 = '3m',
  MINUTE_5 = '5m',
  MINUTE_15 = '15m',
  MINUTE_30 = '30m',
  HOUR_1 = '1h',
  HOUR_2 = '2h',
  HOUR_4 = '4h',
  HOUR_6 = '6h',
  HOUR_8 = '8h',
  HOUR_12 = '12h',
  DAY_1 = '1d',
  DAY_3 = '3d',
  WEEK_1 = '1w',
  MONTH_1 = '1M',
}

/**
 * 响应类型
 */
export enum NewOrderRespType {
  ACK = 'ACK',
  RESULT = 'RESULT',
  FULL = 'FULL',
}

/**
 * 限制类型
 */
export enum RateLimitType {
  REQUEST_WEIGHT = 'REQUEST_WEIGHT',
  ORDERS = 'ORDERS',
  RAW_REQUESTS = 'RAW_REQUESTS',
}

/**
 * 限制间隔
 */
export enum RateLimitInterval {
  SECOND = 'SECOND',
  MINUTE = 'MINUTE',
  DAY = 'DAY',
}

/**
 * 鉴权类型
 */
export enum SecurityType {
  NONE = 'NONE',
  TRADE = 'TRADE',
  USER_DATA = 'USER_DATA',
  USER_STREAM = 'USER_STREAM',
}

/**
 * Ticker 类型
 */
export enum TickerType {
  FULL = 'FULL',
  MINI = 'MINI',
}

/**
 * 自我交易预防模式
 */
export enum STPMode {
  NONE = 'NONE',
  EXPIRE_MAKER = 'EXPIRE_MAKER',
  EXPIRE_TAKER = 'EXPIRE_TAKER',
  EXPIRE_BOTH = 'EXPIRE_BOTH',
  DECREMENT = 'DECREMENT',
  TRANSFER = 'TRANSFER',
}

// ==================== 通用接口类型 ====================

/**
 * 服务器时间响应
 */
export interface ServerTimeResponse {
  serverTime: number;
}

/**
 * 交易规则限制
 */
export interface RateLimit {
  rateLimitType: RateLimitType;
  interval: RateLimitInterval;
  intervalNum: number;
  limit: number;
}

/**
 * 交易对过滤器基类
 */
export interface SymbolFilter {
  filterType: string;
}

/**
 * 价格过滤器
 */
export interface PriceFilter extends SymbolFilter {
  filterType: 'PRICE_FILTER';
  minPrice: string;
  maxPrice: string;
  tickSize: string;
}

/**
 * 数量过滤器
 */
export interface LotSizeFilter extends SymbolFilter {
  filterType: 'LOT_SIZE';
  minQty: string;
  maxQty: string;
  stepSize: string;
}

/**
 * 最小名义价值过滤器
 */
export interface MinNotionalFilter extends SymbolFilter {
  filterType: 'MIN_NOTIONAL';
  minNotional: string;
  applyToMarket: boolean;
  avgPriceMins: number;
}

/**
 * 交易对信息
 */
export interface SymbolInfo {
  symbol: string;
  status: SymbolStatus;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quotePrecision: number;
  quoteAssetPrecision: number;
  orderTypes: OrderType[];
  icebergAllowed: boolean;
  ocoAllowed: boolean;
  quoteOrderQtyMarketAllowed: boolean;
  allowTrailingStop: boolean;
  cancelReplaceAllowed: boolean;
  isSpotTradingAllowed: boolean;
  isMarginTradingAllowed: boolean;
  filters: SymbolFilter[];
  permissions: string[];
  defaultSelfTradePreventionMode: STPMode;
  allowedSelfTradePreventionModes: STPMode[];
}

/**
 * 交易所信息响应
 */
export interface ExchangeInfoResponse {
  timezone: string;
  serverTime: number;
  rateLimits: RateLimit[];
  exchangeFilters: SymbolFilter[];
  symbols: SymbolInfo[];
}

// ==================== 行情接口类型 ====================

/**
 * 深度信息请求参数
 */
export interface DepthParams {
  symbol: string;
  limit?: number; // 默认100, 可选: 5, 10, 20, 50, 100, 500, 1000, 5000
}

/**
 * 深度信息响应
 */
export interface DepthResponse {
  lastUpdateId: number;
  bids: [string, string][]; // [价格, 数量]
  asks: [string, string][]; // [价格, 数量]
}

/**
 * 近期成交参数
 */
export interface TradesParams {
  symbol: string;
  limit?: number; // 默认500, 最大1000
}

/**
 * 成交记录
 */
export interface Trade {
  id: number;
  price: string;
  qty: string;
  quoteQty: string;
  time: number;
  isBuyerMaker: boolean;
  isBestMatch: boolean;
}

/**
 * 历史成交参数
 */
export interface HistoricalTradesParams {
  symbol: string;
  limit?: number;
  fromId?: number;
}

/**
 * 聚合交易参数
 */
export interface AggTradesParams {
  symbol: string;
  fromId?: number;
  startTime?: number;
  endTime?: number;
  limit?: number; // 默认500, 最大1000
}

/**
 * 聚合交易记录
 */
export interface AggTrade {
  a: number; // 聚合交易ID
  p: string; // 价格
  q: string; // 数量
  f: number; // 第一个成交ID
  l: number; // 最后一个成交ID
  T: number; // 时间戳
  m: boolean; // 买方是否为maker
  M: boolean; // 是否为最优匹配
}

/**
 * K线参数
 */
export interface KlinesParams {
  symbol: string;
  interval: KlineInterval | string;
  startTime?: number;
  endTime?: number;
  timeZone?: string;
  limit?: number; // 默认500, 最大1000
}

/**
 * K线数据 [开盘时间, 开盘价, 最高价, 最低价, 收盘价, 成交量, 收盘时间, 成交额, 成交笔数, 主动买入成交量, 主动买入成交额, 忽略]
 */
export type Kline = [
  number, // 开盘时间
  string, // 开盘价
  string, // 最高价
  string, // 最低价
  string, // 收盘价
  string, // 成交量
  number, // 收盘时间
  string, // 成交额
  number, // 成交笔数
  string, // 主动买入成交量
  string, // 主动买入成交额
  string, // 忽略
];

/**
 * 平均价格参数
 */
export interface AvgPriceParams {
  symbol: string;
}

/**
 * 平均价格响应
 */
export interface AvgPriceResponse {
  mins: number;
  price: string;
  closeTime: number;
}

/**
 * 24小时Ticker参数
 */
export interface Ticker24hrParams {
  symbol?: string;
  symbols?: string[];
  type?: TickerType;
  symbolStatus?: SymbolStatus;
}

/**
 * 24小时Ticker完整响应
 */
export interface Ticker24hrFull {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

/**
 * 24小时Ticker迷你响应
 */
export interface Ticker24hrMini {
  symbol: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  lastPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

/**
 * 交易日Ticker参数
 */
export interface TradingDayTickerParams {
  symbol?: string;
  symbols?: string[];
  timeZone?: string;
  type?: TickerType;
}

/**
 * 最新价格参数
 */
export interface PriceTickerParams {
  symbol?: string;
  symbols?: string[];
}

/**
 * 最新价格响应
 */
export interface PriceTicker {
  symbol: string;
  price: string;
}

/**
 * 最优挂单参数
 */
export interface BookTickerParams {
  symbol?: string;
  symbols?: string[];
}

/**
 * 最优挂单响应
 */
export interface BookTicker {
  symbol: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
}

/**
 * 滚动窗口Ticker参数
 */
export interface RollingTickerParams {
  symbol?: string;
  symbols?: string[];
  windowSize?: string; // 1m-59m, 1h-23h, 1d-7d
  type?: TickerType;
}

// ==================== 交易接口类型 ====================

/**
 * 下单参数
 */
export interface NewOrderParams {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  timeInForce?: TimeInForce;
  quantity?: string;
  quoteOrderQty?: string;
  price?: string;
  newClientOrderId?: string;
  strategyId?: number;
  strategyType?: number;
  stopPrice?: string;
  trailingDelta?: number;
  icebergQty?: string;
  newOrderRespType?: NewOrderRespType;
  selfTradePreventionMode?: STPMode;
  recvWindow?: number;
  timestamp: number;
}

/**
 * 下单响应 - ACK
 */
export interface NewOrderResponseAck {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  transactTime: number;
}

/**
 * 下单响应 - RESULT
 */
export interface NewOrderResponseResult extends NewOrderResponseAck {
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: OrderStatus;
  timeInForce: TimeInForce;
  type: OrderType;
  side: OrderSide;
  workingTime: number;
  selfTradePreventionMode: STPMode;
}

/**
 * 订单成交
 */
export interface OrderFill {
  price: string;
  qty: string;
  commission: string;
  commissionAsset: string;
  tradeId: number;
}

/**
 * 下单响应 - FULL
 */
export interface NewOrderResponseFull extends NewOrderResponseResult {
  fills: OrderFill[];
}

/**
 * 撤单参数
 */
export interface CancelOrderParams {
  symbol: string;
  orderId?: number;
  origClientOrderId?: string;
  newClientOrderId?: string;
  cancelRestrictions?: string;
  recvWindow?: number;
  timestamp: number;
}

/**
 * 撤单响应
 */
export interface CancelOrderResponse {
  symbol: string;
  origClientOrderId: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  transactTime: number;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: OrderStatus;
  timeInForce: TimeInForce;
  type: OrderType;
  side: OrderSide;
  selfTradePreventionMode: STPMode;
}

/**
 * 查询订单参数
 */
export interface QueryOrderParams {
  symbol: string;
  orderId?: number;
  origClientOrderId?: string;
  recvWindow?: number;
  timestamp: number;
}

/**
 * 订单信息
 */
export interface Order {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: OrderStatus;
  timeInForce: TimeInForce;
  type: OrderType;
  side: OrderSide;
  stopPrice: string;
  icebergQty: string;
  time: number;
  updateTime: number;
  isWorking: boolean;
  workingTime: number;
  origQuoteOrderQty: string;
  selfTradePreventionMode: STPMode;
}

/**
 * 当前挂单参数
 */
export interface OpenOrdersParams {
  symbol?: string;
  recvWindow?: number;
  timestamp: number;
}

/**
 * 所有订单参数
 */
export interface AllOrdersParams {
  symbol: string;
  orderId?: number;
  startTime?: number;
  endTime?: number;
  limit?: number;
  recvWindow?: number;
  timestamp: number;
}

// ==================== 账户接口类型 ====================

/**
 * 账户信息参数
 */
export interface AccountParams {
  recvWindow?: number;
  timestamp: number;
}

/**
 * 资产余额
 */
export interface Balance {
  asset: string;
  free: string;
  locked: string;
}

/**
 * 账户信息响应
 */
export interface AccountResponse {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  commissionRates: {
    maker: string;
    taker: string;
    buyer: string;
    seller: string;
  };
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  brokered: boolean;
  requireSelfTradePrevention: boolean;
  preventSor: boolean;
  updateTime: number;
  accountType: string;
  balances: Balance[];
  permissions: string[];
  uid: number;
}

/**
 * 成交历史参数
 */
export interface MyTradesParams {
  symbol: string;
  orderId?: number;
  startTime?: number;
  endTime?: number;
  fromId?: number;
  limit?: number;
  recvWindow?: number;
  timestamp: number;
}

/**
 * 成交记录
 */
export interface MyTrade {
  symbol: string;
  id: number;
  orderId: number;
  orderListId: number;
  price: string;
  qty: string;
  quoteQty: string;
  commission: string;
  commissionAsset: string;
  time: number;
  isBuyer: boolean;
  isMaker: boolean;
  isBestMatch: boolean;
}

// ==================== 用户数据流类型 ====================

/**
 * Listen Key 响应
 */
export interface ListenKeyResponse {
  listenKey: string;
}

// ==================== API 响应包装 ====================

/**
 * API 通用响应
 */
export interface BinanceApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: number;
    msg: string;
  };
}

/**
 * API 错误响应
 */
export interface BinanceApiError {
  code: number;
  msg: string;
}
