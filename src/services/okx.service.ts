/**
 * OKX Spot Market API Service
 * 封装 OKX 现货行情 REST API 请求
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  API_ENDPOINTS,
  GetInstrumentsParams,
  GetInstrumentsResponse,
  GetTickersParams,
  GetTickersResponse,
  GetTickerParams,
  GetTickerResponse,
} from '@/apis/okx/spot';

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
    console.log(`[OKX] 请求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[OKX] 请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 添加日志
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[OKX] 响应: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[OKX] 响应错误:', error.message);
    return Promise.reject(error);
  }
);

// ============== Public Data API - 公共数据接口 ==============

/**
 * 获取交易产品信息
 * GET /api/v5/public/instruments
 *
 * 访问限制: 20次/2秒
 * @param params.instType - 产品类型 (必填)
 * @param params.instId - 产品ID (可选)
 * @param params.uly - 标的指数 (可选)
 * @param params.instFamily - 交易品种 (可选)
 */
export async function getInstruments(params: GetInstrumentsParams): Promise<GetInstrumentsResponse> {
  const response: AxiosResponse<GetInstrumentsResponse> = await apiClient.get(
    API_ENDPOINTS.GET_INSTRUMENTS,
    { params }
  );
  return response.data;
}

// ============== Market Data API - 行情数据接口 ==============

/**
 * 获取所有产品行情信息
 * GET /api/v5/market/tickers
 *
 * 访问限制: 20次/2秒
 * @param params.instType - 产品类型 (必填)
 * @param params.uly - 标的指数 (可选)
 * @param params.instFamily - 交易品种 (可选)
 */
export async function getTickers(params: GetTickersParams): Promise<GetTickersResponse> {
  const response: AxiosResponse<GetTickersResponse> = await apiClient.get(
    API_ENDPOINTS.GET_TICKERS,
    { params }
  );
  return response.data;
}

/**
 * 获取单个产品行情信息
 * GET /api/v5/market/ticker
 *
 * 访问限制: 20次/2秒
 * @param params.instId - 产品ID (必填)
 */
export async function getTicker(params: GetTickerParams): Promise<GetTickerResponse> {
  const response: AxiosResponse<GetTickerResponse> = await apiClient.get(
    API_ENDPOINTS.GET_TICKER,
    { params }
  );
  return response.data;
}

// ============== 导出所有函数 ==============

export default {
  // Public Data API
  getInstruments,

  // Market Data API
  getTickers,
  getTicker,
};
