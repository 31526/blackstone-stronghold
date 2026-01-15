import { Router, Request, Response } from 'express';
import * as etherscanService from '@/services/etherscan.service';

const router: Router = Router();

/**
 * GET /etherscan/gas/gasoracle
 * 获取预估 Gas 价格
 */
router.get('/gasoracle', async (_req: Request, res: Response) => {
  try {
    const result = await etherscanService.gasOracle();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/gas/gasestimate
 * 获取预估确认时间
 */
router.get('/gasestimate', async (req: Request, res: Response) => {
  try {
    const { gasprice } = req.query;
    if (!gasprice) {
      res.status(400).json({ success: false, error: 'gasprice 参数必填' });
      return;
    }
    const result = await etherscanService.gasEstimate(parseInt(gasprice as string));
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

export default router;
