/**
 * 币安交易接口路由
 */

import { Router, Request, Response } from 'express';
import * as binance from '@/apis/binance/spot';
import type { OrderSide, OrderType, TimeInForce, NewOrderRespType } from '@/apis/binance/types';

const router: Router = Router();

/**
 * POST /binance/trade/order
 * 下单
 */
router.post('/order', async (req: Request, res: Response) => {
  const {
    symbol,
    side,
    type,
    timeInForce,
    quantity,
    quoteOrderQty,
    price,
    newClientOrderId,
    stopPrice,
    icebergQty,
    newOrderRespType,
  } = req.body;

  if (!symbol || !side || !type) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少必填参数: symbol, side, type' } });
    return;
  }

  const result = await binance.createOrder({
    symbol,
    side: side as OrderSide,
    type: type as OrderType,
    timeInForce: timeInForce as TimeInForce,
    quantity,
    quoteOrderQty,
    price,
    newClientOrderId,
    stopPrice,
    icebergQty,
    newOrderRespType: newOrderRespType as NewOrderRespType,
  });
  res.json(result);
});

/**
 * POST /binance/trade/order/test
 * 测试下单（不实际下单）
 */
router.post('/order/test', async (req: Request, res: Response) => {
  const {
    symbol,
    side,
    type,
    timeInForce,
    quantity,
    quoteOrderQty,
    price,
    newClientOrderId,
    stopPrice,
    icebergQty,
    newOrderRespType,
  } = req.body;

  if (!symbol || !side || !type) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少必填参数: symbol, side, type' } });
    return;
  }

  const result = await binance.testOrder({
    symbol,
    side: side as OrderSide,
    type: type as OrderType,
    timeInForce: timeInForce as TimeInForce,
    quantity,
    quoteOrderQty,
    price,
    newClientOrderId,
    stopPrice,
    icebergQty,
    newOrderRespType: newOrderRespType as NewOrderRespType,
  });
  res.json(result);
});

/**
 * DELETE /binance/trade/order
 * 撤单
 */
router.delete('/order', async (req: Request, res: Response) => {
  const { symbol, orderId, origClientOrderId } = req.query;

  if (!symbol) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 symbol 参数' } });
    return;
  }

  if (!orderId && !origClientOrderId) {
    res.status(400).json({ success: false, error: { code: -1, msg: '需要 orderId 或 origClientOrderId' } });
    return;
  }

  const result = await binance.cancelOrder({
    symbol: symbol as string,
    orderId: orderId ? Number(orderId) : undefined,
    origClientOrderId: origClientOrderId as string,
  });
  res.json(result);
});

/**
 * DELETE /binance/trade/openOrders
 * 撤销所有挂单
 */
router.delete('/openOrders', async (req: Request, res: Response) => {
  const { symbol } = req.query;

  if (!symbol) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 symbol 参数' } });
    return;
  }

  const result = await binance.cancelAllOrders(symbol as string);
  res.json(result);
});

/**
 * GET /binance/trade/order
 * 查询订单
 */
router.get('/order', async (req: Request, res: Response) => {
  const { symbol, orderId, origClientOrderId } = req.query;

  if (!symbol) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 symbol 参数' } });
    return;
  }

  if (!orderId && !origClientOrderId) {
    res.status(400).json({ success: false, error: { code: -1, msg: '需要 orderId 或 origClientOrderId' } });
    return;
  }

  const result = await binance.getOrder({
    symbol: symbol as string,
    orderId: orderId ? Number(orderId) : undefined,
    origClientOrderId: origClientOrderId as string,
  });
  res.json(result);
});

/**
 * GET /binance/trade/openOrders
 * 获取当前挂单
 */
router.get('/openOrders', async (req: Request, res: Response) => {
  const { symbol } = req.query;

  const result = await binance.getOpenOrders({
    symbol: symbol as string,
  });
  res.json(result);
});

/**
 * GET /binance/trade/allOrders
 * 获取所有订单
 */
router.get('/allOrders', async (req: Request, res: Response) => {
  const { symbol, orderId, startTime, endTime, limit } = req.query;

  if (!symbol) {
    res.status(400).json({ success: false, error: { code: -1, msg: '缺少 symbol 参数' } });
    return;
  }

  const result = await binance.getAllOrders({
    symbol: symbol as string,
    orderId: orderId ? Number(orderId) : undefined,
    startTime: startTime ? Number(startTime) : undefined,
    endTime: endTime ? Number(endTime) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  res.json(result);
});

export default router;
