/**
 * OKX Announcement API 类型定义
 * 基于 https://www.okx.com/docs-v5/zh/#announcement
 */

// ============== 枚举类型 ==============

/**
 * 公告类型
 */
export enum AnnouncementType {
  /** 新币上线 */
  NEW_LISTINGS = 'announcements-new-listings',
  /** 下架公告 */
  DELISTINGS = 'announcements-delistings',
  /** 交易更新 */
  TRADING_UPDATES = 'announcements-trading-updates',
  /** 充提暂停/恢复 */
  DEPOSIT_WITHDRAWAL = 'announcements-deposit-withdrawal-suspension-resumption',
  /** P2P交易 */
  P2P_TRADING = 'announcements-p2p-trading',
  /** Web3 */
  WEB3 = 'announcements-web3',
  /** 赚币借贷 */
  EARN_AND_LOAN = 'announcements-earn-and-loan',
  /** Jumpstart */
  JUMPSTART = 'announcements-jumpstart',
  /** API */
  API = 'announcements-api',
  /** OKB回购销毁 */
  OKB_BURN = 'announcements-okb-buy-back-burn',
  /** 其他 */
  OTHERS = 'announcements-others',
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

// ============== 公告接口 ==============

/**
 * 公告详情
 */
export interface AnnouncementDetail {
  /** 公告类型 */
  annType: AnnouncementType | string;
  /** 公告标题 */
  title: string;
  /** 公告链接 */
  url: string;
  /** 发布时间戳 */
  pTime: string;
  /** 业务发布时间戳 */
  businessPTime: string;
}

/**
 * 公告数据
 */
export interface AnnouncementData {
  /** 公告详情列表 */
  details: AnnouncementDetail[];
}

/**
 * 获取公告请求参数
 */
export interface GetAnnouncementsParams {
  /** 公告类型 (必填) */
  annType: AnnouncementType | string;
  /** 页码 (可选，默认1) */
  page?: string;
}

/**
 * 获取公告响应
 */
export type GetAnnouncementsResponse = OkxResponse<AnnouncementData[]>;

// ============== 公告类型接口 ==============

/**
 * 公告类型信息
 */
export interface AnnouncementTypeInfo {
  /** 公告类型标识 */
  annType: AnnouncementType | string;
  /** 公告类型描述 */
  annTypeDesc: string;
}

/**
 * 获取公告类型响应
 */
export type GetAnnouncementTypesResponse = OkxResponse<AnnouncementTypeInfo[]>;

// ============== 访问限制常量 ==============

/**
 * API 访问限制配置
 */
export const API_RATE_LIMITS = {
  /** 获取公告列表 - 5次/2秒 */
  GET_ANNOUNCEMENTS: { limit: 5, interval: 2000 },
  /** 获取公告类型 - 5次/2秒 */
  GET_ANNOUNCEMENT_TYPES: { limit: 5, interval: 2000 },
} as const;

// ============== API 端点常量 ==============

/**
 * API 端点路径
 */
export const API_ENDPOINTS = {
  /** 基础 URL */
  BASE_URL: 'https://www.okx.com',
  /** 获取公告列表 */
  GET_ANNOUNCEMENTS: '/api/v5/support/announcements',
  /** 获取公告类型 */
  GET_ANNOUNCEMENT_TYPES: '/api/v5/support/announcement-types',
} as const;

// ============== 错误码 ==============

/**
 * OKX API 错误码
 */
export const ERROR_CODES = {
  /** 成功 */
  SUCCESS: '0',
  /** 参数错误 */
  PARAM_ERROR: '51000',
  /** 系统繁忙 */
  SYSTEM_BUSY: '50001',
  /** API endpoint请求超时 */
  REQUEST_TIMEOUT: '50004',
  /** 请求频率过高 */
  RATE_LIMIT_EXCEEDED: '50011',
} as const;
