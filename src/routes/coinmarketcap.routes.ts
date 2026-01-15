import { Router, Request, Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  getTokenMap,
  getAllTokenMap,
  getListingsLatest,
  getAllListings,
} from '@/services/coinmarketcap.service';

const router: Router = Router();

// 确保 data 目录存在
const ensureDataDir = async (): Promise<string> => {
  const dataDir = path.join(process.cwd(), 'data');
  await fs.mkdir(dataDir, { recursive: true });
  return dataDir;
};

// 保存数据到 JSON 文件
const saveToJson = async (filename: string, data: unknown): Promise<string> => {
  const dataDir = await ensureDataDir();
  const filePath = path.join(dataDir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return filePath;
};

/**
 * GET /coinmarketcap/tokens
 * 获取代币列表
 *
 * 查询参数:
 * - type: 'map' | 'listings' (默认 'map')
 *   - map: 方案A，获取代币映射列表（不含价格）
 *   - listings: 方案B，获取代币价格列表
 * - start: 起始位置 (默认 1)
 * - limit: 每页数量 (默认 map:5000, listings:100)
 * - fetchAll: 是否获取全部数据 (默认 false)
 * - maxPages: 最大页数限制 (仅 fetchAll=true 时有效)
 * - convert: 价格转换货币 (仅 listings 有效，默认 USD)
 * - save: 是否保存到文件 (默认 false)
 */
router.get('/tokens', async (req: Request, res: Response) => {
  try {
    const {
      type = 'map',
      start = '1',
      limit,
      fetchAll = 'false',
      maxPages,
      convert = 'USD',
      save = 'false',
    } = req.query;

    const shouldFetchAll = fetchAll === 'true';
    const shouldSave = save === 'true';
    const startNum = parseInt(start as string, 10);
    const maxPagesNum = maxPages ? parseInt(maxPages as string, 10) : undefined;

    let result: unknown;
    let filename: string;

    if (type === 'listings') {
      // 方案 B：获取价格列表
      const limitNum = limit ? parseInt(limit as string, 10) : 100;

      if (shouldFetchAll) {
        result = await getAllListings(limitNum, maxPagesNum, convert as string);
        filename = `listings_all_${Date.now()}.json`;
      } else {
        result = await getListingsLatest({
          start: startNum,
          limit: limitNum,
          convert: convert as string,
        });
        filename = `listings_${startNum}_${limitNum}_${Date.now()}.json`;
      }
    } else {
      // 方案 A：获取代币映射（默认）
      const limitNum = limit ? parseInt(limit as string, 10) : 5000;

      if (shouldFetchAll) {
        result = await getAllTokenMap(limitNum, maxPagesNum);
        filename = `token_map_all_${Date.now()}.json`;
      } else {
        result = await getTokenMap({
          start: startNum,
          limit: limitNum,
        });
        filename = `token_map_${startNum}_${limitNum}_${Date.now()}.json`;
      }
    }

    // 保存到文件
    if (shouldSave) {
      const filePath = await saveToJson(filename, result);
      console.log(`数据已保存到: ${filePath}`);
    }

    res.json({
      success: true,
      savedTo: shouldSave ? filename : null,
      result,
    });
  } catch (error) {
    console.error('获取代币列表失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

export default router;
