import { Router, Request, Response } from 'express';
import * as etherscanService from '@/services/etherscan.service';

const router: Router = Router();

/**
 * GET /etherscan/logs/getLogs
 * 获取事件日志
 */
router.get('/getLogs', async (req: Request, res: Response) => {
  try {
    const {
      address,
      fromBlock,
      toBlock,
      topic0,
      topic1,
      topic2,
      topic3,
      topic0_1_opr,
      topic0_2_opr,
      topic0_3_opr,
      topic1_2_opr,
      topic1_3_opr,
      topic2_3_opr,
      page,
      offset,
    } = req.query;

    const result = await etherscanService.getLogs({
      address: address as string | undefined,
      fromBlock: fromBlock ? parseInt(fromBlock as string) : undefined,
      toBlock: toBlock as string | undefined,
      topic0: topic0 as string | undefined,
      topic1: topic1 as string | undefined,
      topic2: topic2 as string | undefined,
      topic3: topic3 as string | undefined,
      topic0_1_opr: topic0_1_opr as 'and' | 'or' | undefined,
      topic0_2_opr: topic0_2_opr as 'and' | 'or' | undefined,
      topic0_3_opr: topic0_3_opr as 'and' | 'or' | undefined,
      topic1_2_opr: topic1_2_opr as 'and' | 'or' | undefined,
      topic1_3_opr: topic1_3_opr as 'and' | 'or' | undefined,
      topic2_3_opr: topic2_3_opr as 'and' | 'or' | undefined,
      page: page ? parseInt(page as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

export default router;
