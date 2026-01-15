import axios, { AxiosInstance } from 'axios';

// Etherscan API V2 配置
const BASE_URL = 'https://api.etherscan.io/v2/api';
const DEFAULT_CHAIN_ID = 1; // 以太坊主网

// 创建 axios 实例
const createClient = (): AxiosInstance => {
  const apiKey = process.env.EVM_VERIFY_KEY;
  if (!apiKey) {
    throw new Error('EVM_VERIFY_KEY 环境变量未设置');
  }

  return axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
  });
};

// 获取 API Key
const getApiKey = (): string => {
  const apiKey = process.env.EVM_VERIFY_KEY;
  if (!apiKey) {
    throw new Error('EVM_VERIFY_KEY 环境变量未设置');
  }
  return apiKey;
};

// Etherscan API 响应结构
export interface EtherscanResponse<T = unknown> {
  status: string;
  message: string;
  result: T;
}

// 通用请求函数
export async function etherscanRequest<T = unknown>(
  module: string,
  action: string,
  params: Record<string, string | number | undefined> = {},
  chainId: number = DEFAULT_CHAIN_ID
): Promise<EtherscanResponse<T>> {
  const client = createClient();
  const apiKey = getApiKey();

  // 过滤掉 undefined 的参数
  const filteredParams: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      filteredParams[key] = value;
    }
  }

  const response = await client.get<EtherscanResponse<T>>('', {
    params: {
      chainid: chainId,
      module,
      action,
      ...filteredParams,
      apikey: apiKey,
    },
  });

  return response.data;
}

// ==================== Account API ====================

// 获取单个地址的 ETH 余额
export async function getBalance(address: string, tag: string = 'latest') {
  return etherscanRequest<string>('account', 'balance', { address, tag });
}

// 获取多个地址的 ETH 余额
export async function getBalanceMulti(addresses: string[], tag: string = 'latest') {
  return etherscanRequest<Array<{ account: string; balance: string }>>(
    'account',
    'balancemulti',
    { address: addresses.join(','), tag }
  );
}

// 获取普通交易列表
export async function getTxList(
  address: string,
  options: {
    startblock?: number;
    endblock?: number;
    page?: number;
    offset?: number;
    sort?: 'asc' | 'desc';
  } = {}
) {
  return etherscanRequest('account', 'txlist', {
    address,
    startblock: options.startblock ?? 0,
    endblock: options.endblock ?? 99999999,
    page: options.page ?? 1,
    offset: options.offset ?? 10,
    sort: options.sort ?? 'asc',
  });
}

// 获取内部交易列表
export async function getTxListInternal(
  address: string,
  options: {
    startblock?: number;
    endblock?: number;
    page?: number;
    offset?: number;
    sort?: 'asc' | 'desc';
  } = {}
) {
  return etherscanRequest('account', 'txlistinternal', {
    address,
    startblock: options.startblock ?? 0,
    endblock: options.endblock ?? 99999999,
    page: options.page ?? 1,
    offset: options.offset ?? 10,
    sort: options.sort ?? 'asc',
  });
}

// 根据交易哈希获取内部交易
export async function getTxListInternalByHash(txhash: string) {
  return etherscanRequest('account', 'txlistinternal', { txhash });
}

// 获取 ERC20 代币转账记录
export async function getTokenTx(
  options: {
    address?: string;
    contractaddress?: string;
    startblock?: number;
    endblock?: number;
    page?: number;
    offset?: number;
    sort?: 'asc' | 'desc';
  } = {}
) {
  return etherscanRequest('account', 'tokentx', {
    address: options.address,
    contractaddress: options.contractaddress,
    startblock: options.startblock ?? 0,
    endblock: options.endblock ?? 99999999,
    page: options.page ?? 1,
    offset: options.offset ?? 100,
    sort: options.sort ?? 'asc',
  });
}

// 获取 ERC721 (NFT) 转账记录
export async function getTokenNftTx(
  options: {
    address?: string;
    contractaddress?: string;
    startblock?: number;
    endblock?: number;
    page?: number;
    offset?: number;
    sort?: 'asc' | 'desc';
  } = {}
) {
  return etherscanRequest('account', 'tokennfttx', {
    address: options.address,
    contractaddress: options.contractaddress,
    startblock: options.startblock ?? 0,
    endblock: options.endblock ?? 99999999,
    page: options.page ?? 1,
    offset: options.offset ?? 100,
    sort: options.sort ?? 'asc',
  });
}

// 获取 ERC1155 代币转账记录
export async function getToken1155Tx(
  options: {
    address?: string;
    contractaddress?: string;
    startblock?: number;
    endblock?: number;
    page?: number;
    offset?: number;
    sort?: 'asc' | 'desc';
  } = {}
) {
  return etherscanRequest('account', 'token1155tx', {
    address: options.address,
    contractaddress: options.contractaddress,
    startblock: options.startblock ?? 0,
    endblock: options.endblock ?? 99999999,
    page: options.page ?? 1,
    offset: options.offset ?? 100,
    sort: options.sort ?? 'asc',
  });
}

// 获取已挖区块列表
export async function getMinedBlocks(
  address: string,
  options: {
    blocktype?: 'blocks' | 'uncles';
    page?: number;
    offset?: number;
  } = {}
) {
  return etherscanRequest('account', 'getminedblocks', {
    address,
    blocktype: options.blocktype ?? 'blocks',
    page: options.page ?? 1,
    offset: options.offset ?? 10,
  });
}

// 获取 ERC20 代币余额
export async function getTokenBalance(contractaddress: string, address: string, tag: string = 'latest') {
  return etherscanRequest<string>('account', 'tokenbalance', { contractaddress, address, tag });
}

// ==================== Contract API ====================

// 获取已验证合约的 ABI
export async function getAbi(address: string) {
  return etherscanRequest<string>('contract', 'getabi', { address });
}

// 获取已验证合约的源代码
export async function getSourceCode(address: string) {
  return etherscanRequest('contract', 'getsourcecode', { address });
}

// 获取合约创建者和创建交易哈希
export async function getContractCreation(contractaddresses: string[]) {
  return etherscanRequest('contract', 'getcontractcreation', {
    contractaddresses: contractaddresses.join(','),
  });
}

// ==================== Transaction API ====================

// 检查合约执行状态
export async function getTxStatus(txhash: string) {
  return etherscanRequest<{ isError: string; errDescription: string }>('transaction', 'getstatus', { txhash });
}

// 检查交易收据状态
export async function getTxReceiptStatus(txhash: string) {
  return etherscanRequest<{ status: string }>('transaction', 'gettxreceiptstatus', { txhash });
}

// ==================== Block API ====================

// 获取区块奖励
export async function getBlockReward(blockno: number) {
  return etherscanRequest('block', 'getblockreward', { blockno });
}

// 获取区块倒计时
export async function getBlockCountdown(blockno: number) {
  return etherscanRequest('block', 'getblockcountdown', { blockno });
}

// 根据时间戳获取区块号
export async function getBlockNoByTime(timestamp: number, closest: 'before' | 'after') {
  return etherscanRequest('block', 'getblocknobytime', { timestamp, closest });
}

// ==================== Logs API ====================

// 获取事件日志
export async function getLogs(
  options: {
    address?: string;
    fromBlock?: number | string;
    toBlock?: number | string;
    topic0?: string;
    topic1?: string;
    topic2?: string;
    topic3?: string;
    topic0_1_opr?: 'and' | 'or';
    topic0_2_opr?: 'and' | 'or';
    topic0_3_opr?: 'and' | 'or';
    topic1_2_opr?: 'and' | 'or';
    topic1_3_opr?: 'and' | 'or';
    topic2_3_opr?: 'and' | 'or';
    page?: number;
    offset?: number;
  } = {}
) {
  return etherscanRequest('logs', 'getLogs', {
    address: options.address,
    fromBlock: options.fromBlock ?? 0,
    toBlock: options.toBlock ?? 'latest',
    topic0: options.topic0,
    topic1: options.topic1,
    topic2: options.topic2,
    topic3: options.topic3,
    topic0_1_opr: options.topic0_1_opr,
    topic0_2_opr: options.topic0_2_opr,
    topic0_3_opr: options.topic0_3_opr,
    topic1_2_opr: options.topic1_2_opr,
    topic1_3_opr: options.topic1_3_opr,
    topic2_3_opr: options.topic2_3_opr,
    page: options.page ?? 1,
    offset: options.offset ?? 1000,
  });
}

// ==================== Proxy API ====================

// 获取最新区块号
export async function ethBlockNumber() {
  return etherscanRequest<string>('proxy', 'eth_blockNumber', {});
}

// 根据区块号获取区块信息
export async function ethGetBlockByNumber(tag: string, boolean: boolean = true) {
  return etherscanRequest('proxy', 'eth_getBlockByNumber', { tag, boolean: boolean.toString() });
}

// 获取区块中的交易数量
export async function ethGetBlockTransactionCountByNumber(tag: string) {
  return etherscanRequest<string>('proxy', 'eth_getBlockTransactionCountByNumber', { tag });
}

// 根据交易哈希获取交易详情
export async function ethGetTransactionByHash(txhash: string) {
  return etherscanRequest('proxy', 'eth_getTransactionByHash', { txhash });
}

// 获取地址发送的交易数量（nonce）
export async function ethGetTransactionCount(address: string, tag: string = 'latest') {
  return etherscanRequest<string>('proxy', 'eth_getTransactionCount', { address, tag });
}

// 获取交易收据
export async function ethGetTransactionReceipt(txhash: string) {
  return etherscanRequest('proxy', 'eth_getTransactionReceipt', { txhash });
}

// 执行只读智能合约调用
export async function ethCall(to: string, data: string, tag: string = 'latest') {
  return etherscanRequest<string>('proxy', 'eth_call', { to, data, tag });
}

// 获取合约字节码
export async function ethGetCode(address: string, tag: string = 'latest') {
  return etherscanRequest<string>('proxy', 'eth_getCode', { address, tag });
}

// 获取合约存储槽的值
export async function ethGetStorageAt(address: string, position: string, tag: string = 'latest') {
  return etherscanRequest<string>('proxy', 'eth_getStorageAt', { address, position, tag });
}

// 获取当前 gas 价格
export async function ethGasPrice() {
  return etherscanRequest<string>('proxy', 'eth_gasPrice', {});
}

// 估算交易所需 gas
export async function ethEstimateGas(options: {
  to: string;
  data?: string;
  value?: string;
  gasPrice?: string;
  gas?: string;
}) {
  return etherscanRequest<string>('proxy', 'eth_estimateGas', options);
}

// ==================== Gas Tracker API ====================

// 获取预估 Gas 价格
export async function gasOracle() {
  return etherscanRequest<{
    LastBlock: string;
    SafeGasPrice: string;
    ProposeGasPrice: string;
    FastGasPrice: string;
    suggestBaseFee: string;
    gasUsedRatio: string;
  }>('gastracker', 'gasoracle', {});
}

// 获取预估确认时间
export async function gasEstimate(gasprice: number) {
  return etherscanRequest<string>('gastracker', 'gasestimate', { gasprice });
}

// ==================== Stats API ====================

// 获取 ETH 总供应量
export async function getEthSupply() {
  return etherscanRequest<string>('stats', 'ethsupply', {});
}

// 获取 ETH2 总供应量
export async function getEthSupply2() {
  return etherscanRequest('stats', 'ethsupply2', {});
}

// 获取 ETH 最新价格
export async function getEthPrice() {
  return etherscanRequest<{
    ethbtc: string;
    ethbtc_timestamp: string;
    ethusd: string;
    ethusd_timestamp: string;
  }>('stats', 'ethprice', {});
}

// 获取以太坊节点数量
export async function getNodeCount() {
  return etherscanRequest('stats', 'nodecount', {});
}

// 获取 ERC20 代币总供应量
export async function getTokenSupply(contractaddress: string) {
  return etherscanRequest<string>('stats', 'tokensupply', { contractaddress });
}
