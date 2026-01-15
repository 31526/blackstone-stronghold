/**
 * DexScreener API 类型定义
 * 基于 https://docs.dexscreener.com/api/reference
 */

// ============== 枚举类型 ==============

/**
 * 支持的链 ID
 */
export enum ChainId {
  ETHEREUM = 'ethereum',
  BSC = 'bsc',
  POLYGON = 'polygon',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',
  BASE = 'base',
  SOLANA = 'solana',
  AVALANCHE = 'avalanche',
  FANTOM = 'fantom',
  CRONOS = 'cronos',
  PULSECHAIN = 'pulsechain',
  LINEA = 'linea',
  SCROLL = 'scroll',
  MANTA = 'manta',
  MANTLE = 'mantle',
  CELO = 'celo',
  FLARE = 'flare',
  TAIKO = 'taiko',
  SONEIUM = 'soneium',
  METIS = 'metis',
  SEIV2 = 'seiv2',
  PLASMA = 'plasma',
  ETHEREUMPOW = 'ethereumpow',
}

/**
 * 订单类型
 */
export enum OrderType {
  TOKEN_PROFILE = 'tokenProfile',
  TOKEN_AD = 'tokenAd',
  COMMUNITY_TAKEOVER = 'communityTakeover',
}

/**
 * 订单状态
 */
export enum OrderStatus {
  APPROVED = 'approved',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on-hold',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

/**
 * 社交链接类型
 */
export enum SocialLinkType {
  TWITTER = 'twitter',
  TELEGRAM = 'telegram',
  DISCORD = 'discord',
  TIKTOK = 'tiktok',
  INSTAGRAM = 'instagram',
}

// ============== 基础接口 ==============

/**
 * 代币信息
 */
export interface Token {
  address: string;
  name: string;
  symbol: string;
}

/**
 * 交易次数统计
 */
export interface TransactionCount {
  buys: number;
  sells: number;
}

/**
 * 交易统计 (按时间段)
 */
export interface Transactions {
  m5: TransactionCount;
  h1: TransactionCount;
  h6: TransactionCount;
  h24: TransactionCount;
}

/**
 * 交易量 (按时间段)
 */
export interface Volume {
  m5?: number;
  h1: number;
  h6: number;
  h24: number;
}

/**
 * 价格变化 (按时间段)
 */
export interface PriceChange {
  m5?: number;
  h1?: number;
  h6?: number;
  h24?: number;
}

/**
 * 流动性信息
 */
export interface Liquidity {
  usd: number;
  base: number;
  quote: number;
}

/**
 * 社交链接
 */
export interface SocialLink {
  type?: SocialLinkType | string;
  label?: string;
  url: string;
}

/**
 * 交易对信息
 */
export interface PairInfo {
  imageUrl?: string;
  openGraph?: string;
  websites?: string[];
  socials?: SocialLink[];
}

// ============== 交易对接口 ==============

/**
 * 交易对详情
 */
export interface Pair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels?: string[];
  baseToken: Token;
  quoteToken: Token;
  priceNative: string;
  priceUsd: string;
  txns: Transactions;
  volume: Volume;
  priceChange: PriceChange;
  liquidity: Liquidity;
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  info?: PairInfo;
}

/**
 * 交易对响应
 */
export interface PairsResponse {
  schemaVersion: string;
  pairs: Pair[];
  pair?: Pair;
}

// ============== Token Profiles 接口 ==============

/**
 * 代币配置文件链接
 */
export interface TokenProfileLink {
  type?: string;
  label?: string;
  url: string;
}

/**
 * 代币配置文件
 */
export interface TokenProfile {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon?: string;
  header?: string;
  openGraph?: string;
  description?: string;
  links?: TokenProfileLink[];
  cto?: boolean;
}

/**
 * 代币配置文件响应 (数组)
 */
export type TokenProfilesResponse = TokenProfile[];

// ============== Token Boosts 接口 ==============

/**
 * 代币加速信息
 */
export interface TokenBoost {
  url: string;
  chainId: string;
  tokenAddress: string;
  description?: string;
  icon?: string;
  header?: string;
  openGraph?: string;
  links?: TokenProfileLink[];
  totalAmount: number;
}

/**
 * 代币加速响应 (数组)
 */
export type TokenBoostsResponse = TokenBoost[];

// ============== Orders 接口 ==============

/**
 * 订单信息
 */
export interface Order {
  chainId: string;
  tokenAddress: string;
  type: OrderType | string;
  status: OrderStatus | string;
  paymentTimestamp: number;
}

/**
 * 加速信息
 */
export interface Boost {
  chainId: string;
  tokenAddress: string;
  id: string;
  amount: number;
  paymentTimestamp: number;
}

/**
 * 订单响应
 */
export interface OrdersResponse {
  orders: Order[];
  boosts: Boost[];
}

// ============== 搜索接口 ==============

/**
 * 搜索参数
 */
export interface SearchParams {
  q: string;
}

/**
 * 搜索响应 (与 PairsResponse 相同)
 */
export type SearchResponse = PairsResponse;

// ============== API 请求参数 ==============

/**
 * 获取交易对参数
 */
export interface GetPairsParams {
  chainId: string;
  pairAddresses: string;
}

/**
 * 获取代币交易对参数
 */
export interface GetTokensParams {
  tokenAddresses: string;
}

/**
 * 获取订单参数
 */
export interface GetOrdersParams {
  chainId: string;
  tokenAddress: string;
}

// ============== API 错误 ==============

/**
 * API 错误响应
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// ============== 工具类型 ==============

/**
 * API 响应包装类型
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  savedTo?: string | null;
}
