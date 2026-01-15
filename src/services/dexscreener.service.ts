/**
 * DexScreener API Service
 * 封装 DexScreener REST API 请求
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  PairsResponse,
  TokenProfilesResponse,
  TokenBoostsResponse,
  OrdersResponse,
  SearchResponse,
  GetPairsParams,
  GetTokensParams,
  GetOrdersParams,
  SearchParams,
} from '@/apis/dexscreener/types';

// API 基础 URL
const BASE_URL = 'https://api.dexscreener.com';

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加日志
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[DexScreener] 请求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[DexScreener] 请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 添加日志
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[DexScreener] 响应: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[DexScreener] 响应错误:', error.message);
    return Promise.reject(error);
  }
);

// ============== Token Profiles API ==============

/**
 * 获取最新代币配置文件
 * GET /token-profiles/latest/v1
 */
export async function getLatestTokenProfiles(): Promise<TokenProfilesResponse> {
  const response: AxiosResponse<TokenProfilesResponse> = await apiClient.get(
    '/token-profiles/latest/v1'
  );
  return response.data;
}

// ============== Token Boosts API ==============

/**
 * 获取最新代币加速
 * GET /token-boosts/latest/v1
 */
export async function getLatestTokenBoosts(): Promise<TokenBoostsResponse> {
  const response: AxiosResponse<TokenBoostsResponse> = await apiClient.get(
    '/token-boosts/latest/v1'
  );
  return response.data;
}

/**
 * 获取热门代币加速
 * GET /token-boosts/top/v1
 */
export async function getTopTokenBoosts(): Promise<TokenBoostsResponse> {
  const response: AxiosResponse<TokenBoostsResponse> = await apiClient.get('/token-boosts/top/v1');
  return response.data;
}

// ============== Orders API ==============

/**
 * 获取代币订单状态
 * GET /orders/v1/{chainId}/{tokenAddress}
 */
export async function getOrders(params: GetOrdersParams): Promise<OrdersResponse> {
  const { chainId, tokenAddress } = params;
  const response: AxiosResponse<OrdersResponse> = await apiClient.get(
    `/orders/v1/${chainId}/${tokenAddress}`
  );
  return response.data;
}

// ============== DEX Pairs API ==============

/**
 * 根据交易对地址获取交易对
 * GET /latest/dex/pairs/{chainId}/{pairAddresses}
 *
 * @param params.chainId - 链 ID
 * @param params.pairAddresses - 交易对地址 (支持逗号分隔，最多30个)
 */
export async function getPairsByAddress(params: GetPairsParams): Promise<PairsResponse> {
  const { chainId, pairAddresses } = params;

  const response: AxiosResponse<PairsResponse> = await apiClient.get(
    `/latest/dex/pairs/${chainId}/${pairAddresses}`
  );
  return response.data;
}

/**
 * 根据代币地址获取交易对
 * GET /latest/dex/tokens/{tokenAddresses}
 *
 * @param params.tokenAddresses - 代币地址 (支持逗号分隔，最多30个)
 */
export async function getPairsByTokenAddress(params: GetTokensParams): Promise<PairsResponse> {
  const { tokenAddresses } = params;

  const response: AxiosResponse<PairsResponse> = await apiClient.get(
    `/latest/dex/tokens/${tokenAddresses}`
  );
  return response.data;
}

/**
 * 搜索交易对
 * GET /latest/dex/search?q={query}
 *
 * @param params.q - 搜索关键词 (代币名称、符号或地址)
 */
export async function searchPairs(params: SearchParams): Promise<SearchResponse> {
  const { q } = params;
  const response: AxiosResponse<SearchResponse> = await apiClient.get('/latest/dex/search', {
    params: { q },
  });
  return response.data;
}

// ============== 导出所有函数 ==============

export default {
  // Token Profiles
  getLatestTokenProfiles,

  // Token Boosts
  getLatestTokenBoosts,
  getTopTokenBoosts,

  // Orders
  getOrders,

  // DEX Pairs
  getPairsByAddress,
  getPairsByTokenAddress,
  searchPairs,
};
