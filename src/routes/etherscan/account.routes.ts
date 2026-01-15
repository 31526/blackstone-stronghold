import { Router, Request, Response } from 'express';
import * as etherscanService from '@/services/etherscan.service';

const router: Router = Router();

/**
 * GET /etherscan/account/balance
 * 获取单个地址的 ETH 余额
 */
router.get('/balance', async (req: Request, res: Response) => {
  try {
    const { address, tag = 'latest' } = req.query;
    if (!address) {
      res.status(400).json({ success: false, error: 'address 参数必填' });
      return;
    }
    const result = await etherscanService.getBalance(address as string, tag as string);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/account/balancemulti
 * 获取多个地址的 ETH 余额
 */
router.get('/balancemulti', async (req: Request, res: Response) => {
  try {
    const { address, tag = 'latest' } = req.query;
    if (!address) {
      res.status(400).json({ success: false, error: 'address 参数必填' });
      return;
    }
    const addresses = (address as string).split(',');
    const result = await etherscanService.getBalanceMulti(addresses, tag as string);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/account/txlist
 * 获取普通交易列表
 */
router.get('/txlist', async (req: Request, res: Response) => {
  try {
    const { address, startblock, endblock, page, offset, sort } = req.query;
    if (!address) {
      res.status(400).json({ success: false, error: 'address 参数必填' });
      return;
    }
    const result = await etherscanService.getTxList(address as string, {
      startblock: startblock ? parseInt(startblock as string) : undefined,
      endblock: endblock ? parseInt(endblock as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      sort: sort as 'asc' | 'desc' | undefined,
    });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/account/txlistinternal
 * 获取内部交易列表
 */
router.get('/txlistinternal', async (req: Request, res: Response) => {
  try {
    const { address, txhash, startblock, endblock, page, offset, sort } = req.query;

    if (txhash) {
      const result = await etherscanService.getTxListInternalByHash(txhash as string);
      res.json({ success: true, result });
      return;
    }

    if (!address) {
      res.status(400).json({ success: false, error: 'address 或 txhash 参数必填' });
      return;
    }

    const result = await etherscanService.getTxListInternal(address as string, {
      startblock: startblock ? parseInt(startblock as string) : undefined,
      endblock: endblock ? parseInt(endblock as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      sort: sort as 'asc' | 'desc' | undefined,
    });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/account/tokentx
 * 获取 ERC20 代币转账记录
 */
router.get('/tokentx', async (req: Request, res: Response) => {
  try {
    const { address, contractaddress, startblock, endblock, page, offset, sort } = req.query;
    if (!address && !contractaddress) {
      res.status(400).json({ success: false, error: 'address 或 contractaddress 参数至少需要一个' });
      return;
    }
    const result = await etherscanService.getTokenTx({
      address: address as string | undefined,
      contractaddress: contractaddress as string | undefined,
      startblock: startblock ? parseInt(startblock as string) : undefined,
      endblock: endblock ? parseInt(endblock as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      sort: sort as 'asc' | 'desc' | undefined,
    });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/account/tokennfttx
 * 获取 ERC721 (NFT) 转账记录
 */
router.get('/tokennfttx', async (req: Request, res: Response) => {
  try {
    const { address, contractaddress, startblock, endblock, page, offset, sort } = req.query;
    if (!address && !contractaddress) {
      res.status(400).json({ success: false, error: 'address 或 contractaddress 参数至少需要一个' });
      return;
    }
    const result = await etherscanService.getTokenNftTx({
      address: address as string | undefined,
      contractaddress: contractaddress as string | undefined,
      startblock: startblock ? parseInt(startblock as string) : undefined,
      endblock: endblock ? parseInt(endblock as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      sort: sort as 'asc' | 'desc' | undefined,
    });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/account/token1155tx
 * 获取 ERC1155 代币转账记录
 */
router.get('/token1155tx', async (req: Request, res: Response) => {
  try {
    const { address, contractaddress, startblock, endblock, page, offset, sort } = req.query;
    if (!address && !contractaddress) {
      res.status(400).json({ success: false, error: 'address 或 contractaddress 参数至少需要一个' });
      return;
    }
    const result = await etherscanService.getToken1155Tx({
      address: address as string | undefined,
      contractaddress: contractaddress as string | undefined,
      startblock: startblock ? parseInt(startblock as string) : undefined,
      endblock: endblock ? parseInt(endblock as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      sort: sort as 'asc' | 'desc' | undefined,
    });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/account/getminedblocks
 * 获取已挖区块列表
 */
router.get('/getminedblocks', async (req: Request, res: Response) => {
  try {
    const { address, blocktype, page, offset } = req.query;
    if (!address) {
      res.status(400).json({ success: false, error: 'address 参数必填' });
      return;
    }
    const result = await etherscanService.getMinedBlocks(address as string, {
      blocktype: blocktype as 'blocks' | 'uncles' | undefined,
      page: page ? parseInt(page as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

/**
 * GET /etherscan/account/tokenbalance
 * 获取 ERC20 代币余额
 */
router.get('/tokenbalance', async (req: Request, res: Response) => {
  try {
    const { contractaddress, address, tag = 'latest' } = req.query;
    if (!contractaddress || !address) {
      res.status(400).json({ success: false, error: 'contractaddress 和 address 参数必填' });
      return;
    }
    const result = await etherscanService.getTokenBalance(
      contractaddress as string,
      address as string,
      tag as string
    );
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : '未知错误' });
  }
});

export default router;
