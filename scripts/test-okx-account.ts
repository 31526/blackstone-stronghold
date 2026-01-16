/**
 * OKX Account API 测试脚本
 * 测试所有账户相关接口并保存结果到 data 目录
 */

import 'dotenv/config';
import 'tsconfig-paths/register';
import fs from 'fs';
import path from 'path';
import * as okxAccountService from '@/services/okx-account.service';
import { InstType, Quarter } from '@/apis/okx/account';

// 数据保存目录
const DATA_DIR = path.join(process.cwd(), 'data', 'okx');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * 保存数据到文件
 */
function saveToFile(filename: string, data: unknown): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✓ 数据已保存到: ${filePath}`);
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 测试结果统计
 */
interface TestResult {
  name: string;
  success: boolean;
  error?: string;
}

const results: TestResult[] = [];

/**
 * 测试获取交易产品基础信息
 */
async function testGetInstruments(): Promise<void> {
  const testName = '获取交易产品基础信息';
  console.log(`\n=== 测试: ${testName} ===`);

  try {
    const result = await okxAccountService.getInstruments({ instType: InstType.SPOT });
    console.log(`响应码: ${result.code}`);
    console.log(`产品数量: ${result.data.length}`);

    // 只保存前10个产品信息
    const limitedData = {
      ...result,
      data: result.data.slice(0, 10),
      _note: `仅展示前10个产品，共 ${result.data.length} 个`,
    };
    saveToFile('test_account_instruments.json', limitedData);

    results.push({ name: testName, success: result.code === '0' });
  } catch (error) {
    console.error(`错误: ${error instanceof Error ? error.message : error}`);
    results.push({ name: testName, success: false, error: String(error) });
  }
}

/**
 * 测试获取账户余额
 */
async function testGetBalance(): Promise<void> {
  const testName = '获取账户余额';
  console.log(`\n=== 测试: ${testName} ===`);

  try {
    const result = await okxAccountService.getBalance();
    console.log(`响应码: ${result.code}`);
    if (result.data.length > 0) {
      console.log(`总权益: ${result.data[0].totalEq}`);
      console.log(`币种数量: ${result.data[0].details.length}`);
    }

    saveToFile('test_account_balance.json', result);
    results.push({ name: testName, success: result.code === '0' });
  } catch (error) {
    console.error(`错误: ${error instanceof Error ? error.message : error}`);
    results.push({ name: testName, success: false, error: String(error) });
  }
}

/**
 * 测试获取持仓信息
 */
async function testGetPositions(): Promise<void> {
  const testName = '获取持仓信息';
  console.log(`\n=== 测试: ${testName} ===`);

  try {
    const result = await okxAccountService.getPositions();
    console.log(`响应码: ${result.code}`);
    console.log(`持仓数量: ${result.data.length}`);

    saveToFile('test_account_positions.json', result);
    results.push({ name: testName, success: result.code === '0' });
  } catch (error) {
    console.error(`错误: ${error instanceof Error ? error.message : error}`);
    results.push({ name: testName, success: false, error: String(error) });
  }
}

/**
 * 测试获取历史持仓信息
 */
async function testGetPositionsHistory(): Promise<void> {
  const testName = '获取历史持仓信息';
  console.log(`\n=== 测试: ${testName} ===`);

  try {
    const result = await okxAccountService.getPositionsHistory();
    console.log(`响应码: ${result.code}`);
    console.log(`历史持仓数量: ${result.data.length}`);

    saveToFile('test_account_positions_history.json', result);
    results.push({ name: testName, success: result.code === '0' });
  } catch (error) {
    console.error(`错误: ${error instanceof Error ? error.message : error}`);
    results.push({ name: testName, success: false, error: String(error) });
  }
}

/**
 * 测试获取账户持仓风险
 */
async function testGetAccountPositionRisk(): Promise<void> {
  const testName = '获取账户持仓风险';
  console.log(`\n=== 测试: ${testName} ===`);

  try {
    const result = await okxAccountService.getAccountPositionRisk();
    console.log(`响应码: ${result.code}`);
    console.log(`风险数据数量: ${result.data.length}`);

    saveToFile('test_account_position_risk.json', result);
    results.push({ name: testName, success: result.code === '0' });
  } catch (error) {
    console.error(`错误: ${error instanceof Error ? error.message : error}`);
    results.push({ name: testName, success: false, error: String(error) });
  }
}

/**
 * 测试账单流水查询（近七天）
 */
async function testGetBills(): Promise<void> {
  const testName = '账单流水查询（近七天）';
  console.log(`\n=== 测试: ${testName} ===`);

  try {
    const result = await okxAccountService.getBills();
    console.log(`响应码: ${result.code}`);
    console.log(`账单数量: ${result.data.length}`);

    saveToFile('test_account_bills.json', result);
    results.push({ name: testName, success: result.code === '0' });
  } catch (error) {
    console.error(`错误: ${error instanceof Error ? error.message : error}`);
    results.push({ name: testName, success: false, error: String(error) });
  }
}

/**
 * 测试账单流水查询（近三个月）
 */
async function testGetBillsArchive(): Promise<void> {
  const testName = '账单流水查询（近三个月）';
  console.log(`\n=== 测试: ${testName} ===`);

  try {
    const result = await okxAccountService.getBillsArchive();
    console.log(`响应码: ${result.code}`);
    console.log(`账单数量: ${result.data.length}`);

    saveToFile('test_account_bills_archive.json', result);
    results.push({ name: testName, success: result.code === '0' });
  } catch (error) {
    console.error(`错误: ${error instanceof Error ? error.message : error}`);
    results.push({ name: testName, success: false, error: String(error) });
  }
}

/**
 * 测试获取账单流水（自2021年）
 * 注意: 错误码 51604 表示需要先申请账单流水，这是预期行为
 */
async function testGetBillsHistoryArchive(): Promise<void> {
  const testName = '获取账单流水（自2021年）';
  console.log(`\n=== 测试: ${testName} ===`);

  try {
    const result = await okxAccountService.getBillsHistoryArchive({
      year: '2024',
      quarter: Quarter.Q4,
    });
    console.log(`响应码: ${result.code}`);
    console.log(`数据: ${JSON.stringify(result.data)}`);

    saveToFile('test_account_bills_history_archive.json', result);
    // 51604 表示需要先申请，这是预期行为，接口调用本身是成功的
    const isSuccess = result.code === '0' || result.code === '51604';
    if (result.code === '51604') {
      console.log('注意: 错误码51604表示需要先申请账单流水，接口调用成功');
    }
    results.push({ name: testName, success: isSuccess });
  } catch (error) {
    console.error(`错误: ${error instanceof Error ? error.message : error}`);
    results.push({ name: testName, success: false, error: String(error) });
  }
}

/**
 * 测试获取账户配置
 */
async function testGetAccountConfig(): Promise<void> {
  const testName = '获取账户配置';
  console.log(`\n=== 测试: ${testName} ===`);

  try {
    const result = await okxAccountService.getAccountConfig();
    console.log(`响应码: ${result.code}`);
    if (result.data.length > 0) {
      console.log(`账户等级: ${result.data[0].acctLv}`);
      console.log(`VIP等级: ${result.data[0].level}`);
      console.log(`API权限: ${result.data[0].perm}`);
    }

    saveToFile('test_account_config.json', result);
    results.push({ name: testName, success: result.code === '0' });
  } catch (error) {
    console.error(`错误: ${error instanceof Error ? error.message : error}`);
    results.push({ name: testName, success: false, error: String(error) });
  }
}

/**
 * 主测试函数
 */
async function main(): Promise<void> {
  console.log('========================================');
  console.log('OKX Account API 测试');
  console.log('========================================');

  // 检查环境变量
  if (
    !process.env.OKX_API_KEY ||
    !process.env.OKX_API_SECRET ||
    !process.env.OKX_API_PASSPHRASE
  ) {
    console.error('错误: 请配置 OKX_API_KEY, OKX_API_SECRET, OKX_API_PASSPHRASE 环境变量');
    process.exit(1);
  }

  console.log('API Key:', process.env.OKX_API_KEY?.slice(0, 10) + '...');

  // 公共接口测试
  await testGetInstruments();
  await delay(500);

  // 私有接口测试 (需要认证)
  await testGetBalance();
  await delay(500);

  await testGetPositions();
  await delay(500);

  await testGetPositionsHistory();
  await delay(10000); // 该接口限速 1次/10秒

  await testGetAccountPositionRisk();
  await delay(500);

  await testGetBills();
  await delay(500);

  await testGetBillsArchive();
  await delay(500);

  await testGetBillsHistoryArchive();
  await delay(5000); // 该接口限速 1次/5秒

  await testGetAccountConfig();

  // 打印测试结果汇总
  console.log('\n========================================');
  console.log('测试结果汇总');
  console.log('========================================');

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  results.forEach((r, i) => {
    const status = r.success ? '✓ 通过' : '✗ 失败';
    console.log(`${i + 1}. ${r.name}: ${status}${r.error ? ` (${r.error})` : ''}`);
  });

  console.log('\n========================================');
  console.log(`测试完成: ${passed} 通过, ${failed} 失败`);
  console.log('========================================');

  // 如果有失败的测试，返回非零退出码
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
