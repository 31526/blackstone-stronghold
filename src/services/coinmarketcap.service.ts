import axios, { AxiosInstance } from 'axios';


// API-账户网址 https://pro.coinmarketcap.com/account

// CoinMarketCap API 配置
const BASE_URL = 'https://pro-api.coinmarketcap.com';

// 创建 axios 实例
const createClient = (): AxiosInstance => {
  const apiKey = process.env.COIN_MARKET_CAP_KEY;
  if (!apiKey) {
    throw new Error('COIN_MARKET_CAP_KEY 环境变量未设置');
  }

  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'X-CMC_PRO_API_KEY': apiKey,
      Accept: 'application/json',
      'Accept-Encoding': 'deflate, gzip',
    },
  });
};

// 代币映射接口参数
interface TokenMapParams {
  listing_status?: 'active' | 'inactive' | 'untracked';
  start?: number;
  limit?: number;
  sort?: 'id' | 'cmc_rank';
  symbol?: string;
  aux?: string;
}

// 代币列表接口参数
interface ListingsParams {
  start?: number;
  limit?: number;
  convert?: string;
  sort?: string;
  sort_dir?: 'asc' | 'desc';
  cryptocurrency_type?: 'all' | 'coins' | 'tokens';
  aux?: string;
}

// 代币映射响应数据
interface TokenMapItem {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  rank: number;
  is_active: number;
  first_historical_data: string;
  last_historical_data: string;
  platform: {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    token_address: string;
  } | null;
}

// 代币列表响应数据
interface ListingsItem {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  num_market_pairs: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  last_updated: string;
  date_added: string;
  tags: string[];
  platform: {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    token_address: string;
  } | null;
  quote: {
    [key: string]: {
      price: number;
      volume_24h: number;
      volume_change_24h: number;
      percent_change_1h: number;
      percent_change_24h: number;
      percent_change_7d: number;
      market_cap: number;
      market_cap_dominance: number;
      fully_diluted_market_cap: number;
      last_updated: string;
    };
  };
}

// API 响应结构
interface CMCResponse<T> {
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
    notice: string | null;
    total_count?: number;
  };
  data: T;
}

/**
 * 方案 A：获取代币映射列表 (ID Map)
 * 不包含价格信息，适合同步代币基础数据
 */
export async function getTokenMap(params: TokenMapParams = {}): Promise<CMCResponse<TokenMapItem[]>> {
  const client = createClient();
  const endpoint = '/v1/cryptocurrency/map';

  const defaultParams: TokenMapParams = {
    listing_status: 'active',
    limit: 5000,
    sort: 'cmc_rank',
    ...params,
  };

  const response = await client.get<CMCResponse<TokenMapItem[]>>(endpoint, {
    params: defaultParams,
  });

  return response.data;
}

/**
 * 方案 A：循环获取全部代币映射列表
 * 支持分页遍历所有代币
 */
export async function getAllTokenMap(
  pageSize: number = 5000,
  maxPages?: number
): Promise<{ data: TokenMapItem[]; totalCount: number; pagesFetched: number }> {
  const allTokens: TokenMapItem[] = [];
  let start = 1;
  let pagesFetched = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await getTokenMap({
      start,
      limit: pageSize,
    });

    const tokens = response.data;
    allTokens.push(...tokens);
    pagesFetched++;

    console.log(`已获取第 ${pagesFetched} 页，本页 ${tokens.length} 条，累计 ${allTokens.length} 条`);

    // 判断是否还有更多数据
    if (tokens.length < pageSize) {
      hasMore = false;
    } else if (maxPages && pagesFetched >= maxPages) {
      hasMore = false;
    } else {
      start += pageSize;
      // 添加延迟避免触发频率限制
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return {
    data: allTokens,
    totalCount: allTokens.length,
    pagesFetched,
  };
}

/**
 * 方案 B：获取最新排名和价格列表 (Listings Latest)
 * 包含价格、市值、涨跌幅等信息
 */
export async function getListingsLatest(params: ListingsParams = {}): Promise<CMCResponse<ListingsItem[]>> {
  const client = createClient();
  const endpoint = '/v1/cryptocurrency/listings/latest';

  const defaultParams: ListingsParams = {
    start: 1,
    limit: 100,
    convert: 'USD',
    ...params,
  };

  const response = await client.get<CMCResponse<ListingsItem[]>>(endpoint, {
    params: defaultParams,
  });

  return response.data;
}

/**
 * 方案 B：循环获取全部代币价格列表
 * 支持分页遍历所有代币（注意：此接口消耗更多 API 额度）
 */
export async function getAllListings(
  pageSize: number = 200,
  maxPages?: number,
  convert: string = 'USD'
): Promise<{ data: ListingsItem[]; totalCount: number; pagesFetched: number }> {
  const allListings: ListingsItem[] = [];
  let start = 1;
  let pagesFetched = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await getListingsLatest({
      start,
      limit: pageSize,
      convert,
    });

    const listings = response.data;
    allListings.push(...listings);
    pagesFetched++;

    console.log(`已获取第 ${pagesFetched} 页，本页 ${listings.length} 条，累计 ${allListings.length} 条`);

    // 判断是否还有更多数据
    if (listings.length < pageSize) {
      hasMore = false;
    } else if (maxPages && pagesFetched >= maxPages) {
      hasMore = false;
    } else {
      start += pageSize;
      // 添加延迟避免触发频率限制
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return {
    data: allListings,
    totalCount: allListings.length,
    pagesFetched,
  };
}

export type { TokenMapParams, ListingsParams, TokenMapItem, ListingsItem, CMCResponse };
