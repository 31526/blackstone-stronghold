/**
 * OKX Announcement API 测试脚本
 * 测试所有 API 端点并将结果保存到 data 目录
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  getAnnouncements,
  getAnnouncementTypes,
} from '../src/services/okx-announcement.service';
import { AnnouncementType } from '../src/apis/okx/announcement';

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
  console.log('OKX Announcement API 测试');
  console.log('========================================');

  // 1. 测试获取公告类型列表
  await runTest(
    '获取公告类型列表',
    'test_announcement_types.json',
    getAnnouncementTypes
  );

  // 2. 测试获取新币上线公告
  await runTest(
    '获取新币上线公告',
    'test_announcements_new_listings.json',
    () => getAnnouncements({ annType: AnnouncementType.NEW_LISTINGS })
  );

  // 3. 测试获取下架公告
  await runTest(
    '获取下架公告',
    'test_announcements_delistings.json',
    () => getAnnouncements({ annType: AnnouncementType.DELISTINGS })
  );

  // 4. 测试获取交易更新公告
  await runTest(
    '获取交易更新公告',
    'test_announcements_trading_updates.json',
    () => getAnnouncements({ annType: AnnouncementType.TRADING_UPDATES })
  );

  // 5. 测试获取API公告
  await runTest(
    '获取API公告',
    'test_announcements_api.json',
    () => getAnnouncements({ annType: AnnouncementType.API })
  );

  // 6. 测试获取Web3公告
  await runTest(
    '获取Web3公告',
    'test_announcements_web3.json',
    () => getAnnouncements({ annType: AnnouncementType.WEB3 })
  );

  // 7. 测试获取Jumpstart公告
  await runTest(
    '获取Jumpstart公告',
    'test_announcements_jumpstart.json',
    () => getAnnouncements({ annType: AnnouncementType.JUMPSTART })
  );

  console.log('\n========================================');
  console.log('测试完成');
  console.log('========================================');
}

// 运行测试
main().catch(console.error);
