/**
 * 币安账户接口路由
 */

import { Router, Request, Response } from 'express';
import * as accountApi from '@/apis/binance/account';

const router: Router = Router();

/**
 * GET /binance/account/info
 * 获取账户信息
 * @query omitZeroBalances - 是否忽略零余额 (可选)
 * @query recvWindow - 请求有效期 (可选)
 */
router.get('/info', async (req: Request, res: Response) => {
  const { omitZeroBalances, recvWindow } = req.query;

  const result = await accountApi.getAccount({
    omitZeroBalances: omitZeroBalances === 'true',
    recvWindow: recvWindow ? Number(recvWindow) : undefined,
  });
  res.json(result);
});

/**
 * GET /binance/account/order
 * 查询订单
 * @query symbol - 交易对 (必填)
 * @query orderId - 订单ID (可选)
 * @query origClientOrderId - 客户端订单ID (可选)
 * @query recvWindow - 请求有效期 (可选)
 */
router.get('/order', async (req: Request, res: Response) => {
  const { symbol, orderId, origClientOrderId, recvWindow } = req.query;

  if (!symbol) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 symbol 参数' } });
    return;
  }

  if (!orderId && !origClientOrderId) {
    res.status(400).json({ success: false, error: { code: -1, msg: '需要提供 orderId 或 origClientOrderId' } });
    return;
  }

  const result = await accountApi.getOrder({
    symbol: symbol as string,
    orderId: orderId ? Number(orderId) : undefined,
    origClientOrderId: origClientOrderId as string | undefined,
    recvWindow: recvWindow ? Number(recvWindow) : undefined,
  });
  res.json(result);
});

/**
 * GET /binance/account/openOrders
 * 获取当前挂单
 * @query symbol - 交易对 (可选，不传返回所有)
 * @query recvWindow - 请求有效期 (可选)
 */
router.get('/openOrders', async (req: Request, res: Response) => {
  const { symbol, recvWindow } = req.query;

  const result = await accountApi.getOpenOrders({
    symbol: symbol as string | undefined,
    recvWindow: recvWindow ? Number(recvWindow) : undefined,
  });
  res.json(result);
});

/**
 * GET /binance/account/allOrders
 * 获取所有订单
 * @query symbol - 交易对 (必填)
 * @query orderId - 起始订单ID (可选)
 * @query startTime - 开始时间 (可选)
 * @query endTime - 结束时间 (可选)
 * @query limit - 数量限制 (可选)
 * @query recvWindow - 请求有效期 (可选)
 */
router.get('/allOrders', async (req: Request, res: Response) => {
  const { symbol, orderId, startTime, endTime, limit, recvWindow } = req.query;

  if (!symbol) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 symbol 参数' } });
    return;
  }

  const result = await accountApi.getAllOrders({
    symbol: symbol as string,
    orderId: orderId ? Number(orderId) : undefined,
    startTime: startTime ? Number(startTime) : undefined,
    endTime: endTime ? Number(endTime) : undefined,
    limit: limit ? Number(limit) : undefined,
    recvWindow: recvWindow ? Number(recvWindow) : undefined,
  });
  res.json(result);
});

/**
 * GET /binance/account/trades
 * 获取成交历史
 * @query symbol - 交易对 (必填)
 * @query orderId - 订单ID (可选)
 * @query startTime - 开始时间 (可选)
 * @query endTime - 结束时间 (可选)
 * @query fromId - 起始成交ID (可选)
 * @query limit - 数量限制 (可选)
 * @query recvWindow - 请求有效期 (可选)
 */
router.get('/trades', async (req: Request, res: Response) => {
  const { symbol, orderId, startTime, endTime, fromId, limit, recvWindow } = req.query;

  if (!symbol) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 symbol 参数' } });
    return;
  }

  const result = await accountApi.getMyTrades({
    symbol: symbol as string,
    orderId: orderId ? Number(orderId) : undefined,
    startTime: startTime ? Number(startTime) : undefined,
    endTime: endTime ? Number(endTime) : undefined,
    fromId: fromId ? Number(fromId) : undefined,
    limit: limit ? Number(limit) : undefined,
    recvWindow: recvWindow ? Number(recvWindow) : undefined,
  });
  res.json(result);
});

/**
 * GET /binance/account/rateLimit
 * 查询未成交订单数
 * @query recvWindow - 请求有效期 (可选)
 */
router.get('/rateLimit', async (req: Request, res: Response) => {
  const { recvWindow } = req.query;

  const result = await accountApi.getRateLimitOrder({
    recvWindow: recvWindow ? Number(recvWindow) : undefined,
  });
  res.json(result);
});

/**
 * GET /binance/account/preventedMatches
 * 查询被阻止的匹配
 * @query symbol - 交易对 (必填)
 * @query preventedMatchId - 被阻止的匹配ID (可选)
 * @query orderId - 订单ID (可选)
 * @query fromPreventedMatchId - 起始被阻止匹配ID (可选)
 * @query limit - 数量限制 (可选)
 * @query recvWindow - 请求有效期 (可选)
 */
router.get('/preventedMatches', async (req: Request, res: Response) => {
  const { symbol, preventedMatchId, orderId, fromPreventedMatchId, limit, recvWindow } = req.query;

  if (!symbol) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 symbol 参数' } });
    return;
  }

  const result = await accountApi.getPreventedMatches({
    symbol: symbol as string,
    preventedMatchId: preventedMatchId ? Number(preventedMatchId) : undefined,
    orderId: orderId ? Number(orderId) : undefined,
    fromPreventedMatchId: fromPreventedMatchId ? Number(fromPreventedMatchId) : undefined,
    limit: limit ? Number(limit) : undefined,
    recvWindow: recvWindow ? Number(recvWindow) : undefined,
  });
  res.json(result);
});

/**
 * GET /binance/account/allocations
 * 查询分配
 * @query symbol - 交易对 (必填)
 * @query startTime - 开始时间 (可选)
 * @query endTime - 结束时间 (可选)
 * @query fromAllocationId - 起始分配ID (可选)
 * @query orderId - 订单ID (可选)
 * @query limit - 数量限制 (可选)
 * @query recvWindow - 请求有效期 (可选)
 */
router.get('/allocations', async (req: Request, res: Response) => {
  const { symbol, startTime, endTime, fromAllocationId, orderId, limit, recvWindow } = req.query;

  if (!symbol) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 symbol 参数' } });
    return;
  }

  const result = await accountApi.getAllocations({
    symbol: symbol as string,
    startTime: startTime ? Number(startTime) : undefined,
    endTime: endTime ? Number(endTime) : undefined,
    fromAllocationId: fromAllocationId ? Number(fromAllocationId) : undefined,
    orderId: orderId ? Number(orderId) : undefined,
    limit: limit ? Number(limit) : undefined,
    recvWindow: recvWindow ? Number(recvWindow) : undefined,
  });
  res.json(result);
});

/**
 * GET /binance/account/commission
 * 查询佣金费率
 * @query symbol - 交易对 (必填)
 */
router.get('/commission', async (req: Request, res: Response) => {
  const { symbol } = req.query;

  if (!symbol) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 symbol 参数' } });
    return;
  }

  const result = await accountApi.getCommissionRates({
    symbol: symbol as string,
  });
  res.json(result);
});

/**
 * GET /binance/account/orderAmendments
 * 查询订单修改记录
 * @query symbol - 交易对 (必填)
 * @query orderId - 订单ID (必填)
 * @query fromExecutionId - 起始执行ID (可选)
 * @query limit - 数量限制 (可选)
 * @query recvWindow - 请求有效期 (可选)
 */
router.get('/orderAmendments', async (req: Request, res: Response) => {
  const { symbol, orderId, fromExecutionId, limit, recvWindow } = req.query;

  if (!symbol) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 symbol 参数' } });
    return;
  }

  if (!orderId) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 orderId 参数' } });
    return;
  }

  const result = await accountApi.getOrderAmendments({
    symbol: symbol as string,
    orderId: Number(orderId),
    fromExecutionId: fromExecutionId ? Number(fromExecutionId) : undefined,
    limit: limit ? Number(limit) : undefined,
    recvWindow: recvWindow ? Number(recvWindow) : undefined,
  });
  res.json(result);
});

/**
 * GET /binance/account/filters
 * 查询相关过滤器
 * @query symbol - 交易对 (必填)
 * @query recvWindow - 请求有效期 (可选)
 */
router.get('/filters', async (req: Request, res: Response) => {
  const { symbol, recvWindow } = req.query;

  if (!symbol) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 symbol 参数' } });
    return;
  }

  const result = await accountApi.getMyFilters({
    symbol: symbol as string,
    recvWindow: recvWindow ? Number(recvWindow) : undefined,
  });
  res.json(result);
});

export default router;
