/**
 * OKX Trading Statistics API Service
 * 封装 OKX 交易大数据 REST API 请求
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  API_ENDPOINTS,
  GetSupportCoinResponse,
  GetContractOpenInterestHistoryParams,
  GetContractOpenInterestHistoryResponse,
  GetTakerVolumeParams,
  GetTakerVolumeResponse,
  GetContractTakerVolumeParams,
  GetContractTakerVolumeResponse,
  GetMarginLoanRatioParams,
  GetMarginLoanRatioResponse,
  GetPutCallRatioParams,
  GetPutCallRatioResponse,
  GetContractLongShortRatioParams,
  GetContractLongShortRatioResponse,
  GetContractsOpenInterestVolumeParams,
  GetContractsOpenInterestVolumeResponse,
  GetOptionsOpenInterestVolumeParams,
  GetOptionsOpenInterestVolumeResponse,
  GetOpenInterestVolumeExpiryParams,
  GetOpenInterestVolumeExpiryResponse,
  GetOpenInterestVolumeStrikeParams,
  GetOpenInterestVolumeStrikeResponse,
  GetOptionTakerFlowParams,
  GetOptionTakerFlowResponse,
} from '@/apis/okx/trading-data';

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
    console.log(`[OKX TradingData] 请求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[OKX TradingData] 请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 添加日志
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[OKX TradingData] 响应: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[OKX TradingData] 响应错误:', error.message);
    return Promise.reject(error);
  }
);

// ============== Trading Statistics API ==============

/**
 * 获取交易大数据支持币种
 * GET /api/v5/rubik/stat/trading-data/support-coin
 *
 * 访问限制: 5次/2秒
 */
export async function getSupportCoin(): Promise<GetSupportCoinResponse> {
  const response: AxiosResponse<GetSupportCoinResponse> = await apiClient.get(
    API_ENDPOINTS.GET_SUPPORT_COIN
  );
  return response.data;
}

/**
 * 获取合约持仓量历史
 * GET /api/v5/rubik/stat/contracts/open-interest-history
 *
 * 访问限制: 5次/2秒
 * @param params.instId - 产品ID (必填)
 * @param params.period - 时间周期 (5m/1H/1D，默认5m)
 */
export async function getContractOpenInterestHistory(
  params: GetContractOpenInterestHistoryParams
): Promise<GetContractOpenInterestHistoryResponse> {
  const response: AxiosResponse<GetContractOpenInterestHistoryResponse> = await apiClient.get(
    API_ENDPOINTS.GET_CONTRACT_OPEN_INTEREST_HISTORY,
    { params }
  );
  return response.data;
}

/**
 * 获取主动买入/卖出情况
 * GET /api/v5/rubik/stat/taker-volume
 *
 * 访问限制: 5次/2秒
 * @param params.ccy - 币种 (必填)
 * @param params.instType - 产品类型 (必填: SPOT)
 * @param params.period - 时间周期 (5m/1H/1D，默认5m)
 */
export async function getTakerVolume(
  params: GetTakerVolumeParams
): Promise<GetTakerVolumeResponse> {
  const response: AxiosResponse<GetTakerVolumeResponse> = await apiClient.get(
    API_ENDPOINTS.GET_TAKER_VOLUME,
    { params }
  );
  return response.data;
}

/**
 * 获取合约主动买入/卖出情况
 * GET /api/v5/rubik/stat/taker-volume-contract
 *
 * 访问限制: 5次/2秒
 * @param params.instId - 产品ID (必填)
 * @param params.period - 时间周期 (5m/1H/1D，默认5m)
 */
export async function getContractTakerVolume(
  params: GetContractTakerVolumeParams
): Promise<GetContractTakerVolumeResponse> {
  const response: AxiosResponse<GetContractTakerVolumeResponse> = await apiClient.get(
    API_ENDPOINTS.GET_CONTRACT_TAKER_VOLUME,
    { params }
  );
  return response.data;
}

/**
 * 获取杠杆多空比
 * GET /api/v5/rubik/stat/margin/loan-ratio
 *
 * 访问限制: 5次/2秒
 * @param params.ccy - 币种 (必填)
 * @param params.period - 时间周期 (5m/1H/1D，默认5m)
 */
export async function getMarginLoanRatio(
  params: GetMarginLoanRatioParams
): Promise<GetMarginLoanRatioResponse> {
  const response: AxiosResponse<GetMarginLoanRatioResponse> = await apiClient.get(
    API_ENDPOINTS.GET_MARGIN_LOAN_RATIO,
    { params }
  );
  return response.data;
}

/**
 * 获取看涨/看跌期权持仓量比/交易量比
 * GET /api/v5/rubik/stat/option/open-interest-volume-ratio
 *
 * 访问限制: 5次/2秒
 * @param params.ccy - 币种 (必填)
 * @param params.period - 时间周期 (8H/1D，默认8H)
 */
export async function getPutCallRatio(
  params: GetPutCallRatioParams
): Promise<GetPutCallRatioResponse> {
  const response: AxiosResponse<GetPutCallRatioResponse> = await apiClient.get(
    API_ENDPOINTS.GET_PUT_CALL_RATIO,
    { params }
  );
  return response.data;
}

/**
 * 获取合约多空持仓人数比
 * GET /api/v5/rubik/stat/contracts/long-short-account-ratio
 *
 * 访问限制: 5次/2秒
 * @param params.ccy - 币种 (必填)
 * @param params.period - 时间周期 (5m/1H/1D，默认5m)
 */
export async function getContractLongShortRatio(
  params: GetContractLongShortRatioParams
): Promise<GetContractLongShortRatioResponse> {
  const response: AxiosResponse<GetContractLongShortRatioResponse> = await apiClient.get(
    API_ENDPOINTS.GET_CONTRACT_LONG_SHORT_RATIO,
    { params }
  );
  return response.data;
}

/**
 * 获取合约持仓量及交易量
 * GET /api/v5/rubik/stat/contracts/open-interest-volume
 *
 * 访问限制: 5次/2秒
 * @param params.ccy - 币种 (必填)
 * @param params.period - 时间周期 (5m/1H/1D，默认5m)
 */
export async function getContractsOpenInterestVolume(
  params: GetContractsOpenInterestVolumeParams
): Promise<GetContractsOpenInterestVolumeResponse> {
  const response: AxiosResponse<GetContractsOpenInterestVolumeResponse> = await apiClient.get(
    API_ENDPOINTS.GET_CONTRACTS_OPEN_INTEREST_VOLUME,
    { params }
  );
  return response.data;
}

/**
 * 获取期权持仓量及交易量
 * GET /api/v5/rubik/stat/option/open-interest-volume
 *
 * 访问限制: 5次/2秒
 * @param params.ccy - 币种 (必填)
 * @param params.period - 时间周期 (8H/1D，默认8H)
 */
export async function getOptionsOpenInterestVolume(
  params: GetOptionsOpenInterestVolumeParams
): Promise<GetOptionsOpenInterestVolumeResponse> {
  const response: AxiosResponse<GetOptionsOpenInterestVolumeResponse> = await apiClient.get(
    API_ENDPOINTS.GET_OPTIONS_OPEN_INTEREST_VOLUME,
    { params }
  );
  return response.data;
}

/**
 * 获取期权按到期日持仓量及交易量
 * GET /api/v5/rubik/stat/option/open-interest-volume-expiry
 *
 * 访问限制: 5次/2秒
 * @param params.ccy - 币种 (必填)
 * @param params.period - 时间周期 (8H/1D，默认8H)
 */
export async function getOpenInterestVolumeExpiry(
  params: GetOpenInterestVolumeExpiryParams
): Promise<GetOpenInterestVolumeExpiryResponse> {
  const response: AxiosResponse<GetOpenInterestVolumeExpiryResponse> = await apiClient.get(
    API_ENDPOINTS.GET_OPEN_INTEREST_VOLUME_EXPIRY,
    { params }
  );
  return response.data;
}

/**
 * 获取期权按执行价格持仓量及交易量
 * GET /api/v5/rubik/stat/option/open-interest-volume-strike
 *
 * 访问限制: 5次/2秒
 * @param params.ccy - 币种 (必填)
 * @param params.expTime - 到期日 (必填，格式YYYYMMDD)
 * @param params.period - 时间周期 (8H/1D，默认8H)
 */
export async function getOpenInterestVolumeStrike(
  params: GetOpenInterestVolumeStrikeParams
): Promise<GetOpenInterestVolumeStrikeResponse> {
  const response: AxiosResponse<GetOpenInterestVolumeStrikeResponse> = await apiClient.get(
    API_ENDPOINTS.GET_OPEN_INTEREST_VOLUME_STRIKE,
    { params }
  );
  return response.data;
}

/**
 * 获取期权主动买入/卖出量
 * GET /api/v5/rubik/stat/option/taker-block-volume
 *
 * 访问限制: 5次/2秒
 * @param params.ccy - 币种 (必填)
 * @param params.period - 时间周期 (8H/1D，默认8H)
 */
export async function getOptionTakerFlow(
  params: GetOptionTakerFlowParams
): Promise<GetOptionTakerFlowResponse> {
  const response: AxiosResponse<GetOptionTakerFlowResponse> = await apiClient.get(
    API_ENDPOINTS.GET_OPTION_TAKER_FLOW,
    { params }
  );
  return response.data;
}

// ============== 导出所有函数 ==============

export default {
  getSupportCoin,
  getContractOpenInterestHistory,
  getTakerVolume,
  getContractTakerVolume,
  getMarginLoanRatio,
  getPutCallRatio,
  getContractLongShortRatio,
  getContractsOpenInterestVolume,
  getOptionsOpenInterestVolume,
  getOpenInterestVolumeExpiry,
  getOpenInterestVolumeStrike,
  getOptionTakerFlow,
};
