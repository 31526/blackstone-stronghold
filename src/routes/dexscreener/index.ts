/**
 * DexScreener 路由模块
 * 提供 DexScreener API 的代理访问
 */

import { Router, Request, Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  getLatestTokenProfiles,
  getLatestTokenBoosts,
  getTopTokenBoosts,
  getOrders,
  getPairsByAddress,
  getPairsByTokenAddress,
  searchPairs,
} from '@/services/dexscreener.service';
import { ApiResponse } from '@/apis/dexscreener/types';

const router: Router = Router();

// ============== 工具函数 ==============

/**
 * 确保 data 目录存在
 */
const ensureDataDir = async (): Promise<string> => {
  const dataDir = path.join(process.cwd(), 'data', 'dexscreener');
  await fs.mkdir(dataDir, { recursive: true });
  return dataDir;
};

/**
 * 保存数据到 JSON 文件
 */
const saveToJson = async (filename: string, data: unknown): Promise<string> => {
  const dataDir = await ensureDataDir();
  const filePath = path.join(dataDir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return filePath;
};

/**
 * 处理请求并返回响应
 */
const handleRequest = async <T>(
  res: Response,
  fetchFn: () => Promise<T>,
  filename: string,
  save: boolean
): Promise<void> => {
  try {
    const data = await fetchFn();

    let savedTo: string | null = null;
    if (save) {
      const filePath = await saveToJson(filename, data);
      savedTo = path.basename(filePath);
      console.log(`[DexScreener] 数据已保存到: ${filePath}`);
    }

    const response: ApiResponse<T> = {
      success: true,
      data,
      savedTo,
    };

    res.json(response);
  } catch (error) {
    console.error('[DexScreener] 请求失败:', error);
    const response: ApiResponse<T> = {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
    res.status(500).json(response);
  }
};

// ============== Token Profiles 路由 ==============

/**
 * GET /dexscreener/token-profiles/latest
 * 获取最新代币配置文件
 *
 * Query:
 * - save: boolean (是否保存到文件，默认 false)
 */
router.get('/token-profiles/latest', async (req: Request, res: Response) => {
  const save = req.query.save === 'true';
  const filename = `token_profiles_latest_${Date.now()}.json`;

  await handleRequest(res, getLatestTokenProfiles, filename, save);
});

// ============== Token Boosts 路由 ==============

/**
 * GET /dexscreener/token-boosts/latest
 * 获取最新代币加速
 *
 * Query:
 * - save: boolean (是否保存到文件，默认 false)
 */
router.get('/token-boosts/latest', async (req: Request, res: Response) => {
  const save = req.query.save === 'true';
  const filename = `token_boosts_latest_${Date.now()}.json`;

  await handleRequest(res, getLatestTokenBoosts, filename, save);
});

/**
 * GET /dexscreener/token-boosts/top
 * 获取热门代币加速
 *
 * Query:
 * - save: boolean (是否保存到文件，默认 false)
 */
router.get('/token-boosts/top', async (req: Request, res: Response) => {
  const save = req.query.save === 'true';
  const filename = `token_boosts_top_${Date.now()}.json`;

  await handleRequest(res, getTopTokenBoosts, filename, save);
});

// ============== Orders 路由 ==============

/**
 * GET /dexscreener/orders/:chainId/:tokenAddress
 * 获取代币订单状态
 *
 * Params:
 * - chainId: 链 ID (ethereum, solana, bsc 等)
 * - tokenAddress: 代币合约地址
 *
 * Query:
 * - save: boolean (是否保存到文件，默认 false)
 */
router.get('/orders/:chainId/:tokenAddress', async (req: Request, res: Response) => {
  const chainId = req.params.chainId as string;
  const tokenAddress = req.params.tokenAddress as string;
  const save = req.query.save === 'true';
  const filename = `orders_${chainId}_${tokenAddress.slice(0, 8)}_${Date.now()}.json`;

  await handleRequest(res, () => getOrders({ chainId, tokenAddress }), filename, save);
});

// ============== DEX Pairs 路由 ==============

/**
 * GET /dexscreener/pairs/:chainId/:pairAddresses
 * 根据交易对地址获取交易对
 *
 * Params:
 * - chainId: 链 ID
 * - pairAddresses: 交易对地址 (支持逗号分隔多个)
 *
 * Query:
 * - save: boolean (是否保存到文件，默认 false)
 */
router.get('/pairs/:chainId/:pairAddresses', async (req: Request, res: Response) => {
  const chainId = req.params.chainId as string;
  const pairAddresses = req.params.pairAddresses as string;
  const save = req.query.save === 'true';
  const firstAddr = pairAddresses.split(',')[0].slice(0, 8);
  const filename = `pairs_${chainId}_${firstAddr}_${Date.now()}.json`;

  await handleRequest(res, () => getPairsByAddress({ chainId, pairAddresses }), filename, save);
});

/**
 * GET /dexscreener/tokens/:tokenAddresses
 * 根据代币地址获取交易对
 *
 * Params:
 * - tokenAddresses: 代币地址 (支持逗号分隔多个)
 *
 * Query:
 * - save: boolean (是否保存到文件，默认 false)
 */
router.get('/tokens/:tokenAddresses', async (req: Request, res: Response) => {
  const tokenAddresses = req.params.tokenAddresses as string;
  const save = req.query.save === 'true';
  const firstAddr = tokenAddresses.split(',')[0].slice(0, 8);
  const filename = `tokens_${firstAddr}_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getPairsByTokenAddress({ tokenAddresses }),
    filename,
    save
  );
});

/**
 * GET /dexscreener/search
 * 搜索交易对
 *
 * Query:
 * - q: 搜索关键词 (必填)
 * - save: boolean (是否保存到文件，默认 false)
 */
router.get('/search', async (req: Request, res: Response) => {
  const q = req.query.q as string;

  if (!q) {
    res.status(400).json({
      success: false,
      error: '缺少搜索关键词参数 q',
    });
    return;
  }

  const save = req.query.save === 'true';
  const filename = `search_${q.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.json`;

  await handleRequest(res, () => searchPairs({ q }), filename, save);
});

export default router;
