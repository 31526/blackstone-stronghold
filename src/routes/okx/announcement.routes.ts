/**
 * OKX Announcement 路由模块
 * 提供 OKX 公告 API 的代理访问
 */

import { Router, Request, Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  getAnnouncements,
  getAnnouncementTypes,
} from '@/services/okx-announcement.service';
import { ApiResponse, AnnouncementType } from '@/apis/okx/announcement';

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
      console.log(`[OKX Announcement] 数据已保存到: ${filePath}`);
    }

    const response: ApiResponse<T> = {
      success: true,
      data,
      savedTo,
    };

    res.json(response);
  } catch (error) {
    console.error('[OKX Announcement] 请求失败:', error);
    const response: ApiResponse<T> = {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
    res.status(500).json(response);
  }
};

// ============== Support API 路由 ==============

/**
 * GET /okx/announcement/list
 * 获取公告列表
 *
 * Query:
 * - annType: string (公告类型，必填)
 * - page: string (页码，可选，默认1)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 5次/2秒
 */
router.get('/list', async (req: Request, res: Response) => {
  const annType = req.query.annType as string;

  if (!annType) {
    res.status(400).json({
      success: false,
      error: '缺少必填参数 annType',
    });
    return;
  }

  const page = req.query.page as string | undefined;
  const save = req.query.save === 'true';

  const filename = `announcements_${annType.replace('announcements-', '')}_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getAnnouncements({ annType, page }),
    filename,
    save
  );
});

/**
 * GET /okx/announcement/types
 * 获取公告类型列表
 *
 * Query:
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 5次/2秒
 */
router.get('/types', async (req: Request, res: Response) => {
  const save = req.query.save === 'true';

  const filename = `announcement_types_${Date.now()}.json`;

  await handleRequest(
    res,
    getAnnouncementTypes,
    filename,
    save
  );
});

/**
 * GET /okx/announcement/new-listings
 * 获取新币上线公告 (快捷接口)
 *
 * Query:
 * - page: string (页码，可选，默认1)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 5次/2秒
 */
router.get('/new-listings', async (req: Request, res: Response) => {
  const page = req.query.page as string | undefined;
  const save = req.query.save === 'true';

  const filename = `announcements_new_listings_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getAnnouncements({ annType: AnnouncementType.NEW_LISTINGS, page }),
    filename,
    save
  );
});

/**
 * GET /okx/announcement/delistings
 * 获取下架公告 (快捷接口)
 *
 * Query:
 * - page: string (页码，可选，默认1)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 5次/2秒
 */
router.get('/delistings', async (req: Request, res: Response) => {
  const page = req.query.page as string | undefined;
  const save = req.query.save === 'true';

  const filename = `announcements_delistings_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getAnnouncements({ annType: AnnouncementType.DELISTINGS, page }),
    filename,
    save
  );
});

/**
 * GET /okx/announcement/api
 * 获取API公告 (快捷接口)
 *
 * Query:
 * - page: string (页码，可选，默认1)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 5次/2秒
 */
router.get('/api', async (req: Request, res: Response) => {
  const page = req.query.page as string | undefined;
  const save = req.query.save === 'true';

  const filename = `announcements_api_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getAnnouncements({ annType: AnnouncementType.API, page }),
    filename,
    save
  );
});

export default router;
