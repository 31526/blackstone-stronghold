/**
 * 币安账户 API 接口
 * 包含所有账户相关的 REST API 调用
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  getTimestamp,
  signRequest,
  getAuthHeaders,
  isApiKeyConfigured,
} from './auth';
import type {
  AccountResponse,
  Order,
  MyTrade,
  BinanceApiResponse,
} from './types';

// 导入新增的账户类型
import type {
  QueryOrderParams,
  OpenOrdersParams,
  AllOrdersParams,
  MyTradesParams,
  RateLimitOrderResponse,
  PreventedMatchesParams,
  PreventedMatch,
  AllocationsParams,
  Allocation,
  CommissionRatesParams,
  CommissionRatesResponse,
  OrderAmendmentsParams,
  OrderAmendment,
  MyFiltersParams,
  MyFiltersResponse,
} from './account.types';

// API 基础 URL
const BASE_URL = 'https://api.binance.com';

// 创建 axios 实例
const createClient = (baseURL: string = BASE_URL): AxiosInstance => {
  return axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

// 默认客户端
const client = createClient();

/**
 * 通用 API 请求函数
 */
async function request<T>(config: AxiosRequestConfig): Promise<BinanceApiResponse<T>> {
  try {
    const response = await client.request<T>(config);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        error: {
          code: error.response.data?.code || error.response.status,
          msg: error.response.data?.msg || error.message,
        },
      };
    }
    return {
      success: false,
      error: {
        code: -1,
        msg: error instanceof Error ? error.message : '未知错误',
      },
    };
  }
}

// ==================== 账户信息接口 ====================

/**
 * 获取账户信息
 * GET /api/v3/account
 * 权重: 20
 */
export async function getAccount(params?: {
  omitZeroBalances?: boolean;
  recvWindow?: number;
}): Promise<BinanceApiResponse<AccountResponse>> {
  if (!isApiKeyConfigured()) {
    return {
      success: false,
      error: { code: -1, msg: '未配置 API 密钥' },
    };
  }

  const signedParams = signRequest({
    ...params,
    timestamp: getTimestamp(),
  });

  return request<AccountResponse>({
    method: 'GET',
    url: '/api/v3/account',
    params: signedParams,
    headers: getAuthHeaders(),
  });
}

/**
 * 查询订单
 * GET /api/v3/order
 * 权重: 4
 */
export async function getOrder(
  params: Omit<QueryOrderParams, 'timestamp'>
): Promise<BinanceApiResponse<Order>> {
  if (!isApiKeyConfigured()) {
    return {
      success: false,
      error: { code: -1, msg: '未配置 API 密钥' },
    };
  }

  const signedParams = signRequest({
    ...params,
    timestamp: getTimestamp(),
  });

  return request<Order>({
    method: 'GET',
    url: '/api/v3/order',
    params: signedParams,
    headers: getAuthHeaders(),
  });
}

/**
 * 获取当前挂单
 * GET /api/v3/openOrders
 * 权重: 单个交易对 6，不传 symbol 80
 */
export async function getOpenOrders(
  params?: Omit<OpenOrdersParams, 'timestamp'>
): Promise<BinanceApiResponse<Order[]>> {
  if (!isApiKeyConfigured()) {
    return {
      success: false,
      error: { code: -1, msg: '未配置 API 密钥' },
    };
  }

  const signedParams = signRequest({
    ...params,
    timestamp: getTimestamp(),
  });

  return request<Order[]>({
    method: 'GET',
    url: '/api/v3/openOrders',
    params: signedParams,
    headers: getAuthHeaders(),
  });
}

/**
 * 获取所有订单
 * GET /api/v3/allOrders
 * 权重: 20
 */
export async function getAllOrders(
  params: Omit<AllOrdersParams, 'timestamp'>
): Promise<BinanceApiResponse<Order[]>> {
  if (!isApiKeyConfigured()) {
    return {
      success: false,
      error: { code: -1, msg: '未配置 API 密钥' },
    };
  }

  const signedParams = signRequest({
    ...params,
    timestamp: getTimestamp(),
  });

  return request<Order[]>({
    method: 'GET',
    url: '/api/v3/allOrders',
    params: signedParams,
    headers: getAuthHeaders(),
  });
}

/**
 * 获取成交历史
 * GET /api/v3/myTrades
 * 权重: 不带 orderId 20，带 orderId 5
 */
export async function getMyTrades(
  params: Omit<MyTradesParams, 'timestamp'>
): Promise<BinanceApiResponse<MyTrade[]>> {
  if (!isApiKeyConfigured()) {
    return {
      success: false,
      error: { code: -1, msg: '未配置 API 密钥' },
    };
  }

  const signedParams = signRequest({
    ...params,
    timestamp: getTimestamp(),
  });

  return request<MyTrade[]>({
    method: 'GET',
    url: '/api/v3/myTrades',
    params: signedParams,
    headers: getAuthHeaders(),
  });
}

/**
 * 查询未成交订单数
 * GET /api/v3/rateLimit/order
 * 权重: 40
 */
export async function getRateLimitOrder(params?: {
  recvWindow?: number;
}): Promise<BinanceApiResponse<RateLimitOrderResponse[]>> {
  if (!isApiKeyConfigured()) {
    return {
      success: false,
      error: { code: -1, msg: '未配置 API 密钥' },
    };
  }

  const signedParams = signRequest({
    ...params,
    timestamp: getTimestamp(),
  });

  return request<RateLimitOrderResponse[]>({
    method: 'GET',
    url: '/api/v3/rateLimit/order',
    params: signedParams,
    headers: getAuthHeaders(),
  });
}

/**
 * 查询被阻止的匹配
 * GET /api/v3/myPreventedMatches
 * 权重: 按 preventedMatchId 查询 2，其他 20
 */
export async function getPreventedMatches(
  params: Omit<PreventedMatchesParams, 'timestamp'>
): Promise<BinanceApiResponse<PreventedMatch[]>> {
  if (!isApiKeyConfigured()) {
    return {
      success: false,
      error: { code: -1, msg: '未配置 API 密钥' },
    };
  }

  const signedParams = signRequest({
    ...params,
    timestamp: getTimestamp(),
  });

  return request<PreventedMatch[]>({
    method: 'GET',
    url: '/api/v3/myPreventedMatches',
    params: signedParams,
    headers: getAuthHeaders(),
  });
}

/**
 * 查询分配
 * GET /api/v3/myAllocations
 * 权重: 20
 */
export async function getAllocations(
  params: Omit<AllocationsParams, 'timestamp'>
): Promise<BinanceApiResponse<Allocation[]>> {
  if (!isApiKeyConfigured()) {
    return {
      success: false,
      error: { code: -1, msg: '未配置 API 密钥' },
    };
  }

  const signedParams = signRequest({
    ...params,
    timestamp: getTimestamp(),
  });

  return request<Allocation[]>({
    method: 'GET',
    url: '/api/v3/myAllocations',
    params: signedParams,
    headers: getAuthHeaders(),
  });
}

/**
 * 查询佣金费率
 * GET /api/v3/account/commission
 * 权重: 20
 */
export async function getCommissionRates(
  params: CommissionRatesParams
): Promise<BinanceApiResponse<CommissionRatesResponse>> {
  if (!isApiKeyConfigured()) {
    return {
      success: false,
      error: { code: -1, msg: '未配置 API 密钥' },
    };
  }

  const signedParams = signRequest({
    ...params,
    timestamp: getTimestamp(),
  });

  return request<CommissionRatesResponse>({
    method: 'GET',
    url: '/api/v3/account/commission',
    params: signedParams,
    headers: getAuthHeaders(),
  });
}

/**
 * 查询订单修改记录
 * GET /api/v3/order/amendments
 * 权重: 4
 */
export async function getOrderAmendments(
  params: Omit<OrderAmendmentsParams, 'timestamp'>
): Promise<BinanceApiResponse<OrderAmendment[]>> {
  if (!isApiKeyConfigured()) {
    return {
      success: false,
      error: { code: -1, msg: '未配置 API 密钥' },
    };
  }

  const signedParams = signRequest({
    ...params,
    timestamp: getTimestamp(),
  });

  return request<OrderAmendment[]>({
    method: 'GET',
    url: '/api/v3/order/amendments',
    params: signedParams,
    headers: getAuthHeaders(),
  });
}

/**
 * 查询相关过滤器
 * GET /api/v3/myFilters
 * 权重: 40
 */
export async function getMyFilters(
  params: Omit<MyFiltersParams, 'timestamp'>
): Promise<BinanceApiResponse<MyFiltersResponse>> {
  if (!isApiKeyConfigured()) {
    return {
      success: false,
      error: { code: -1, msg: '未配置 API 密钥' },
    };
  }

  const signedParams = signRequest({
    ...params,
    timestamp: getTimestamp(),
  });

  return request<MyFiltersResponse>({
    method: 'GET',
    url: '/api/v3/myFilters',
    params: signedParams,
    headers: getAuthHeaders(),
  });
}

// 导出所有类型
export * from './account.types';
