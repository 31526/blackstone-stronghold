import { Router, Request, Response } from 'express';
import * as etherscanService from '@/services/etherscan.service';

const router: Router = Router();

/**
 * GET /etherscan/transaction/getstatus
 * 检查合约执行状态
 */
router.get('/getstatus', async (req: Request, res: Response) => {
  try {
    const { txhash } = req.query;
    if (!txhash) {
      res.status(400).json({ success: false, error: 'txhash 参数必填' });
      return;
    }
    const result = await etherscanService.getTxStatus(txhash as string);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/transaction/gettxreceiptstatus
 * 检查交易收据状态
 */
router.get('/gettxreceiptstatus', async (req: Request, res: Response) => {
  try {
    const { txhash } = req.query;
    if (!txhash) {
      res.status(400).json({ success: false, error: 'txhash 参数必填' });
      return;
    }
    const result = await etherscanService.getTxReceiptStatus(txhash as string);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

export default router;
