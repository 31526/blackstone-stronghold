import { Router, Request, Response } from 'express';
import * as etherscanService from '@/services/etherscan.service';

const router: Router = Router();

/**
 * GET /etherscan/contract/getabi
 * 获取已验证合约的 ABI
 */
router.get('/getabi', async (req: Request, res: Response) => {
  try {
    const { address } = req.query;
    if (!address) {
      res.status(400).json({ success: false, error: 'address 参数必填' });
      return;
    }
    const result = await etherscanService.getAbi(address as string);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/contract/getsourcecode
 * 获取已验证合约的源代码
 */
router.get('/getsourcecode', async (req: Request, res: Response) => {
  try {
    const { address } = req.query;
    if (!address) {
      res.status(400).json({ success: false, error: 'address 参数必填' });
      return;
    }
    const result = await etherscanService.getSourceCode(address as string);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/contract/getcontractcreation
 * 获取合约创建者和创建交易哈希
 */
router.get('/getcontractcreation', async (req: Request, res: Response) => {
  try {
    const { contractaddresses } = req.query;
    if (!contractaddresses) {
      res.status(400).json({ success: false, error: 'contractaddresses 参数必填' });
      return;
    }
    const addresses = (contractaddresses as string).split(',');
    const result = await etherscanService.getContractCreation(addresses);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

export default router;
