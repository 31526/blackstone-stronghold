/**
 * OKX Spot Market 路由模块
 * 提供 OKX 现货行情 API 的代理访问
 */

import { Router, Request, Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  getInstruments,
  getTickers,
  getTicker,
} from '@/services/okx.service';
import { ApiResponse, InstType } from '@/apis/okx/spot';

const router: Router = Router();

// ============== 工具函数 ==============

/**
 * 确保 data 目录存在
 */
const ensureDataDir = async (): Promise<string> => {
  const dataDir = path.join(process.cwd(), 'data', 'okx');
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
      console.log(`[OKX] 数据已保存到: ${filePath}`);
    }

    const response: ApiResponse<T> = {
      success: true,
      data,
      savedTo,
    };

    res.json(response);
  } catch (error) {
    console.error('[OKX] 请求失败:', error);
    const response: ApiResponse<T> = {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
    res.status(500).json(response);
  }
};

// ============== Public Data API 路由 ==============

/**
 * GET /okx/spot/instruments
 * 获取交易产品信息
 *
 * Query:
 * - instType: string (产品类型，默认 SPOT)
 * - instId: string (产品ID，可选)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 20次/2秒
 */
router.get('/instruments', async (req: Request, res: Response) => {
  const instType = (req.query.instType as string) || InstType.SPOT;
  const instId = req.query.instId as string | undefined;
  const save = req.query.save === 'true';

  const filename = instId
    ? `instruments_${instType}_${instId}_${Date.now()}.json`
    : `instruments_${instType}_all_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getInstruments({ instType, instId }),
    filename,
    save
  );
});

// ============== Market Data API 路由 ==============

/**
 * GET /okx/spot/tickers
 * 获取所有产品行情信息
 *
 * Query:
 * - instType: string (产品类型，默认 SPOT)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 20次/2秒
 */
router.get('/tickers', async (req: Request, res: Response) => {
  const instType = (req.query.instType as string) || InstType.SPOT;
  const save = req.query.save === 'true';

  const filename = `tickers_${instType}_all_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getTickers({ instType }),
    filename,
    save
  );
});

/**
 * GET /okx/spot/ticker
 * 获取单个产品行情信息
 *
 * Query:
 * - instId: string (产品ID，必填)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 20次/2秒
 */
router.get('/ticker', async (req: Request, res: Response) => {
  const instId = req.query.instId as string;

  if (!instId) {
    res.status(400).json({
      success: false,
      error: '缺少必填参数 instId',
    });
    return;
  }

  const save = req.query.save === 'true';
  const filename = `ticker_${instId.replace('-', '_')}_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getTicker({ instId }),
    filename,
    save
  );
});

export default router;
