/**
 * 币安通用接口路由
 */

import { Router, Request, Response } from 'express';
import * as binance from '@/apis/binance/spot';

const router: Router = Router();

/**
 * GET /binance/general/ping
 * 测试连通性
 */
router.get('/ping', async (_req: Request, res: Response) => {
  const result = await binance.ping();
  res.json(result);
});

/**
 * GET /binance/general/time
 * 获取服务器时间
 */
router.get('/time', async (_req: Request, res: Response) => {
  const result = await binance.getServerTime();
  res.json(result);
});

/**
 * GET /binance/general/exchangeInfo
 * 获取交易所信息
 * @query symbol - 单个交易对
 * @query symbols - 多个交易对（JSON数组）
 */
router.get('/exchangeInfo', async (req: Request, res: Response) => {
  const { symbol, symbols } = req.query;

  const params: { symbol?: string; symbols?: string[] } = {};

  if (symbol) {
    params.symbol = symbol as string;
  }
  if (symbols) {
    try {
      params.symbols = JSON.parse(symbols as string);
    } catch {
      params.symbols = (symbols as string).split(',');
    }
  }

  const result = await binance.getExchangeInfo(params);
  res.json(result);
});

export default router;
