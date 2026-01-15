/**
 * Bitget Spot Market API 测试脚本
 * 测试所有 API 端点并将结果保存到 data 目录
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  getCoins,
  getSymbols,
  getTickers,
  getRecentTrades,
  getMarketTrades,
} from '../src/services/bitget.service';

// 确保目录存在
async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

// 保存 JSON 数据
async function saveJson(filename: string, data: unknown): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data', 'bitget');
  await ensureDir(dataDir);
  const filePath = path.join(dataDir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`  已保存: ${filePath}`);
}

// 测试函数包装器
async function runTest<T>(
  name: string,
  filename: string,
  testFn: () => Promise<T>
): Promise<void> {
  console.log(`\n  测试: ${name}`);
  try {
    const data = await testFn();
    await saveJson(filename, data);
    console.log(`  ${name} - 成功`);
  } catch (error) {
    console.error(`  ${name} - 失败:`, error instanceof Error ? error.message : error);
  }
}

// 主测试函数
async function main(): Promise<void> {
  console.log('========================================');
  console.log('Bitget Spot Market API 测试');
  console.log('========================================');

  // 1. 测试获取币种列表
  await runTest(
    '获取币种列表',
    'test_coins.json',
    getCoins
  );

  // 2. 测试获取所有交易对
  await runTest(
    '获取所有交易对',
    'test_symbols_all.json',
    () => getSymbols()
  );

  // 3. 测试获取指定交易对
  await runTest(
    '获取 BTCUSDT 交易对',
    'test_symbols_btcusdt.json',
    () => getSymbols({ symbol: 'BTCUSDT' })
  );

  // 4. 测试获取所有行情
  await runTest(
    '获取所有行情',
    'test_tickers_all.json',
    () => getTickers()
  );

  // 5. 测试获取指定交易对行情
  await runTest(
    '获取 BTCUSDT 行情',
    'test_tickers_btcusdt.json',
    () => getTickers({ symbol: 'BTCUSDT' })
  );

  await runTest(
    '获取 ETHUSDT 行情',
    'test_tickers_ethusdt.json',
    () => getTickers({ symbol: 'ETHUSDT' })
  );

  // 6. 测试获取最近成交记录
  await runTest(
    '获取 BTCUSDT 最近成交 (20条)',
    'test_trades_recent_btcusdt.json',
    () => getRecentTrades({ symbol: 'BTCUSDT', limit: '20' })
  );

  // 7. 测试获取历史成交记录
  await runTest(
    '获取 BTCUSDT 历史成交 (20条)',
    'test_trades_history_btcusdt.json',
    () => getMarketTrades({ symbol: 'BTCUSDT', limit: '20' })
  );

  console.log('\n========================================');
  console.log('测试完成');
  console.log('========================================');
}

// 运行测试
main().catch(console.error);
