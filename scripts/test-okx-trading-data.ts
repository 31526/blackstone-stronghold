/**
 * OKX Trading Statistics API 测试脚本
 * 测试所有 API 端点并将结果保存到 data 目录
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  getSupportCoin,
  getContractOpenInterestHistory,
  getTakerVolume,
  getContractTakerVolume,
  getMarginLoanRatio,
  getPutCallRatio,
  getContractLongShortRatio,
  getContractsOpenInterestVolume,
  getOptionsOpenInterestVolume,
  getOpenInterestVolumeExpiry,
  getOptionTakerFlow,
} from '../src/services/okx-trading-data.service';
import { InstType, Period } from '../src/apis/okx/trading-data';

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
): Promise<boolean> {
  console.log(`\n  测试: ${name}`);
  try {
    const data = await testFn();
    await saveJson(filename, data);
    console.log(`  ${name} - 成功`);
    return true;
  } catch (error) {
    console.error(`  ${name} - 失败:`, error instanceof Error ? error.message : error);
    return false;
  }
}

// 延迟函数 (避免触发频率限制)
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 主测试函数
async function main(): Promise<void> {
  console.log('========================================');
  console.log('OKX Trading Statistics API 测试');
  console.log('========================================');

  let passed = 0;
  let failed = 0;

  // 1. 测试获取支持币种
  if (await runTest(
    '获取交易大数据支持币种',
    'test_trading_support_coin.json',
    getSupportCoin
  )) passed++; else failed++;

  await delay(500);

  // 2. 测试获取合约持仓量历史
  if (await runTest(
    '获取合约持仓量历史 (BTC-USD-SWAP)',
    'test_contract_oi_history_btc.json',
    () => getContractOpenInterestHistory({ instId: 'BTC-USD-SWAP', period: Period.FIVE_MINUTES })
  )) passed++; else failed++;

  await delay(500);

  // 3. 测试获取主动买入/卖出情况
  if (await runTest(
    '获取主动买入/卖出情况 (BTC SPOT)',
    'test_taker_volume_btc_spot.json',
    () => getTakerVolume({ ccy: 'BTC', instType: InstType.SPOT, period: Period.FIVE_MINUTES })
  )) passed++; else failed++;

  await delay(500);

  // 4. 测试获取合约主动买入/卖出情况
  if (await runTest(
    '获取合约主动买入/卖出情况 (BTC-USD-SWAP)',
    'test_contract_taker_volume_btc.json',
    () => getContractTakerVolume({ instId: 'BTC-USD-SWAP', period: Period.FIVE_MINUTES })
  )) passed++; else failed++;

  await delay(500);

  // 5. 测试获取杠杆多空比
  if (await runTest(
    '获取杠杆多空比 (BTC)',
    'test_margin_loan_ratio_btc.json',
    () => getMarginLoanRatio({ ccy: 'BTC', period: Period.FIVE_MINUTES })
  )) passed++; else failed++;

  await delay(500);

  // 6. 测试获取期权持仓量比/交易量比
  if (await runTest(
    '获取期权持仓量比/交易量比 (BTC)',
    'test_put_call_ratio_btc.json',
    () => getPutCallRatio({ ccy: 'BTC', period: Period.EIGHT_HOURS })
  )) passed++; else failed++;

  await delay(500);

  // 7. 测试获取合约多空持仓人数比
  if (await runTest(
    '获取合约多空持仓人数比 (BTC)',
    'test_contract_long_short_ratio_btc.json',
    () => getContractLongShortRatio({ ccy: 'BTC', period: Period.FIVE_MINUTES })
  )) passed++; else failed++;

  await delay(500);

  // 8. 测试获取合约持仓量及交易量
  if (await runTest(
    '获取合约持仓量及交易量 (BTC)',
    'test_contracts_oi_volume_btc.json',
    () => getContractsOpenInterestVolume({ ccy: 'BTC', period: Period.FIVE_MINUTES })
  )) passed++; else failed++;

  await delay(500);

  // 9. 测试获取期权持仓量及交易量
  if (await runTest(
    '获取期权持仓量及交易量 (BTC)',
    'test_options_oi_volume_btc.json',
    () => getOptionsOpenInterestVolume({ ccy: 'BTC', period: Period.EIGHT_HOURS })
  )) passed++; else failed++;

  await delay(500);

  // 10. 测试获取期权按到期日持仓量
  if (await runTest(
    '获取期权按到期日持仓量 (BTC)',
    'test_oi_volume_expiry_btc.json',
    () => getOpenInterestVolumeExpiry({ ccy: 'BTC', period: Period.EIGHT_HOURS })
  )) passed++; else failed++;

  await delay(500);

  // 11. 测试获取期权主动买入/卖出量
  if (await runTest(
    '获取期权主动买入/卖出量 (BTC)',
    'test_option_taker_flow_btc.json',
    () => getOptionTakerFlow({ ccy: 'BTC', period: Period.EIGHT_HOURS })
  )) passed++; else failed++;

  console.log('\n========================================');
  console.log(`测试完成: ${passed} 通过, ${failed} 失败`);
  console.log('========================================');
}

// 运行测试
main().catch(console.error);
