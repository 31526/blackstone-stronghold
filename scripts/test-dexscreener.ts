/**
 * DexScreener API 测试脚本
 * 测试所有 API 端点并将结果保存到 data 目录
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  getLatestTokenProfiles,
  getLatestTokenBoosts,
  getTopTokenBoosts,
  getOrders,
  getPairsByAddress,
  getPairsByTokenAddress,
  searchPairs,
} from '../src/services/dexscreener.service';

// 确保目录存在
async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

// 保存 JSON 数据
async function saveJson(filename: string, data: unknown): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data', 'dexscreener');
  await ensureDir(dataDir);
  const filePath = path.join(dataDir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ 已保存: ${filePath}`);
}

// 测试函数包装器
async function runTest<T>(
  name: string,
  filename: string,
  testFn: () => Promise<T>
): Promise<void> {
  console.log(`\n🔄 测试: ${name}`);
  try {
    const data = await testFn();
    await saveJson(filename, data);
    console.log(`✅ ${name} - 成功`);
  } catch (error) {
    console.error(`❌ ${name} - 失败:`, error instanceof Error ? error.message : error);
  }
}

// 主测试函数
async function main(): Promise<void> {
  console.log('========================================');
  console.log('DexScreener API 测试');
  console.log('========================================');

  // 1. 测试 Token Profiles
  await runTest(
    '获取最新代币配置文件',
    'test_token_profiles_latest.json',
    getLatestTokenProfiles
  );

  // 2. 测试 Token Boosts
  await runTest(
    '获取最新代币加速',
    'test_token_boosts_latest.json',
    getLatestTokenBoosts
  );

  await runTest(
    '获取热门代币加速',
    'test_token_boosts_top.json',
    getTopTokenBoosts
  );

  // 3. 测试 Orders
  await runTest(
    '获取 SOL 代币订单状态',
    'test_orders_sol.json',
    () => getOrders({
      chainId: 'solana',
      tokenAddress: 'So11111111111111111111111111111111111111112'
    })
  );

  // 4. 测试 DEX Pairs - 根据交易对地址
  await runTest(
    '获取 ETH-USDC 交易对 (Uniswap V3)',
    'test_pairs_eth_usdc.json',
    () => getPairsByAddress({
      chainId: 'ethereum',
      pairAddresses: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640'
    })
  );

  // 5. 测试 DEX Pairs - 根据代币地址
  await runTest(
    '获取 WETH 代币所有交易对',
    'test_tokens_weth.json',
    () => getPairsByTokenAddress({
      tokenAddresses: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    })
  );

  // 6. 测试搜索
  await runTest(
    '搜索 PEPE',
    'test_search_pepe.json',
    () => searchPairs({ q: 'PEPE' })
  );

  await runTest(
    '搜索 WETH',
    'test_search_weth.json',
    () => searchPairs({ q: 'WETH' })
  );

  console.log('\n========================================');
  console.log('测试完成');
  console.log('========================================');
}

// 运行测试
main().catch(console.error);
