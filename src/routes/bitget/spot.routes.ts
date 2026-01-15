/**
 * Bitget Spot Market 路由模块
 * 提供 Bitget 现货行情 API 的代理访问
 */

import { Router, Request, Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  getCoins,
  getSymbols,
  getTickers,
  getRecentTrades,
  getMarketTrades,
} from '@/services/bitget.service';
import { ApiResponse } from '@/apis/bitget/spot';

const router: Router = Router();

// ============== 工具函数 ==============

/**
 * 确保 data 目录存在
 */
const ensureDataDir = async (): Promise<string> => {
  const dataDir = path.join(process.cwd(), 'data', 'bitget');
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
      console.log(`[Bitget] 数据已保存到: ${filePath}`);
    }

    const response: ApiResponse<T> = {
      success: true,
      data,
      savedTo,
    };

    res.json(response);
  } catch (error) {
    console.error('[Bitget] 请求失败:', error);
    const response: ApiResponse<T> = {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
    res.status(500).json(response);
  }
};

// ============== Public API 路由 ==============

/**
 * GET /bitget/spot/coins
 * 获取币种列表
 *
 * Query:
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 20次/秒
 */
router.get('/coins', async (req: Request, res: Response) => {
  const save = req.query.save === 'true';
  const filename = `coins_${Date.now()}.json`;

  await handleRequest(res, getCoins, filename, save);
});

/**
 * GET /bitget/spot/symbols
 * 获取交易对列表
 *
 * Query:
 * - symbol: string (交易对名称，可选)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 20次/秒
 */
router.get('/symbols', async (req: Request, res: Response) => {
  const symbol = req.query.symbol as string | undefined;
  const save = req.query.save === 'true';
  const filename = symbol
    ? `symbols_${symbol}_${Date.now()}.json`
    : `symbols_all_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getSymbols(symbol ? { symbol } : undefined),
    filename,
    save
  );
});

// ============== Market API 路由 ==============

/**
 * GET /bitget/spot/tickers
 * 获取行情数据
 *
 * Query:
 * - symbol: string (交易对名称，可选，不传则返回所有)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 20次/秒
 */
router.get('/tickers', async (req: Request, res: Response) => {
  const symbol = req.query.symbol as string | undefined;
  const save = req.query.save === 'true';
  const filename = symbol
    ? `tickers_${symbol}_${Date.now()}.json`
    : `tickers_all_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getTickers(symbol ? { symbol } : undefined),
    filename,
    save
  );
});

/**
 * GET /bitget/spot/trades/recent
 * 获取最近成交记录
 *
 * Query:
 * - symbol: string (交易对名称，必填)
 * - limit: string (返回数量，默认 100，最大 500)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 10次/秒
 */
router.get('/trades/recent', async (req: Request, res: Response) => {
  const symbol = req.query.symbol as string;
  const limit = req.query.limit as string | undefined;

  if (!symbol) {
    res.status(400).json({
      success: false,
      error: '缺少必填参数 symbol',
    });
    return;
  }

  const save = req.query.save === 'true';
  const filename = `trades_recent_${symbol}_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getRecentTrades({ symbol, limit }),
    filename,
    save
  );
});

/**
 * GET /bitget/spot/trades/history
 * 获取历史成交记录
 *
 * Query:
 * - symbol: string (交易对名称，必填)
 * - limit: string (返回数量，默认 100，最大 500)
 * - endTime: string (结束时间戳，毫秒)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 10次/秒
 */
router.get('/trades/history', async (req: Request, res: Response) => {
  const symbol = req.query.symbol as string;
  const limit = req.query.limit as string | undefined;
  const endTime = req.query.endTime as string | undefined;

  if (!symbol) {
    res.status(400).json({
      success: false,
      error: '缺少必填参数 symbol',
    });
    return;
  }

  const save = req.query.save === 'true';
  const filename = `trades_history_${symbol}_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getMarketTrades({ symbol, limit, endTime }),
    filename,
    save
  );
});

export default router;
