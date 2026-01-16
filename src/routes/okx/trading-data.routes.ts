/**
 * OKX Trading Statistics 路由模块
 * 提供 OKX 交易大数据 API 的代理访问
 */

import { Router, Request, Response } from 'express';
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
  getOpenInterestVolumeStrike,
  getOptionTakerFlow,
} from '@/services/okx-trading-data.service';
import { ApiResponse, InstType, Period } from '@/apis/okx/trading-data';

const router: Router = Router();

// ============== 工具函数 ==============

/**
 * 确保 data 目录存在
 */
const ensureDataDir = async (): Promise<string> => {
  const dataDir = path.join(process.cwd(), 'data', 'okx');
  await fs.mkdir(dataDir, { recursive: true });
  return dataDir;
};

/**
 * 保存数据到 JSON 文件
 */
const saveToJson = async (filename: string, data: unknown): Promise<string> => {
  const dataDir = await ensureDataDir();
  const filePath = path.join(dataDir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return filePath;
};

/**
 * 处理请求并返回响应
 */
const handleRequest = async <T>(
  res: Response,
  fetchFn: () => Promise<T>,
  filename: string,
  save: boolean
): Promise<void> => {
  try {
    const data = await fetchFn();

    let savedTo: string | null = null;
    if (save) {
      const filePath = await saveToJson(filename, data);
      savedTo = path.basename(filePath);
      console.log(`[OKX TradingData] 数据已保存到: ${filePath}`);
    }

    const response: ApiResponse<T> = {
      success: true,
      data,
      savedTo,
    };

    res.json(response);
  } catch (error) {
    console.error('[OKX TradingData] 请求失败:', error);
    const response: ApiResponse<T> = {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
    res.status(500).json(response);
  }
};

// ============== Trading Statistics API 路由 ==============

/**
 * GET /okx/trading-data/support-coin
 * 获取交易大数据支持币种
 *
 * Query:
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 5次/2秒
 */
router.get('/support-coin', async (req: Request, res: Response) => {
  const save = req.query.save === 'true';
  const filename = `support_coin_${Date.now()}.json`;

  await handleRequest(res, getSupportCoin, filename, save);
});

/**
 * GET /okx/trading-data/contract-open-interest-history
 * 获取合约持仓量历史
 *
 * Query:
 * - instId: string (产品ID，必填)
 * - period: string (时间周期，默认 5m)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 5次/2秒
 */
router.get('/contract-open-interest-history', async (req: Request, res: Response) => {
  const instId = req.query.instId as string;

  if (!instId) {
    res.status(400).json({
      success: false,
      error: '缺少必填参数 instId',
    });
    return;
  }

  const period = (req.query.period as string) || Period.FIVE_MINUTES;
  const save = req.query.save === 'true';
  const filename = `contract_oi_history_${instId.replace(/-/g, '_')}_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getContractOpenInterestHistory({ instId, period }),
    filename,
    save
  );
});

/**
 * GET /okx/trading-data/taker-volume
 * 获取主动买入/卖出情况
 *
 * Query:
 * - ccy: string (币种，必填)
 * - instType: string (产品类型，默认 SPOT)
 * - period: string (时间周期，默认 5m)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 5次/2秒
 */
router.get('/taker-volume', async (req: Request, res: Response) => {
  const ccy = req.query.ccy as string;

  if (!ccy) {
    res.status(400).json({
      success: false,
      error: '缺少必填参数 ccy',
    });
    return;
  }

  const instType = (req.query.instType as string) || InstType.SPOT;
  const period = (req.query.period as string) || Period.FIVE_MINUTES;
  const save = req.query.save === 'true';
  const filename = `taker_volume_${ccy}_${instType}_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getTakerVolume({ ccy, instType, period }),
    filename,
    save
  );
});

/**
 * GET /okx/trading-data/contract-taker-volume
 * 获取合约主动买入/卖出情况
 *
 * Query:
 * - instId: string (产品ID，必填)
 * - period: string (时间周期，默认 5m)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 5次/2秒
 */
router.get('/contract-taker-volume', async (req: Request, res: Response) => {
  const instId = req.query.instId as string;

  if (!instId) {
    res.status(400).json({
      success: false,
      error: '缺少必填参数 instId',
    });
    return;
  }

  const period = (req.query.period as string) || Period.FIVE_MINUTES;
  const save = req.query.save === 'true';
  const filename = `contract_taker_volume_${instId.replace(/-/g, '_')}_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getContractTakerVolume({ instId, period }),
    filename,
    save
  );
});

/**
 * GET /okx/trading-data/margin-loan-ratio
 * 获取杠杆多空比
 *
 * Query:
 * - ccy: string (币种，必填)
 * - period: string (时间周期，默认 5m)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 5次/2秒
 */
router.get('/margin-loan-ratio', async (req: Request, res: Response) => {
  const ccy = req.query.ccy as string;

  if (!ccy) {
    res.status(400).json({
      success: false,
      error: '缺少必填参数 ccy',
    });
    return;
  }

  const period = (req.query.period as string) || Period.FIVE_MINUTES;
  const save = req.query.save === 'true';
  const filename = `margin_loan_ratio_${ccy}_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getMarginLoanRatio({ ccy, period }),
    filename,
    save
  );
});

/**
 * GET /okx/trading-data/put-call-ratio
 * 获取看涨/看跌期权持仓量比/交易量比
 *
 * Query:
 * - ccy: string (币种，必填)
 * - period: string (时间周期，默认 8H)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 5次/2秒
 */
router.get('/put-call-ratio', async (req: Request, res: Response) => {
  const ccy = req.query.ccy as string;

  if (!ccy) {
    res.status(400).json({
      success: false,
      error: '缺少必填参数 ccy',
    });
    return;
  }

  const period = (req.query.period as string) || Period.EIGHT_HOURS;
  const save = req.query.save === 'true';
  const filename = `put_call_ratio_${ccy}_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getPutCallRatio({ ccy, period }),
    filename,
    save
  );
});

/**
 * GET /okx/trading-data/contract-long-short-ratio
 * 获取合约多空持仓人数比
 *
 * Query:
 * - ccy: string (币种，必填)
 * - period: string (时间周期，默认 5m)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 5次/2秒
 */
router.get('/contract-long-short-ratio', async (req: Request, res: Response) => {
  const ccy = req.query.ccy as string;

  if (!ccy) {
    res.status(400).json({
      success: false,
      error: '缺少必填参数 ccy',
    });
    return;
  }

  const period = (req.query.period as string) || Period.FIVE_MINUTES;
  const save = req.query.save === 'true';
  const filename = `contract_long_short_ratio_${ccy}_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getContractLongShortRatio({ ccy, period }),
    filename,
    save
  );
});

/**
 * GET /okx/trading-data/contracts-open-interest-volume
 * 获取合约持仓量及交易量
 *
 * Query:
 * - ccy: string (币种，必填)
 * - period: string (时间周期，默认 5m)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 5次/2秒
 */
router.get('/contracts-open-interest-volume', async (req: Request, res: Response) => {
  const ccy = req.query.ccy as string;

  if (!ccy) {
    res.status(400).json({
      success: false,
      error: '缺少必填参数 ccy',
    });
    return;
  }

  const period = (req.query.period as string) || Period.FIVE_MINUTES;
  const save = req.query.save === 'true';
  const filename = `contracts_oi_volume_${ccy}_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getContractsOpenInterestVolume({ ccy, period }),
    filename,
    save
  );
});

/**
 * GET /okx/trading-data/options-open-interest-volume
 * 获取期权持仓量及交易量
 *
 * Query:
 * - ccy: string (币种，必填)
 * - period: string (时间周期，默认 8H)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 5次/2秒
 */
router.get('/options-open-interest-volume', async (req: Request, res: Response) => {
  const ccy = req.query.ccy as string;

  if (!ccy) {
    res.status(400).json({
      success: false,
      error: '缺少必填参数 ccy',
    });
    return;
  }

  const period = (req.query.period as string) || Period.EIGHT_HOURS;
  const save = req.query.save === 'true';
  const filename = `options_oi_volume_${ccy}_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getOptionsOpenInterestVolume({ ccy, period }),
    filename,
    save
  );
});

/**
 * GET /okx/trading-data/open-interest-volume-expiry
 * 获取期权按到期日持仓量及交易量
 *
 * Query:
 * - ccy: string (币种，必填)
 * - period: string (时间周期，默认 8H)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 5次/2秒
 */
router.get('/open-interest-volume-expiry', async (req: Request, res: Response) => {
  const ccy = req.query.ccy as string;

  if (!ccy) {
    res.status(400).json({
      success: false,
      error: '缺少必填参数 ccy',
    });
    return;
  }

  const period = (req.query.period as string) || Period.EIGHT_HOURS;
  const save = req.query.save === 'true';
  const filename = `oi_volume_expiry_${ccy}_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getOpenInterestVolumeExpiry({ ccy, period }),
    filename,
    save
  );
});

/**
 * GET /okx/trading-data/open-interest-volume-strike
 * 获取期权按执行价格持仓量及交易量
 *
 * Query:
 * - ccy: string (币种，必填)
 * - expTime: string (到期日，必填，格式YYYYMMDD)
 * - period: string (时间周期，默认 8H)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 5次/2秒
 */
router.get('/open-interest-volume-strike', async (req: Request, res: Response) => {
  const ccy = req.query.ccy as string;
  const expTime = req.query.expTime as string;

  if (!ccy || !expTime) {
    res.status(400).json({
      success: false,
      error: '缺少必填参数 ccy 或 expTime',
    });
    return;
  }

  const period = (req.query.period as string) || Period.EIGHT_HOURS;
  const save = req.query.save === 'true';
  const filename = `oi_volume_strike_${ccy}_${expTime}_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getOpenInterestVolumeStrike({ ccy, expTime, period }),
    filename,
    save
  );
});

/**
 * GET /okx/trading-data/option-taker-flow
 * 获取期权主动买入/卖出量
 *
 * Query:
 * - ccy: string (币种，必填)
 * - period: string (时间周期，默认 8H)
 * - save: boolean (是否保存到文件，默认 false)
 *
 * 访问限制: 5次/2秒
 */
router.get('/option-taker-flow', async (req: Request, res: Response) => {
  const ccy = req.query.ccy as string;

  if (!ccy) {
    res.status(400).json({
      success: false,
      error: '缺少必填参数 ccy',
    });
    return;
  }

  const period = (req.query.period as string) || Period.EIGHT_HOURS;
  const save = req.query.save === 'true';
  const filename = `option_taker_flow_${ccy}_${Date.now()}.json`;

  await handleRequest(
    res,
    () => getOptionTakerFlow({ ccy, period }),
    filename,
    save
  );
});

export default router;
