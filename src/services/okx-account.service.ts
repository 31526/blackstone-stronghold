/**
 * OKX Account API Service
 * 封装 OKX 账户 REST API 请求
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getAuthHeaders, buildQueryString } from '@/apis/okx/auth';
import {
  API_ENDPOINTS,
  GetBalanceParams,
  GetBalanceResponse,
  GetPositionsParams,
  GetPositionsResponse,
  GetPositionsHistoryParams,
  GetPositionsHistoryResponse,
  GetAccountPositionRiskParams,
  GetAccountPositionRiskResponse,
  GetBillsParams,
  GetBillsResponse,
  ApplyBillsHistoryArchiveParams,
  ApplyBillsHistoryArchiveResponse,
  GetBillsHistoryArchiveParams,
  GetBillsHistoryArchiveResponse,
  GetAccountConfigResponse,
  SetFeeTypeParams,
  SetFeeTypeResponse,
  GetInstrumentsParams,
  GetInstrumentsResponse,
} from '@/apis/okx/account';

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  timeout: 30000,
});

// 请求拦截器 - 添加日志
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[OKX Account] 请求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[OKX Account] 请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 添加日志
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[OKX Account] 响应: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[OKX Account] 响应错误:', error.message);
    return Promise.reject(error);
  }
);

// ============== Public API - 公共接口 (无需认证) ==============

/**
 * 获取交易产品基础信息
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
    {
      params,
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return response.data;
}

// ============== Private API - 账户接口 (需要认证) ==============

/**
 * 查看账户余额
 * GET /api/v5/account/balance
 *
 * 访问限制: 10次/2秒
 * @param params.ccy - 币种，支持多币种查询（不超过20个），币种之间半角逗号分隔
 */
export async function getBalance(params?: GetBalanceParams): Promise<GetBalanceResponse> {
  const queryString = params ? buildQueryString(params as Record<string, unknown>) : '';
  const requestPath = API_ENDPOINTS.GET_BALANCE + queryString;
  const headers = getAuthHeaders('GET', requestPath);

  const response: AxiosResponse<GetBalanceResponse> = await apiClient.get(requestPath, { headers });
  return response.data;
}

/**
 * 查看持仓信息
 * GET /api/v5/account/positions
 *
 * 访问限制: 10次/2秒
 * @param params.instType - 产品类型
 * @param params.instId - 产品ID
 * @param params.posId - 持仓ID
 */
export async function getPositions(params?: GetPositionsParams): Promise<GetPositionsResponse> {
  const queryString = params ? buildQueryString(params as Record<string, unknown>) : '';
  const requestPath = API_ENDPOINTS.GET_POSITIONS + queryString;
  const headers = getAuthHeaders('GET', requestPath);

  const response: AxiosResponse<GetPositionsResponse> = await apiClient.get(requestPath, { headers });
  return response.data;
}

/**
 * 查看历史持仓信息
 * GET /api/v5/account/positions-history
 *
 * 访问限制: 1次/10秒
 * @param params - 查询参数
 */
export async function getPositionsHistory(
  params?: GetPositionsHistoryParams
): Promise<GetPositionsHistoryResponse> {
  const queryString = params ? buildQueryString(params as Record<string, unknown>) : '';
  const requestPath = API_ENDPOINTS.GET_POSITIONS_HISTORY + queryString;
  const headers = getAuthHeaders('GET', requestPath);

  const response: AxiosResponse<GetPositionsHistoryResponse> = await apiClient.get(requestPath, {
    headers,
  });
  return response.data;
}

/**
 * 查看账户持仓风险
 * GET /api/v5/account/account-position-risk
 *
 * 访问限制: 10次/2秒
 * @param params.instType - 产品类型
 */
export async function getAccountPositionRisk(
  params?: GetAccountPositionRiskParams
): Promise<GetAccountPositionRiskResponse> {
  const queryString = params ? buildQueryString(params as Record<string, unknown>) : '';
  const requestPath = API_ENDPOINTS.GET_ACCOUNT_POSITION_RISK + queryString;
  const headers = getAuthHeaders('GET', requestPath);

  const response: AxiosResponse<GetAccountPositionRiskResponse> = await apiClient.get(requestPath, {
    headers,
  });
  return response.data;
}

/**
 * 账单流水查询（近七天）
 * GET /api/v5/account/bills
 *
 * 访问限制: 5次/秒
 * @param params - 查询参数
 */
export async function getBills(params?: GetBillsParams): Promise<GetBillsResponse> {
  const queryString = params ? buildQueryString(params as Record<string, unknown>) : '';
  const requestPath = API_ENDPOINTS.GET_BILLS + queryString;
  const headers = getAuthHeaders('GET', requestPath);

  const response: AxiosResponse<GetBillsResponse> = await apiClient.get(requestPath, { headers });
  return response.data;
}

/**
 * 账单流水查询（近三个月）
 * GET /api/v5/account/bills-archive
 *
 * 访问限制: 5次/2秒
 * @param params - 查询参数
 */
export async function getBillsArchive(params?: GetBillsParams): Promise<GetBillsResponse> {
  const queryString = params ? buildQueryString(params as Record<string, unknown>) : '';
  const requestPath = API_ENDPOINTS.GET_BILLS_ARCHIVE + queryString;
  const headers = getAuthHeaders('GET', requestPath);

  const response: AxiosResponse<GetBillsResponse> = await apiClient.get(requestPath, { headers });
  return response.data;
}

/**
 * 申请账单流水（自2021年）
 * POST /api/v5/account/bills-history-archive
 *
 * 访问限制: 1次/5秒
 * @param params.year - 年份 (必填)
 * @param params.quarter - 季度 (必填)
 */
export async function applyBillsHistoryArchive(
  params: ApplyBillsHistoryArchiveParams
): Promise<ApplyBillsHistoryArchiveResponse> {
  const requestPath = API_ENDPOINTS.BILLS_HISTORY_ARCHIVE;
  const body = JSON.stringify(params);
  const headers = getAuthHeaders('POST', requestPath, body);

  const response: AxiosResponse<ApplyBillsHistoryArchiveResponse> = await apiClient.post(
    requestPath,
    params,
    { headers }
  );
  return response.data;
}

/**
 * 获取账单流水（自2021年）
 * GET /api/v5/account/bills-history-archive
 *
 * 访问限制: 1次/5秒
 * @param params.year - 年份 (必填)
 * @param params.quarter - 季度 (必填)
 */
export async function getBillsHistoryArchive(
  params: GetBillsHistoryArchiveParams
): Promise<GetBillsHistoryArchiveResponse> {
  const queryString = buildQueryString(params as Record<string, unknown>);
  const requestPath = API_ENDPOINTS.BILLS_HISTORY_ARCHIVE + queryString;
  const headers = getAuthHeaders('GET', requestPath);

  const response: AxiosResponse<GetBillsHistoryArchiveResponse> = await apiClient.get(requestPath, {
    headers,
  });
  return response.data;
}

/**
 * 查看账户配置
 * GET /api/v5/account/config
 *
 * 访问限制: 5次/2秒
 */
export async function getAccountConfig(): Promise<GetAccountConfigResponse> {
  const requestPath = API_ENDPOINTS.GET_CONFIG;
  const headers = getAuthHeaders('GET', requestPath);

  const response: AxiosResponse<GetAccountConfigResponse> = await apiClient.get(requestPath, {
    headers,
  });
  return response.data;
}

/**
 * 设置手续费计价方式
 * POST /api/v5/account/set-fee-type
 *
 * 访问限制: 5次/2秒
 * @param params.feeType - 手续费计价方式
 */
export async function setFeeType(params: SetFeeTypeParams): Promise<SetFeeTypeResponse> {
  const requestPath = API_ENDPOINTS.SET_FEE_TYPE;
  const body = JSON.stringify(params);
  const headers = getAuthHeaders('POST', requestPath, body);

  const response: AxiosResponse<SetFeeTypeResponse> = await apiClient.post(requestPath, params, {
    headers,
  });
  return response.data;
}

// ============== 导出所有函数 ==============

export default {
  // Public API
  getInstruments,

  // Private API - Account
  getBalance,
  getPositions,
  getPositionsHistory,
  getAccountPositionRisk,
  getBills,
  getBillsArchive,
  applyBillsHistoryArchive,
  getBillsHistoryArchive,
  getAccountConfig,
  setFeeType,
};
