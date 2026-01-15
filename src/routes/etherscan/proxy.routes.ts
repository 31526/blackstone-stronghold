import { Router, Request, Response } from 'express';
import * as etherscanService from '@/services/etherscan.service';

const router: Router = Router();

/**
 * GET /etherscan/proxy/eth_blockNumber
 * 获取最新区块号
 */
router.get('/eth_blockNumber', async (_req: Request, res: Response) => {
  try {
    const result = await etherscanService.ethBlockNumber();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/proxy/eth_getBlockByNumber
 * 根据区块号获取区块信息
 */
router.get('/eth_getBlockByNumber', async (req: Request, res: Response) => {
  try {
    const { tag, boolean = 'true' } = req.query;
    if (!tag) {
      res.status(400).json({ success: false, error: 'tag 参数必填' });
      return;
    }
    const result = await etherscanService.ethGetBlockByNumber(tag as string, boolean === 'true');
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/proxy/eth_getBlockTransactionCountByNumber
 * 获取区块中的交易数量
 */
router.get('/eth_getBlockTransactionCountByNumber', async (req: Request, res: Response) => {
  try {
    const { tag } = req.query;
    if (!tag) {
      res.status(400).json({ success: false, error: 'tag 参数必填' });
      return;
    }
    const result = await etherscanService.ethGetBlockTransactionCountByNumber(tag as string);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/proxy/eth_getTransactionByHash
 * 根据交易哈希获取交易详情
 */
router.get('/eth_getTransactionByHash', async (req: Request, res: Response) => {
  try {
    const { txhash } = req.query;
    if (!txhash) {
      res.status(400).json({ success: false, error: 'txhash 参数必填' });
      return;
    }
    const result = await etherscanService.ethGetTransactionByHash(txhash as string);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/proxy/eth_getTransactionCount
 * 获取地址发送的交易数量（nonce）
 */
router.get('/eth_getTransactionCount', async (req: Request, res: Response) => {
  try {
    const { address, tag = 'latest' } = req.query;
    if (!address) {
      res.status(400).json({ success: false, error: 'address 参数必填' });
      return;
    }
    const result = await etherscanService.ethGetTransactionCount(address as string, tag as string);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/proxy/eth_getTransactionReceipt
 * 获取交易收据
 */
router.get('/eth_getTransactionReceipt', async (req: Request, res: Response) => {
  try {
    const { txhash } = req.query;
    if (!txhash) {
      res.status(400).json({ success: false, error: 'txhash 参数必填' });
      return;
    }
    const result = await etherscanService.ethGetTransactionReceipt(txhash as string);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/proxy/eth_call
 * 执行只读智能合约调用
 */
router.get('/eth_call', async (req: Request, res: Response) => {
  try {
    const { to, data, tag = 'latest' } = req.query;
    if (!to || !data) {
      res.status(400).json({ success: false, error: 'to 和 data 参数必填' });
      return;
    }
    const result = await etherscanService.ethCall(to as string, data as string, tag as string);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/proxy/eth_getCode
 * 获取合约字节码
 */
router.get('/eth_getCode', async (req: Request, res: Response) => {
  try {
    const { address, tag = 'latest' } = req.query;
    if (!address) {
      res.status(400).json({ success: false, error: 'address 参数必填' });
      return;
    }
    const result = await etherscanService.ethGetCode(address as string, tag as string);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/proxy/eth_getStorageAt
 * 获取合约存储槽的值
 */
router.get('/eth_getStorageAt', async (req: Request, res: Response) => {
  try {
    const { address, position, tag = 'latest' } = req.query;
    if (!address || !position) {
      res.status(400).json({ success: false, error: 'address 和 position 参数必填' });
      return;
    }
    const result = await etherscanService.ethGetStorageAt(address as string, position as string, tag as string);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/proxy/eth_gasPrice
 * 获取当前 gas 价格
 */
router.get('/eth_gasPrice', async (_req: Request, res: Response) => {
  try {
    const result = await etherscanService.ethGasPrice();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/proxy/eth_estimateGas
 * 估算交易所需 gas
 */
router.get('/eth_estimateGas', async (req: Request, res: Response) => {
  try {
    const { to, data, value, gasPrice, gas } = req.query;
    if (!to) {
      res.status(400).json({ success: false, error: 'to 参数必填' });
      return;
    }
    const result = await etherscanService.ethEstimateGas({
      to: to as string,
      data: data as string | undefined,
      value: value as string | undefined,
      gasPrice: gasPrice as string | undefined,
      gas: gas as string | undefined,
    });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

export default router;
