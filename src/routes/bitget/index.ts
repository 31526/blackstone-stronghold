/**
 * Bitget 路由模块入口
 * 聚合所有 Bitget 子路由
 */

import { Router } from 'express';
import spotRoutes from './spot.routes';

const router: Router = Router();

// 挂载 Spot 行情路由
router.use('/spot', spotRoutes);

export default router;
