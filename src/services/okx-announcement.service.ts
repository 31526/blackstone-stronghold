/**
 * OKX Announcement API Service
 * 封装 OKX 公告 REST API 请求
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  API_ENDPOINTS,
  GetAnnouncementsParams,
  GetAnnouncementsResponse,
  GetAnnouncementTypesResponse,
} from '@/apis/okx/announcement';

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
    console.log(`[OKX Announcement] 请求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[OKX Announcement] 请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 添加日志
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[OKX Announcement] 响应: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[OKX Announcement] 响应错误:', error.message);
    return Promise.reject(error);
  }
);

// ============== Support API - 公告接口 ==============

/**
 * 获取公告列表
 * GET /api/v5/support/announcements
 *
 * 访问限制: 5次/2秒
 * @param params.annType - 公告类型 (必填)
 * @param params.page - 页码 (可选，默认1)
 */
export async function getAnnouncements(params: GetAnnouncementsParams): Promise<GetAnnouncementsResponse> {
  const response: AxiosResponse<GetAnnouncementsResponse> = await apiClient.get(
    API_ENDPOINTS.GET_ANNOUNCEMENTS,
    { params }
  );
  return response.data;
}

/**
 * 获取公告类型列表
 * GET /api/v5/support/announcement-types
 *
 * 访问限制: 5次/2秒
 */
export async function getAnnouncementTypes(): Promise<GetAnnouncementTypesResponse> {
  const response: AxiosResponse<GetAnnouncementTypesResponse> = await apiClient.get(
    API_ENDPOINTS.GET_ANNOUNCEMENT_TYPES
  );
  return response.data;
}

// ============== 导出所有函数 ==============

export default {
  getAnnouncements,
  getAnnouncementTypes,
};
