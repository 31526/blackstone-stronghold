/**
 * 币安账户 API 类型定义
 */

import type { RateLimitType, RateLimitInterval } from './types';

// ==================== 查询订单参数 ====================

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

// ==================== 成交历史参数 ====================

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

// ==================== 未成交订单数 ====================

/**
 * 未成交订单数响应
 */
export interface RateLimitOrderResponse {
  rateLimitType: RateLimitType | string;
  interval: RateLimitInterval | string;
  intervalNum: number;
  limit: number;
  count: number;
}

// ==================== 被阻止的匹配 ====================

/**
 * 被阻止的匹配参数
 */
export interface PreventedMatchesParams {
  symbol: string;
  preventedMatchId?: number;
  orderId?: number;
  fromPreventedMatchId?: number;
  limit?: number;
  recvWindow?: number;
  timestamp: number;
}

/**
 * 被阻止的匹配记录
 */
export interface PreventedMatch {
  symbol: string;
  preventedMatchId: number;
  takerOrderId: number;
  makerOrderId: number;
  tradeGroupId: number;
  selfTradePreventionMode: string;
  price: string;
  makerPreventedQuantity: string;
  transactTime: number;
}

// ==================== 分配查询 ====================

/**
 * 分配查询参数
 */
export interface AllocationsParams {
  symbol: string;
  startTime?: number;
  endTime?: number;
  fromAllocationId?: number;
  limit?: number;
  orderId?: number;
  recvWindow?: number;
  timestamp: number;
}

/**
 * 分配记录
 */
export interface Allocation {
  symbol: string;
  allocationId: number;
  allocationType: string;
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
  isAllocator: boolean;
}

// ==================== 佣金费率 ====================

/**
 * 佣金费率参数
 */
export interface CommissionRatesParams {
  symbol: string;
}

/**
 * 佣金费率详情
 */
export interface CommissionRate {
  maker: string;
  taker: string;
  buyer: string;
  seller: string;
}

/**
 * 佣金折扣信息
 */
export interface CommissionDiscount {
  enabledForAccount: boolean;
  enabledForSymbol: boolean;
  discountAsset: string;
  discount: string;
}

/**
 * 佣金费率响应
 */
export interface CommissionRatesResponse {
  symbol: string;
  standardCommission: CommissionRate;
  specialCommission?: CommissionRate;
  taxCommission: CommissionRate;
  discount: CommissionDiscount;
}

// ==================== 订单修改记录 ====================

/**
 * 订单修改记录参数
 */
export interface OrderAmendmentsParams {
  symbol: string;
  orderId: number;
  fromExecutionId?: number;
  limit?: number;
  recvWindow?: number;
  timestamp: number;
}

/**
 * 订单修改记录
 */
export interface OrderAmendment {
  symbol: string;
  orderId: number;
  executionId: number;
  origClientOrderId: string;
  newClientOrderId: string;
  origQty: string;
  newQty: string;
  time: number;
}

// ==================== 相关过滤器 ====================

/**
 * 相关过滤器参数
 */
export interface MyFiltersParams {
  symbol: string;
  recvWindow?: number;
  timestamp: number;
}

/**
 * 交易所过滤器
 */
export interface ExchangeFilter {
  filterType: string;
  maxNumOrders?: number;
  maxNumAlgoOrders?: number;
  [key: string]: unknown;
}

/**
 * 交易对过滤器
 */
export interface SymbolFilterItem {
  filterType: string;
  maxNumOrderLists?: number;
  maxNumOrders?: number;
  [key: string]: unknown;
}

/**
 * 资产过滤器
 */
export interface AssetFilter {
  filterType: string;
  asset: string;
  limit: string;
}

/**
 * 相关过滤器响应
 */
export interface MyFiltersResponse {
  exchangeFilters: ExchangeFilter[];
  symbolFilters: SymbolFilterItem[];
  assetFilters: AssetFilter[];
}
