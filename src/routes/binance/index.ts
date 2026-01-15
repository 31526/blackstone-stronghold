/**
 * 币安 API 路由主入口
 * 整合所有子路由模块
 */

import { Router } from 'express';
import generalRoutes from './general.routes';
import marketRoutes from './market.routes';
import tradeRoutes from './trade.routes';
import accountRoutes from './account.routes';
import streamRoutes from './stream.routes';

const router: Router = Router();

// 注册子路由
router.use('/general', generalRoutes);  // 通用接口: /binance/general/...
router.use('/market', marketRoutes);    // 行情接口: /binance/market/...
router.use('/trade', tradeRoutes);      // 交易接口: /binance/trade/...
router.use('/account', accountRoutes);  // 账户接口: /binance/account/...
router.use('/stream', streamRoutes);    // 数据流接口: /binance/stream/...

export default router;
