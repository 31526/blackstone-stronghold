import { Router } from 'express';
import accountRoutes from './account.routes';
import contractRoutes from './contract.routes';
import transactionRoutes from './transaction.routes';
import blockRoutes from './block.routes';
import logsRoutes from './logs.routes';
import proxyRoutes from './proxy.routes';
import gasRoutes from './gas.routes';
import statsRoutes from './stats.routes';

const router: Router = Router();

// 挂载子路由
router.use('/account', accountRoutes);
router.use('/contract', contractRoutes);
router.use('/transaction', transactionRoutes);
router.use('/block', blockRoutes);
router.use('/logs', logsRoutes);
router.use('/proxy', proxyRoutes);
router.use('/gas', gasRoutes);
router.use('/stats', statsRoutes);

// 根路由 - 返回 API 概览
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Etherscan API',
    endpoints: {
      account: {
        description: '账户相关接口',
        routes: [
          'GET /account/balance - 获取单个地址的 ETH 余额',
          'GET /account/balancemulti - 获取多个地址的 ETH 余额',
          'GET /account/txlist - 获取普通交易列表',
          'GET /account/txlistinternal - 获取内部交易列表',
          'GET /account/tokentx - 获取 ERC20 代币转账记录',
          'GET /account/tokennfttx - 获取 ERC721 (NFT) 转账记录',
          'GET /account/token1155tx - 获取 ERC1155 代币转账记录',
          'GET /account/getminedblocks - 获取已挖区块列表',
          'GET /account/tokenbalance - 获取 ERC20 代币余额',
        ],
      },
      contract: {
        description: '合约相关接口',
        routes: [
          'GET /contract/getabi - 获取已验证合约的 ABI',
          'GET /contract/getsourcecode - 获取已验证合约的源代码',
          'GET /contract/getcontractcreation - 获取合约创建者和创建交易哈希',
        ],
      },
      transaction: {
        description: '交易相关接口',
        routes: [
          'GET /transaction/getstatus - 检查合约执行状态',
          'GET /transaction/gettxreceiptstatus - 检查交易收据状态',
        ],
      },
      block: {
        description: '区块相关接口',
        routes: [
          'GET /block/getblockreward - 获取区块奖励',
          'GET /block/getblockcountdown - 获取区块倒计时',
          'GET /block/getblocknobytime - 根据时间戳获取区块号',
        ],
      },
      logs: {
        description: '日志相关接口',
        routes: ['GET /logs/getLogs - 获取事件日志'],
      },
      proxy: {
        description: 'Geth/Parity 代理接口',
        routes: [
          'GET /proxy/eth_blockNumber - 获取最新区块号',
          'GET /proxy/eth_getBlockByNumber - 根据区块号获取区块信息',
          'GET /proxy/eth_getBlockTransactionCountByNumber - 获取区块中的交易数量',
          'GET /proxy/eth_getTransactionByHash - 根据交易哈希获取交易详情',
          'GET /proxy/eth_getTransactionCount - 获取地址发送的交易数量',
          'GET /proxy/eth_getTransactionReceipt - 获取交易收据',
          'GET /proxy/eth_call - 执行只读智能合约调用',
          'GET /proxy/eth_getCode - 获取合约字节码',
          'GET /proxy/eth_getStorageAt - 获取合约存储槽的值',
          'GET /proxy/eth_gasPrice - 获取当前 gas 价格',
          'GET /proxy/eth_estimateGas - 估算交易所需 gas',
        ],
      },
      gas: {
        description: 'Gas 追踪接口',
        routes: [
          'GET /gas/gasoracle - 获取预估 Gas 价格',
          'GET /gas/gasestimate - 获取预估确认时间',
        ],
      },
      stats: {
        description: '统计接口',
        routes: [
          'GET /stats/ethsupply - 获取 ETH 总供应量',
          'GET /stats/ethsupply2 - 获取 ETH2 总供应量',
          'GET /stats/ethprice - 获取 ETH 最新价格',
          'GET /stats/nodecount - 获取以太坊节点数量',
          'GET /stats/tokensupply - 获取 ERC20 代币总供应量',
        ],
      },
    },
  });
});

export default router;
