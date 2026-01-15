/**
 * Bitget Spot Market API Service
 * 封装 Bitget 现货行情 REST API 请求
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  API_ENDPOINTS,
  GetCoinsResponse,
  GetSymbolsParams,
  GetSymbolsResponse,
  GetTickersParams,
  GetTickersResponse,
  GetRecentTradesParams,
  GetRecentTradesResponse,
  GetMarketTradesParams,
  GetMarketTradesResponse,
} from '@/apis/bitget/spot';

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加日志
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[Bitget] 请求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[Bitget] 请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 添加日志
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[Bitget] 响应: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[Bitget] 响应错误:', error.message);
    return Promise.reject(error);
  }
);

// ============== Public API - 公共接口 ==============

/**
 * 获取币种列表
 * GET /api/v2/spot/public/coins
 *
 * 访问限制: 20次/秒
 */
export async function getCoins(): Promise<GetCoinsResponse> {
  const response: AxiosResponse<GetCoinsResponse> = await apiClient.get(
    API_ENDPOINTS.GET_COINS
  );
  return response.data;
}

/**
 * 获取交易对列表
 * GET /api/v2/spot/public/symbols
 *
 * 访问限制: 20次/秒
 * @param params.symbol - 交易对名称 (可选，不传则返回所有)
 */
export async function getSymbols(params?: GetSymbolsParams): Promise<GetSymbolsResponse> {
  const response: AxiosResponse<GetSymbolsResponse> = await apiClient.get(
    API_ENDPOINTS.GET_SYMBOLS,
    { params }
  );
  return response.data;
}

// ============== Market API - 行情接口 ==============

/**
 * 获取行情数据
 * GET /api/v2/spot/market/tickers
 *
 * 访问限制: 20次/秒
 * @param params.symbol - 交易对名称 (可选，不传则返回所有)
 */
export async function getTickers(params?: GetTickersParams): Promise<GetTickersResponse> {
  const response: AxiosResponse<GetTickersResponse> = await apiClient.get(
    API_ENDPOINTS.GET_TICKERS,
    { params }
  );
  return response.data;
}

/**
 * 获取最近成交记录
 * GET /api/v2/spot/market/fills
 *
 * 访问限制: 10次/秒
 * @param params.symbol - 交易对名称 (必填)
 * @param params.limit - 返回数量，默认 100，最大 500
 */
export async function getRecentTrades(params: GetRecentTradesParams): Promise<GetRecentTradesResponse> {
  const response: AxiosResponse<GetRecentTradesResponse> = await apiClient.get(
    API_ENDPOINTS.GET_RECENT_TRADES,
    { params }
  );
  return response.data;
}

/**
 * 获取历史成交记录
 * GET /api/v2/spot/market/fills-history
 *
 * 访问限制: 10次/秒
 * @param params.symbol - 交易对名称 (必填)
 * @param params.limit - 返回数量，默认 100，最大 500
 * @param params.endTime - 结束时间戳(毫秒)
 */
export async function getMarketTrades(params: GetMarketTradesParams): Promise<GetMarketTradesResponse> {
  const response: AxiosResponse<GetMarketTradesResponse> = await apiClient.get(
    API_ENDPOINTS.GET_MARKET_TRADES,
    { params }
  );
  return response.data;
}

// ============== 导出所有函数 ==============

export default {
  // Public API
  getCoins,
  getSymbols,

  // Market API
  getTickers,
  getRecentTrades,
  getMarketTrades,
};
