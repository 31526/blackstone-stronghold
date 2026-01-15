/**
 * 币安行情接口路由
 */

import { Router, Request, Response } from 'express';
import * as binance from '@/apis/binance/spot';
import type { KlineInterval, TickerType } from '@/apis/binance/types';

const router: Router = Router();

/**
 * GET /binance/market/depth
 * 获取深度信息
 * @query symbol - 交易对 (必填)
 * @query limit - 数量限制 (可选)
 */
router.get('/depth', async (req: Request, res: Response) => {
  const { symbol, limit } = req.query;

  if (!symbol) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 symbol 参数' } });
    return;
  }

  const result = await binance.getDepth({
    symbol: symbol as string,
    limit: limit ? Number(limit) : undefined,
  });
  res.json(result);
});

/**
 * GET /binance/market/trades
 * 获取近期成交
 * @query symbol - 交易对 (必填)
 * @query limit - 数量限制 (可选)
 */
router.get('/trades', async (req: Request, res: Response) => {
  const { symbol, limit } = req.query;

  if (!symbol) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 symbol 参数' } });
    return;
  }

  const result = await binance.getTrades({
    symbol: symbol as string,
    limit: limit ? Number(limit) : undefined,
  });
  res.json(result);
});

/**
 * GET /binance/market/historicalTrades
 * 获取历史成交（需要API Key）
 * @query symbol - 交易对 (必填)
 * @query limit - 数量限制 (可选)
 * @query fromId - 起始交易ID (可选)
 */
router.get('/historicalTrades', async (req: Request, res: Response) => {
  const { symbol, limit, fromId } = req.query;

  if (!symbol) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 symbol 参数' } });
    return;
  }

  const result = await binance.getHistoricalTrades({
    symbol: symbol as string,
    limit: limit ? Number(limit) : undefined,
    fromId: fromId ? Number(fromId) : undefined,
  });
  res.json(result);
});

/**
 * GET /binance/market/aggTrades
 * 获取聚合交易
 * @query symbol - 交易对 (必填)
 * @query fromId - 起始ID (可选)
 * @query startTime - 开始时间 (可选)
 * @query endTime - 结束时间 (可选)
 * @query limit - 数量限制 (可选)
 */
router.get('/aggTrades', async (req: Request, res: Response) => {
  const { symbol, fromId, startTime, endTime, limit } = req.query;

  if (!symbol) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 symbol 参数' } });
    return;
  }

  const result = await binance.getAggTrades({
    symbol: symbol as string,
    fromId: fromId ? Number(fromId) : undefined,
    startTime: startTime ? Number(startTime) : undefined,
    endTime: endTime ? Number(endTime) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  res.json(result);
});

/**
 * GET /binance/market/klines
 * 获取K线数据
 * @query symbol - 交易对 (必填)
 * @query interval - K线间隔 (必填)
 * @query startTime - 开始时间 (可选)
 * @query endTime - 结束时间 (可选)
 * @query timeZone - 时区 (可选)
 * @query limit - 数量限制 (可选)
 */
router.get('/klines', async (req: Request, res: Response) => {
  const { symbol, interval, startTime, endTime, timeZone, limit } = req.query;

  if (!symbol || !interval) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 symbol 或 interval 参数' } });
    return;
  }

  const result = await binance.getKlines({
    symbol: symbol as string,
    interval: interval as KlineInterval,
    startTime: startTime ? Number(startTime) : undefined,
    endTime: endTime ? Number(endTime) : undefined,
    timeZone: timeZone as string,
    limit: limit ? Number(limit) : undefined,
  });
  res.json(result);
});

/**
 * GET /binance/market/uiKlines
 * 获取UI优化K线数据
 * @query symbol - 交易对 (必填)
 * @query interval - K线间隔 (必填)
 * @query startTime - 开始时间 (可选)
 * @query endTime - 结束时间 (可选)
 * @query timeZone - 时区 (可选)
 * @query limit - 数量限制 (可选)
 */
router.get('/uiKlines', async (req: Request, res: Response) => {
  const { symbol, interval, startTime, endTime, timeZone, limit } = req.query;

  if (!symbol || !interval) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 symbol 或 interval 参数' } });
    return;
  }

  const result = await binance.getUIKlines({
    symbol: symbol as string,
    interval: interval as KlineInterval,
    startTime: startTime ? Number(startTime) : undefined,
    endTime: endTime ? Number(endTime) : undefined,
    timeZone: timeZone as string,
    limit: limit ? Number(limit) : undefined,
  });
  res.json(result);
});

/**
 * GET /binance/market/avgPrice
 * 获取当前平均价格
 * @query symbol - 交易对 (必填)
 */
router.get('/avgPrice', async (req: Request, res: Response) => {
  const { symbol } = req.query;

  if (!symbol) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 symbol 参数' } });
    return;
  }

  const result = await binance.getAvgPrice({
    symbol: symbol as string,
  });
  res.json(result);
});

/**
 * GET /binance/market/ticker/24hr
 * 获取24小时价格变动
 * @query symbol - 单个交易对 (可选)
 * @query symbols - 多个交易对 (可选)
 * @query type - FULL 或 MINI (可选)
 */
router.get('/ticker/24hr', async (req: Request, res: Response) => {
  const { symbol, symbols, type } = req.query;

  const params: { symbol?: string; symbols?: string[]; type?: TickerType } = {};

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
  if (type) {
    params.type = type as TickerType;
  }

  const result = await binance.getTicker24hr(params);
  res.json(result);
});

/**
 * GET /binance/market/ticker/tradingDay
 * 获取交易日行情
 * @query symbol - 单个交易对 (可选)
 * @query symbols - 多个交易对 (可选)
 * @query timeZone - 时区 (可选)
 * @query type - FULL 或 MINI (可选)
 */
router.get('/ticker/tradingDay', async (req: Request, res: Response) => {
  const { symbol, symbols, timeZone, type } = req.query;

  const params: { symbol?: string; symbols?: string[]; timeZone?: string; type?: TickerType } = {};

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
  if (timeZone) {
    params.timeZone = timeZone as string;
  }
  if (type) {
    params.type = type as TickerType;
  }

  const result = await binance.getTradingDayTicker(params);
  res.json(result);
});

/**
 * GET /binance/market/ticker/price
 * 获取最新价格
 * @query symbol - 单个交易对 (可选)
 * @query symbols - 多个交易对 (可选)
 */
router.get('/ticker/price', async (req: Request, res: Response) => {
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

  const result = await binance.getPriceTicker(params);
  res.json(result);
});

/**
 * GET /binance/market/ticker/bookTicker
 * 获取最优挂单
 * @query symbol - 单个交易对 (可选)
 * @query symbols - 多个交易对 (可选)
 */
router.get('/ticker/bookTicker', async (req: Request, res: Response) => {
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

  const result = await binance.getBookTicker(params);
  res.json(result);
});

/**
 * GET /binance/market/ticker
 * 获取滚动窗口价格变动
 * @query symbol - 单个交易对 (可选)
 * @query symbols - 多个交易对 (可选)
 * @query windowSize - 窗口大小 (可选)
 * @query type - FULL 或 MINI (可选)
 */
router.get('/ticker', async (req: Request, res: Response) => {
  const { symbol, symbols, windowSize, type } = req.query;

  const params: { symbol?: string; symbols?: string[]; windowSize?: string; type?: TickerType } = {};

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
  if (windowSize) {
    params.windowSize = windowSize as string;
  }
  if (type) {
    params.type = type as TickerType;
  }

  const result = await binance.getRollingTicker(params);
  res.json(result);
});

export default router;
