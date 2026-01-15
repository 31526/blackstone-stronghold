/**
 * 币安用户数据流接口路由
 */

import { Router, Request, Response } from 'express';
import * as binance from '@/apis/binance/spot';

const router: Router = Router();

/**
 * POST /binance/stream/listenKey
 * 创建 ListenKey
 */
router.post('/listenKey', async (_req: Request, res: Response) => {
  const result = await binance.createListenKey();
  res.json(result);
});

/**
 * PUT /binance/stream/listenKey
 * 延长 ListenKey 有效期
 * @query listenKey - ListenKey (必填)
 */
router.put('/listenKey', async (req: Request, res: Response) => {
  const { listenKey } = req.query;

  if (!listenKey) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 listenKey 参数' } });
    return;
  }

  const result = await binance.keepaliveListenKey(listenKey as string);
  res.json(result);
});

/**
 * DELETE /binance/stream/listenKey
 * 关闭 ListenKey
 * @query listenKey - ListenKey (必填)
 */
router.delete('/listenKey', async (req: Request, res: Response) => {
  const { listenKey } = req.query;

  if (!listenKey) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 listenKey 参数' } });
    return;
  }

  const result = await binance.closeListenKey(listenKey as string);
  res.json(result);
});

export default router;
