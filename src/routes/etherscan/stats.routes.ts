import { Router, Request, Response } from 'express';
import * as etherscanService from '@/services/etherscan.service';

const router: Router = Router();

/**
 * GET /etherscan/stats/ethsupply
 * 获取 ETH 总供应量
 */
router.get('/ethsupply', async (_req: Request, res: Response) => {
  try {
    const result = await etherscanService.getEthSupply();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/stats/ethsupply2
 * 获取 ETH2 总供应量
 */
router.get('/ethsupply2', async (_req: Request, res: Response) => {
  try {
    const result = await etherscanService.getEthSupply2();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/stats/ethprice
 * 获取 ETH 最新价格
 */
router.get('/ethprice', async (_req: Request, res: Response) => {
  try {
    const result = await etherscanService.getEthPrice();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/stats/nodecount
 * 获取以太坊节点数量
 */
router.get('/nodecount', async (_req: Request, res: Response) => {
  try {
    const result = await etherscanService.getNodeCount();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/stats/tokensupply
 * 获取 ERC20 代币总供应量
 */
router.get('/tokensupply', async (req: Request, res: Response) => {
  try {
    const { contractaddress } = req.query;
    if (!contractaddress) {
      res.status(400).json({ success: false, error: 'contractaddress 参数必填' });
      return;
    }
    const result = await etherscanService.getTokenSupply(contractaddress as string);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

export default router;
