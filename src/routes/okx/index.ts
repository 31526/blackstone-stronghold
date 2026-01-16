/**
 * OKX 路由模块入口
 * 聚合所有 OKX 子路由
 */

import { Router } from 'express';
import spotRoutes from './spot.routes';
import announcementRoutes from './announcement.routes';
import tradingDataRoutes from './trading-data.routes';
import accountRoutes from './account.routes';

const router: Router = Router();

// 挂载 Spot 行情路由
router.use('/spot', spotRoutes);

// 挂载 Announcement 公告路由
router.use('/announcement', announcementRoutes);

// 挂载 Trading Data 交易大数据路由
router.use('/trading-data', tradingDataRoutes);

// 挂载 Account 账户路由
router.use('/account', accountRoutes);

export default router;
