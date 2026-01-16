/**
 * OKX Account API 路由
 * 基于 /okx/account 路径
 */

import { Router, Request, Response } from 'express';
import * as okxAccountService from '@/services/okx-account.service';
import {
  ApiResponse,
  InstType,
  GetBalanceParams,
  GetPositionsParams,
  GetPositionsHistoryParams,
  GetAccountPositionRiskParams,
  GetBillsParams,
  ApplyBillsHistoryArchiveParams,
  GetBillsHistoryArchiveParams,
  SetFeeTypeParams,
  GetInstrumentsParams,
} from '@/apis/okx/account';

const router: Router = Router();

// ============== Public API Routes ==============

/**
 * GET /okx/account/instruments
 * 获取交易产品基础信息
 *
 * Query params:
 * - instType: 产品类型 (必填) SPOT, MARGIN, SWAP, FUTURES, OPTION
 * - instId: 产品ID (可选)
 * - uly: 标的指数 (可选)
 * - instFamily: 交易品种 (可选)
 */
router.get('/instruments', async (req: Request, res: Response) => {
  try {
    const { instType, instId, uly, instFamily } = req.query;

    if (!instType) {
      const response: ApiResponse<null> = {
        success: false,
        error: '缺少必填参数: instType',
      };
      return res.status(400).json(response);
    }

    const params: GetInstrumentsParams = {
      instType: instType as InstType,
      instId: instId as string | undefined,
      uly: uly as string | undefined,
      instFamily: instFamily as string | undefined,
    };

    const result = await okxAccountService.getInstruments(params);

    const response: ApiResponse<typeof result.data> = {
      success: result.code === '0',
      data: result.data,
      error: result.code !== '0' ? result.msg : undefined,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : '获取交易产品信息失败',
    };
    res.status(500).json(response);
  }
});

// ============== Private API Routes (需要认证) ==============

/**
 * GET /okx/account/balance
 * 查看账户余额
 *
 * Query params:
 * - ccy: 币种，支持多币种查询（不超过20个），币种之间半角逗号分隔
 */
router.get('/balance', async (req: Request, res: Response) => {
  try {
    const { ccy } = req.query;

    const params: GetBalanceParams | undefined = ccy ? { ccy: ccy as string } : undefined;

    const result = await okxAccountService.getBalance(params);

    const response: ApiResponse<typeof result.data> = {
      success: result.code === '0',
      data: result.data,
      error: result.code !== '0' ? result.msg : undefined,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : '获取账户余额失败',
    };
    res.status(500).json(response);
  }
});

/**
 * GET /okx/account/positions
 * 查看持仓信息
 *
 * Query params:
 * - instType: 产品类型 (可选)
 * - instId: 产品ID (可选)
 * - posId: 持仓ID (可选)
 */
router.get('/positions', async (req: Request, res: Response) => {
  try {
    const { instType, instId, posId } = req.query;

    const params: GetPositionsParams | undefined =
      instType || instId || posId
        ? {
            instType: instType as string | undefined,
            instId: instId as string | undefined,
            posId: posId as string | undefined,
          }
        : undefined;

    const result = await okxAccountService.getPositions(params);

    const response: ApiResponse<typeof result.data> = {
      success: result.code === '0',
      data: result.data,
      error: result.code !== '0' ? result.msg : undefined,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : '获取持仓信息失败',
    };
    res.status(500).json(response);
  }
});

/**
 * GET /okx/account/positions-history
 * 查看历史持仓信息
 *
 * Query params: instType, instId, mgnMode, type, posId, after, before, limit
 */
router.get('/positions-history', async (req: Request, res: Response) => {
  try {
    const { instType, instId, mgnMode, type, posId, after, before, limit } = req.query;

    const params: GetPositionsHistoryParams | undefined =
      instType || instId || mgnMode || type || posId || after || before || limit
        ? {
            instType: instType as string | undefined,
            instId: instId as string | undefined,
            mgnMode: mgnMode as string | undefined,
            type: type as string | undefined,
            posId: posId as string | undefined,
            after: after as string | undefined,
            before: before as string | undefined,
            limit: limit as string | undefined,
          }
        : undefined;

    const result = await okxAccountService.getPositionsHistory(params);

    const response: ApiResponse<typeof result.data> = {
      success: result.code === '0',
      data: result.data,
      error: result.code !== '0' ? result.msg : undefined,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : '获取历史持仓信息失败',
    };
    res.status(500).json(response);
  }
});

/**
 * GET /okx/account/position-risk
 * 查看账户持仓风险
 *
 * Query params:
 * - instType: 产品类型 (可选)
 */
router.get('/position-risk', async (req: Request, res: Response) => {
  try {
    const { instType } = req.query;

    const params: GetAccountPositionRiskParams | undefined = instType
      ? { instType: instType as string }
      : undefined;

    const result = await okxAccountService.getAccountPositionRisk(params);

    const response: ApiResponse<typeof result.data> = {
      success: result.code === '0',
      data: result.data,
      error: result.code !== '0' ? result.msg : undefined,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : '获取账户持仓风险失败',
    };
    res.status(500).json(response);
  }
});

/**
 * GET /okx/account/bills
 * 账单流水查询（近七天）
 *
 * Query params: instType, ccy, mgnMode, ctType, type, subType, after, before, begin, end, limit
 */
router.get('/bills', async (req: Request, res: Response) => {
  try {
    const { instType, ccy, mgnMode, ctType, type, subType, after, before, begin, end, limit } =
      req.query;

    const params: GetBillsParams | undefined =
      instType || ccy || mgnMode || ctType || type || subType || after || before || begin || end || limit
        ? {
            instType: instType as string | undefined,
            ccy: ccy as string | undefined,
            mgnMode: mgnMode as string | undefined,
            ctType: ctType as string | undefined,
            type: type as string | undefined,
            subType: subType as string | undefined,
            after: after as string | undefined,
            before: before as string | undefined,
            begin: begin as string | undefined,
            end: end as string | undefined,
            limit: limit as string | undefined,
          }
        : undefined;

    const result = await okxAccountService.getBills(params);

    const response: ApiResponse<typeof result.data> = {
      success: result.code === '0',
      data: result.data,
      error: result.code !== '0' ? result.msg : undefined,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : '获取账单流水失败',
    };
    res.status(500).json(response);
  }
});

/**
 * GET /okx/account/bills-archive
 * 账单流水查询（近三个月）
 *
 * Query params: instType, ccy, mgnMode, ctType, type, subType, after, before, begin, end, limit
 */
router.get('/bills-archive', async (req: Request, res: Response) => {
  try {
    const { instType, ccy, mgnMode, ctType, type, subType, after, before, begin, end, limit } =
      req.query;

    const params: GetBillsParams | undefined =
      instType || ccy || mgnMode || ctType || type || subType || after || before || begin || end || limit
        ? {
            instType: instType as string | undefined,
            ccy: ccy as string | undefined,
            mgnMode: mgnMode as string | undefined,
            ctType: ctType as string | undefined,
            type: type as string | undefined,
            subType: subType as string | undefined,
            after: after as string | undefined,
            before: before as string | undefined,
            begin: begin as string | undefined,
            end: end as string | undefined,
            limit: limit as string | undefined,
          }
        : undefined;

    const result = await okxAccountService.getBillsArchive(params);

    const response: ApiResponse<typeof result.data> = {
      success: result.code === '0',
      data: result.data,
      error: result.code !== '0' ? result.msg : undefined,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : '获取账单流水归档失败',
    };
    res.status(500).json(response);
  }
});

/**
 * POST /okx/account/bills-history-archive
 * 申请账单流水（自2021年）
 *
 * Body params:
 * - year: 年份 (必填)
 * - quarter: 季度 Q1/Q2/Q3/Q4 (必填)
 */
router.post('/bills-history-archive', async (req: Request, res: Response) => {
  try {
    const { year, quarter } = req.body;

    if (!year || !quarter) {
      const response: ApiResponse<null> = {
        success: false,
        error: '缺少必填参数: year, quarter',
      };
      return res.status(400).json(response);
    }

    const params: ApplyBillsHistoryArchiveParams = {
      year: year as string,
      quarter: quarter as string,
    };

    const result = await okxAccountService.applyBillsHistoryArchive(params);

    const response: ApiResponse<typeof result.data> = {
      success: result.code === '0',
      data: result.data,
      error: result.code !== '0' ? result.msg : undefined,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : '申请账单流水失败',
    };
    res.status(500).json(response);
  }
});

/**
 * GET /okx/account/bills-history-archive
 * 获取账单流水（自2021年）
 *
 * Query params:
 * - year: 年份 (必填)
 * - quarter: 季度 Q1/Q2/Q3/Q4 (必填)
 */
router.get('/bills-history-archive', async (req: Request, res: Response) => {
  try {
    const { year, quarter } = req.query;

    if (!year || !quarter) {
      const response: ApiResponse<null> = {
        success: false,
        error: '缺少必填参数: year, quarter',
      };
      return res.status(400).json(response);
    }

    const params: GetBillsHistoryArchiveParams = {
      year: year as string,
      quarter: quarter as string,
    };

    const result = await okxAccountService.getBillsHistoryArchive(params);

    const response: ApiResponse<typeof result.data> = {
      success: result.code === '0',
      data: result.data,
      error: result.code !== '0' ? result.msg : undefined,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : '获取账单流水归档失败',
    };
    res.status(500).json(response);
  }
});

/**
 * GET /okx/account/config
 * 查看账户配置
 */
router.get('/config', async (_req: Request, res: Response) => {
  try {
    const result = await okxAccountService.getAccountConfig();

    const response: ApiResponse<typeof result.data> = {
      success: result.code === '0',
      data: result.data,
      error: result.code !== '0' ? result.msg : undefined,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : '获取账户配置失败',
    };
    res.status(500).json(response);
  }
});

/**
 * POST /okx/account/set-fee-type
 * 设置手续费计价方式
 *
 * Body params:
 * - feeType: 手续费计价方式 0-USDT计价 1-交易币种计价
 */
router.post('/set-fee-type', async (req: Request, res: Response) => {
  try {
    const { feeType } = req.body;

    if (feeType === undefined) {
      const response: ApiResponse<null> = {
        success: false,
        error: '缺少必填参数: feeType',
      };
      return res.status(400).json(response);
    }

    const params: SetFeeTypeParams = {
      feeType: feeType as string,
    };

    const result = await okxAccountService.setFeeType(params);

    const response: ApiResponse<typeof result.data> = {
      success: result.code === '0',
      data: result.data,
      error: result.code !== '0' ? result.msg : undefined,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : '设置手续费计价方式失败',
    };
    res.status(500).json(response);
  }
});

export default router;
