/**
 * OKX Spot Market API 测试脚本
 * 测试所有 API 端点并将结果保存到 data 目录
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  getInstruments,
  getTickers,
  getTicker,
} from '../src/services/okx.service';
import { InstType } from '../src/apis/okx/spot';

// 确保目录存在
async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

// 保存 JSON 数据
async function saveJson(filename: string, data: unknown): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data', 'okx');
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
  console.log('OKX Spot Market API 测试');
  console.log('========================================');

  // 1. 测试获取现货交易产品信息
  await runTest(
    '获取现货交易产品列表',
    'test_instruments_spot.json',
    () => getInstruments({ instType: InstType.SPOT })
  );

  // 2. 测试获取指定交易产品信息
  await runTest(
    '获取 BTC-USDT 交易产品信息',
    'test_instruments_btcusdt.json',
    () => getInstruments({ instType: InstType.SPOT, instId: 'BTC-USDT' })
  );

  // 3. 测试获取所有现货行情
  await runTest(
    '获取所有现货行情',
    'test_tickers_spot.json',
    () => getTickers({ instType: InstType.SPOT })
  );

  // 4. 测试获取单个产品行情
  await runTest(
    '获取 BTC-USDT 行情',
    'test_ticker_btcusdt.json',
    () => getTicker({ instId: 'BTC-USDT' })
  );

  await runTest(
    '获取 ETH-USDT 行情',
    'test_ticker_ethusdt.json',
    () => getTicker({ instId: 'ETH-USDT' })
  );

  await runTest(
    '获取 SOL-USDT 行情',
    'test_ticker_solusdt.json',
    () => getTicker({ instId: 'SOL-USDT' })
  );

  console.log('\n========================================');
  console.log('测试完成');
  console.log('========================================');
}

// 运行测试
main().catch(console.error);
