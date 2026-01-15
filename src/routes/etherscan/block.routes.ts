import { Router, Request, Response } from 'express';
import * as etherscanService from '@/services/etherscan.service';

const router: Router = Router();

/**
 * GET /etherscan/block/getblockreward
 * 获取区块奖励
 */
router.get('/getblockreward', async (req: Request, res: Response) => {
  try {
    const { blockno } = req.query;
    if (!blockno) {
      res.status(400).json({ success: false, error: 'blockno 参数必填' });
      return;
    }
    const result = await etherscanService.getBlockReward(parseInt(blockno as string));
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/block/getblockcountdown
 * 获取区块倒计时
 */
router.get('/getblockcountdown', async (req: Request, res: Response) => {
  try {
    const { blockno } = req.query;
    if (!blockno) {
      res.status(400).json({ success: false, error: 'blockno 参数必填' });
      return;
    }
    const result = await etherscanService.getBlockCountdown(parseInt(blockno as string));
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/block/getblocknobytime
 * 根据时间戳获取区块号
 */
router.get('/getblocknobytime', async (req: Request, res: Response) => {
  try {
    const { timestamp, closest } = req.query;
    if (!timestamp || !closest) {
      res.status(400).json({ success: false, error: 'timestamp 和 closest 参数必填' });
      return;
    }
    const result = await etherscanService.getBlockNoByTime(
      parseInt(timestamp as string),
      closest as 'before' | 'after'
    );
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

export default router;
