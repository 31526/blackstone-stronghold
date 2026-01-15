# Web3 多链数据存储架构设计指引 v3

> 本文档是关于 **Web3 多链项目数据存储方案** 的全面技术指引。基于 MongoDB 的灵活模式设计，旨在平衡异构链数据的差异性与查询的高效性，同时提供生产级别的类型定义、安全性考虑和高可用部署方案。

---

## 目录

1. [核心设计理念](#1-核心设计理念)
2. [TypeScript 类型定义](#2-typescript-类型定义)
3. [Mongoose Schema 定义](#3-mongoose-schema-定义)
4. [数据库集合设计](#4-数据库集合设计)
5. [索引策略](#5-索引策略)
6. [数据验证规则](#6-数据验证规则)
7. [安全性考虑](#7-安全性考虑)
8. [性能优化](#8-性能优化)
9. [分片与高可用部署](#9-分片与高可用部署)
10. [数据迁移策略](#10-数据迁移策略)
11. [完整代码示例](#11-完整代码示例)
12. [监控与告警](#12-监控与告警)
13. [扩展性指南](#13-扩展性指南)
14. [常见问题与最佳实践](#14-常见问题与最佳实践)

---

## 1. 核心设计理念

### 1.1 Web3 数据特点

Web3 数据具有以下独特特征：

| 特征 | 说明 | 设计影响 |
|------|------|----------|
| **高并发写入** | 区块链每秒产生大量交易 | 需要写入优化和批量处理 |
| **非结构化** | 不同协议的数据格式差异大 | 采用灵活的文档模型 |
| **跨链异构** | EVM、SVM、Move 等架构差异 | 分层抽象 + 元数据嵌套 |
| **数据不可变** | 链上数据一旦确认不可修改 | 优化读取性能，减少更新操作 |
| **大数值** | 代币金额可能超过 JS 安全整数 | 使用字符串存储大数 |

### 1.2 分层模型 (Hierarchical Model)

```
┌─────────────────────────────────────────────────────────────┐
│                      Chain Family (链族)                      │
│         抽象公有特征：evm, svm, move, utxo, ton, cosmos       │
├─────────────────────────────────────────────────────────────┤
│                    Chain Instance (具体链)                    │
│      区分实例：ethereum, base, solana, sui, bitcoin...       │
├─────────────────────────────────────────────────────────────┤
│                  Metadata Nesting (元数据嵌套)                 │
│              使用嵌套文档存储特定链的独有字段                    │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 支持的链族一览

| 链族 | 代表链 | 特点 | 典型字段 |
|------|--------|------|----------|
| `evm` | Ethereum, Base, Arbitrum, Polygon | 账户模型，智能合约 | gasUsed, nonce, logs |
| `svm` | Solana | 并行执行，账户租金 | instructions, computeUnits |
| `move` | Sui, Aptos | 资源导向，对象模型 | entryFunction, events |
| `utxo` | Bitcoin, Litecoin | UTXO 模型 | inputs, outputs |
| `ton` | TON | Actor 模型，异步消息 | messageHash, workchain |
| `cosmos` | Cosmos Hub, Osmosis | IBC 跨链，模块化 | memo, ibcInfo |

---

## 2. TypeScript 类型定义

### 2.1 基础枚举类型

```typescript
// types/enums.ts

/** 支持的链族类型 */
export enum ChainFamily {
  EVM = 'evm',
  SVM = 'svm',
  MOVE = 'move',
  UTXO = 'utxo',
  TON = 'ton',
  COSMOS = 'cosmos',
}

/** 链状态 */
export enum ChainStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  DEPRECATED = 'deprecated',
}

/** 交易状态 */
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  DROPPED = 'dropped',
}

/** 活动类型 */
export enum ActivityType {
  TRANSFER = 'transfer',
  SWAP = 'swap',
  MINT = 'mint',
  BURN = 'burn',
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  BRIDGE = 'bridge',
  APPROVE = 'approve',
  CLAIM = 'claim',
  LIQUIDITY_ADD = 'liquidity_add',
  LIQUIDITY_REMOVE = 'liquidity_remove',
  NFT_MINT = 'nft_mint',
  NFT_TRANSFER = 'nft_transfer',
  GOVERNANCE_VOTE = 'governance_vote',
  CONTRACT_DEPLOY = 'contract_deploy',
  OTHER = 'other',
}
```

### 2.2 链元数据类型

```typescript
// types/chain.ts

import { ChainFamily, ChainStatus } from './enums';

/** 链元数据接口 */
export interface IChain {
  /** 唯一标识，使用小写字符串 (如 'base', 'ethereum') */
  _id: string;

  /** 链的显示名称 */
  name: string;

  /** 链族分类 */
  family: ChainFamily;

  /** 链官方 ID (EVM 为数字字符串) */
  chainId: string;

  /** 原生代币符号 */
  nativeToken: string;

  /** 原生代币精度 (默认 18) */
  nativeTokenDecimals: number;

  /** RPC 节点地址列表 */
  rpcUrls: string[];

  /** WebSocket 节点地址列表 */
  wsUrls?: string[];

  /** 区块浏览器 URL */
  explorerUrl?: string;

  /** 区块浏览器 API URL */
  explorerApiUrl?: string;

  /** 是否为测试网 */
  isTestnet: boolean;

  /** 链状态 */
  status: ChainStatus;

  /** 平均出块时间 (秒) */
  blockTime?: number;

  /** 链图标 URL */
  iconUrl?: string;

  /** 额外配置 */
  config?: {
    /** 是否支持 EIP-1559 */
    supportsEIP1559?: boolean;
    /** 是否支持追踪 API */
    supportsTracing?: boolean;
    /** 最大区块范围查询限制 */
    maxBlockRange?: number;
  };

  /** 创建时间 */
  createdAt: Date;

  /** 更新时间 */
  updatedAt: Date;
}

/** 创建链的输入类型 */
export type CreateChainInput = Omit<IChain, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: string;
};

/** 更新链的输入类型 */
export type UpdateChainInput = Partial<Omit<IChain, '_id' | 'createdAt' | 'updatedAt'>>;
```

### 2.3 链族特定元数据类型

```typescript
// types/metadata.ts

/** EVM 链特有元数据 */
export interface IEvmMetadata {
  /** Gas 使用量 */
  gasUsed: string;

  /** 累计 Gas 使用量 */
  cumulativeGasUsed?: string;

  /** Gas 价格 (wei) */
  gasPrice?: string;

  /** 最大优先费用 (EIP-1559) */
  maxPriorityFeePerGas?: string;

  /** 最大费用 (EIP-1559) */
  maxFeePerGas?: string;

  /** 交易 nonce */
  nonce: number;

  /** 交易类型 (0: legacy, 2: EIP-1559) */
  type?: number;

  /** 交易输入数据 */
  input?: string;

  /** 合约地址 (如果是合约创建交易) */
  contractAddress?: string;

  /** 事件日志 */
  logs?: IEvmLog[];

  /** 内部交易 (需要 trace API) */
  internalTransactions?: IEvmInternalTx[];
}

/** EVM 事件日志 */
export interface IEvmLog {
  /** 日志索引 */
  logIndex: number;

  /** 合约地址 */
  address: string;

  /** 主题 (indexed 参数) */
  topics: string[];

  /** 数据 (non-indexed 参数) */
  data: string;

  /** 是否已移除 (链重组) */
  removed?: boolean;
}

/** EVM 内部交易 */
export interface IEvmInternalTx {
  /** 调用类型 */
  type: 'call' | 'create' | 'delegatecall' | 'staticcall';

  /** 发送方 */
  from: string;

  /** 接收方 */
  to: string;

  /** 转账金额 */
  value: string;

  /** 调用深度 */
  depth: number;
}

/** Solana (SVM) 链特有元数据 */
export interface ISvmMetadata {
  /** 最近区块哈希 */
  recentBlockhash: string;

  /** 计算单元消耗 */
  computeUnits: number;

  /** 费用 (lamports) */
  fee: string;

  /** 指令列表 */
  instructions: ISvmInstruction[];

  /** 内部指令 */
  innerInstructions?: ISvmInnerInstruction[];

  /** 日志消息 */
  logMessages?: string[];

  /** 账户变更 */
  accountChanges?: ISvmAccountChange[];

  /** 签名者列表 */
  signers: string[];
}

/** Solana 指令 */
export interface ISvmInstruction {
  /** 程序 ID */
  programId: string;

  /** 账户列表 */
  accounts: string[];

  /** 指令数据 (base58/base64) */
  data: string;

  /** 解码后的指令类型 (如果可识别) */
  decodedType?: string;
}

/** Solana 内部指令 */
export interface ISvmInnerInstruction {
  /** 父指令索引 */
  index: number;

  /** 内部指令列表 */
  instructions: ISvmInstruction[];
}

/** Solana 账户变更 */
export interface ISvmAccountChange {
  /** 账户地址 */
  address: string;

  /** 变更前余额 */
  preBalance: string;

  /** 变更后余额 */
  postBalance: string;
}

/** Move (Sui/Aptos) 链特有元数据 */
export interface IMoveMetadata {
  /** 入口函数 (如 '0x1::coin::transfer') */
  entryFunction: string;

  /** 函数参数 */
  arguments: string[];

  /** 类型参数 */
  typeArguments?: string[];

  /** 事件列表 */
  events: IMoveEvent[];

  /** Gas 对象 (Sui) */
  gasObject?: {
    objectId: string;
    version: string;
  };

  /** 对象变更 (Sui) */
  objectChanges?: IMoveObjectChange[];

  /** 序列号 (Aptos) */
  sequenceNumber?: string;
}

/** Move 事件 */
export interface IMoveEvent {
  /** 事件类型 */
  type: string;

  /** 事件内容 */
  contents: Record<string, unknown>;

  /** 发送者 */
  sender?: string;

  /** 事件序列号 */
  sequenceNumber?: string;
}

/** Move 对象变更 */
export interface IMoveObjectChange {
  /** 对象 ID */
  objectId: string;

  /** 变更类型 */
  changeType: 'created' | 'mutated' | 'deleted' | 'wrapped' | 'unwrapped';

  /** 对象类型 */
  objectType: string;

  /** 版本号 */
  version: string;
}

/** Bitcoin (UTXO) 链特有元数据 */
export interface IUtxoMetadata {
  /** 输入列表 */
  inputs: IUtxoInput[];

  /** 输出列表 */
  outputs: IUtxoOutput[];

  /** 交易大小 (bytes) */
  size: number;

  /** 虚拟大小 (vbytes, SegWit) */
  vsize?: number;

  /** 权重 (weight units) */
  weight?: number;

  /** 费用 (satoshis) */
  fee: string;

  /** 费率 (sat/vB) */
  feeRate?: number;

  /** 锁定时间 */
  lockTime?: number;

  /** 版本 */
  version: number;

  /** 是否为 Coinbase 交易 */
  isCoinbase?: boolean;
}

/** UTXO 输入 */
export interface IUtxoInput {
  /** 前序交易哈希 */
  txid: string;

  /** 前序输出索引 */
  vout: number;

  /** 解锁脚本 */
  scriptSig?: string;

  /** 见证数据 (SegWit) */
  witness?: string[];

  /** 序列号 */
  sequence: number;

  /** 来源地址 (解析得到) */
  address?: string;

  /** 来源金额 (解析得到) */
  value?: string;
}

/** UTXO 输出 */
export interface IUtxoOutput {
  /** 输出索引 */
  n: number;

  /** 金额 (satoshis) */
  value: string;

  /** 锁定脚本 */
  scriptPubKey: string;

  /** 脚本类型 */
  type?: string;

  /** 目标地址 */
  address?: string;

  /** 是否已花费 */
  spent?: boolean;

  /** 花费交易哈希 */
  spentTxid?: string;
}

/** TON 链特有元数据 */
export interface ITonMetadata {
  /** 消息哈希 */
  messageHash: string;

  /** 工作链 ID */
  workchain: number;

  /** 分片 ID */
  shard: string;

  /** 逻辑时间 */
  lt: string;

  /** 消息列表 */
  messages: ITonMessage[];

  /** 费用详情 */
  fees: {
    totalFees: string;
    gasFees: string;
    storageFees: string;
    forwardFees?: string;
  };

  /** 计算阶段 */
  computePhase?: {
    success: boolean;
    gasUsed: string;
    exitCode: number;
  };
}

/** TON 消息 */
export interface ITonMessage {
  /** 消息类型 */
  type: 'internal' | 'external_in' | 'external_out';

  /** 来源地址 */
  source?: string;

  /** 目标地址 */
  destination?: string;

  /** 金额 */
  value: string;

  /** 消息体 */
  body?: string;

  /** 操作码 */
  opcode?: string;
}

/** Cosmos 链特有元数据 */
export interface ICosmosMetadata {
  /** 备注 */
  memo?: string;

  /** Gas 需求 */
  gasWanted: string;

  /** Gas 使用量 */
  gasUsed: string;

  /** 费用 */
  fee: {
    amount: { denom: string; amount: string }[];
    gasLimit: string;
    payer?: string;
    granter?: string;
  };

  /** 消息列表 */
  messages: ICosmosMessage[];

  /** 事件列表 */
  events: ICosmosEvent[];

  /** IBC 信息 (如果是跨链交易) */
  ibcInfo?: {
    sourceChannel: string;
    sourcePort: string;
    destChannel?: string;
    destPort?: string;
    sequence?: string;
    timeout?: {
      height?: string;
      timestamp?: string;
    };
  };
}

/** Cosmos 消息 */
export interface ICosmosMessage {
  /** 消息类型 (如 '/cosmos.bank.v1beta1.MsgSend') */
  typeUrl: string;

  /** 消息内容 */
  value: Record<string, unknown>;
}

/** Cosmos 事件 */
export interface ICosmosEvent {
  /** 事件类型 */
  type: string;

  /** 属性列表 */
  attributes: { key: string; value: string }[];
}

/** 所有链族元数据的联合类型 */
export interface IChainMetadata {
  evm?: IEvmMetadata;
  svm?: ISvmMetadata;
  move?: IMoveMetadata;
  utxo?: IUtxoMetadata;
  ton?: ITonMetadata;
  cosmos?: ICosmosMetadata;
}
```

### 2.4 活动/交易类型

```typescript
// types/activity.ts

import { Types } from 'mongoose';
import { ChainFamily, TransactionStatus, ActivityType } from './enums';
import { IChainMetadata } from './metadata';

/** 代币信息 */
export interface ITokenInfo {
  /** 代币合约地址 */
  address: string;

  /** 代币符号 */
  symbol: string;

  /** 代币名称 */
  name?: string;

  /** 代币精度 */
  decimals: number;

  /** 是否为原生代币 */
  isNative?: boolean;
}

/** 金额信息 */
export interface IAmountInfo {
  /** 原始金额 (最小单位，字符串) */
  raw: string;

  /** 格式化金额 (人类可读) */
  formatted?: string;

  /** USD 价值 (记录时的价格) */
  usdValue?: string;
}

/** 活动/交易接口 */
export interface IActivity {
  /** MongoDB ObjectId */
  _id: Types.ObjectId;

  /** 项目/协议唯一 ID */
  projectId: string;

  // --- 路由与索引字段 ---

  /** 具体链 (对应 chains._id) */
  chain: string;

  /** 链族 (用于跨链分类查询) */
  chainFamily: ChainFamily;

  // --- 通用交易字段 ---

  /** 交易哈希 (必须建立唯一索引) */
  txHash: string;

  /** 区块高度 */
  blockNumber: number;

  /** 区块哈希 */
  blockHash?: string;

  /** 交易在区块中的索引 */
  transactionIndex?: number;

  /** 区块时间戳 */
  timestamp: Date;

  /** 发起方地址 */
  from: string;

  /** 接收方或合约地址 */
  to: string;

  /** 原始金额 (建议存字符串以防大数溢出) */
  value: string;

  /** 交易状态 */
  status: TransactionStatus;

  /** 业务类型 */
  activityType: ActivityType;

  // --- 扩展字段 ---

  /** 涉及的代币信息 */
  tokens?: {
    /** 输入代币 */
    tokenIn?: ITokenInfo & IAmountInfo;
    /** 输出代币 */
    tokenOut?: ITokenInfo & IAmountInfo;
    /** 额外代币 (如手续费代币) */
    additionalTokens?: (ITokenInfo & IAmountInfo)[];
  };

  /** 合约/协议信息 */
  contract?: {
    /** 合约地址 */
    address: string;
    /** 合约名称 */
    name?: string;
    /** 调用的方法名 */
    method?: string;
    /** 方法签名 */
    methodSignature?: string;
  };

  /** 解析后的业务数据 */
  parsedData?: Record<string, unknown>;

  /** 标签 (用于分类和搜索) */
  tags?: string[];

  /** 备注 */
  notes?: string;

  // --- 异构链特定数据 ---

  /** 链族特定元数据 */
  metadata: IChainMetadata;

  // --- 审计字段 ---

  /** 数据来源 */
  source?: 'rpc' | 'indexer' | 'manual' | 'api';

  /** 数据版本 (用于 schema 迁移) */
  schemaVersion: number;

  /** 创建时间 */
  createdAt: Date;

  /** 更新时间 */
  updatedAt: Date;

  /** 最后同步时间 */
  lastSyncedAt?: Date;
}

/** 创建活动的输入类型 */
export type CreateActivityInput = Omit<
  IActivity,
  '_id' | 'createdAt' | 'updatedAt' | 'schemaVersion'
>;

/** 更新活动的输入类型 */
export type UpdateActivityInput = Partial<
  Omit<IActivity, '_id' | 'txHash' | 'chain' | 'createdAt' | 'updatedAt'>
>;

/** 活动查询过滤器 */
export interface IActivityFilter {
  projectId?: string;
  chain?: string | string[];
  chainFamily?: ChainFamily | ChainFamily[];
  from?: string;
  to?: string;
  address?: string; // from OR to
  activityType?: ActivityType | ActivityType[];
  status?: TransactionStatus | TransactionStatus[];
  minValue?: string;
  maxValue?: string;
  startTime?: Date;
  endTime?: Date;
  tags?: string[];
  txHash?: string;
}

/** 分页选项 */
export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** 分页结果 */
export interface IPaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

---

## 3. Mongoose Schema 定义

### 3.1 链元数据 Schema

```typescript
// schemas/chain.schema.ts

import mongoose, { Schema, Model } from 'mongoose';
import { IChain } from '../types/chain';
import { ChainFamily, ChainStatus } from '../types/enums';

const ChainSchema = new Schema<IChain>(
  {
    _id: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    family: {
      type: String,
      required: true,
      enum: Object.values(ChainFamily),
      index: true,
    },
    chainId: {
      type: String,
      required: true,
      index: true,
    },
    nativeToken: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    nativeTokenDecimals: {
      type: Number,
      required: true,
      default: 18,
      min: 0,
      max: 36,
    },
    rpcUrls: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: '至少需要一个 RPC URL',
      },
    },
    wsUrls: [String],
    explorerUrl: String,
    explorerApiUrl: String,
    isTestnet: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(ChainStatus),
      default: ChainStatus.ACTIVE,
      index: true,
    },
    blockTime: {
      type: Number,
      min: 0,
    },
    iconUrl: String,
    config: {
      supportsEIP1559: Boolean,
      supportsTracing: Boolean,
      maxBlockRange: Number,
    },
  },
  {
    timestamps: true,
    collection: 'chains',
  }
);

// 复合索引
ChainSchema.index({ family: 1, status: 1 });
ChainSchema.index({ chainId: 1, family: 1 }, { unique: true });

// 虚拟属性
ChainSchema.virtual('primaryRpcUrl').get(function () {
  return this.rpcUrls[0];
});

// 静态方法
ChainSchema.statics.findActiveByFamily = function (family: ChainFamily) {
  return this.find({ family, status: ChainStatus.ACTIVE });
};

ChainSchema.statics.findByChainId = function (chainId: string, family?: ChainFamily) {
  const query: Record<string, unknown> = { chainId };
  if (family) query.family = family;
  return this.findOne(query);
};

// 实例方法
ChainSchema.methods.isAvailable = function (): boolean {
  return this.status === ChainStatus.ACTIVE;
};

// 钩子
ChainSchema.pre('save', function (next) {
  // 确保 _id 为小写
  if (this._id) {
    this._id = this._id.toLowerCase();
  }
  next();
});

export interface IChainModel extends Model<IChain> {
  findActiveByFamily(family: ChainFamily): Promise<IChain[]>;
  findByChainId(chainId: string, family?: ChainFamily): Promise<IChain | null>;
}

export const Chain = mongoose.model<IChain, IChainModel>('Chain', ChainSchema);
```

### 3.2 活动/交易 Schema

```typescript
// schemas/activity.schema.ts

import mongoose, { Schema, Model, Query } from 'mongoose';
import { IActivity, IActivityFilter, IPaginationOptions, IPaginatedResult } from '../types/activity';
import { ChainFamily, TransactionStatus, ActivityType } from '../types/enums';

// 当前 Schema 版本
const CURRENT_SCHEMA_VERSION = 1;

// EVM 元数据子 Schema
const EvmLogSchema = new Schema(
  {
    logIndex: { type: Number, required: true },
    address: { type: String, required: true, lowercase: true },
    topics: [{ type: String, required: true }],
    data: { type: String, required: true },
    removed: { type: Boolean, default: false },
  },
  { _id: false }
);

const EvmMetadataSchema = new Schema(
  {
    gasUsed: { type: String, required: true },
    cumulativeGasUsed: String,
    gasPrice: String,
    maxPriorityFeePerGas: String,
    maxFeePerGas: String,
    nonce: { type: Number, required: true },
    type: Number,
    input: String,
    contractAddress: { type: String, lowercase: true },
    logs: [EvmLogSchema],
    internalTransactions: [
      {
        type: { type: String, enum: ['call', 'create', 'delegatecall', 'staticcall'] },
        from: { type: String, lowercase: true },
        to: { type: String, lowercase: true },
        value: String,
        depth: Number,
      },
    ],
  },
  { _id: false }
);

// SVM 元数据子 Schema
const SvmMetadataSchema = new Schema(
  {
    recentBlockhash: { type: String, required: true },
    computeUnits: { type: Number, required: true },
    fee: { type: String, required: true },
    instructions: [
      {
        programId: { type: String, required: true },
        accounts: [String],
        data: String,
        decodedType: String,
      },
    ],
    innerInstructions: [
      {
        index: Number,
        instructions: [
          {
            programId: String,
            accounts: [String],
            data: String,
          },
        ],
      },
    ],
    logMessages: [String],
    accountChanges: [
      {
        address: String,
        preBalance: String,
        postBalance: String,
      },
    ],
    signers: [String],
  },
  { _id: false }
);

// Move 元数据子 Schema
const MoveMetadataSchema = new Schema(
  {
    entryFunction: { type: String, required: true },
    arguments: [String],
    typeArguments: [String],
    events: [
      {
        type: { type: String, required: true },
        contents: Schema.Types.Mixed,
        sender: String,
        sequenceNumber: String,
      },
    ],
    gasObject: {
      objectId: String,
      version: String,
    },
    objectChanges: [
      {
        objectId: String,
        changeType: {
          type: String,
          enum: ['created', 'mutated', 'deleted', 'wrapped', 'unwrapped'],
        },
        objectType: String,
        version: String,
      },
    ],
    sequenceNumber: String,
  },
  { _id: false }
);

// UTXO 元数据子 Schema
const UtxoMetadataSchema = new Schema(
  {
    inputs: [
      {
        txid: { type: String, required: true },
        vout: { type: Number, required: true },
        scriptSig: String,
        witness: [String],
        sequence: Number,
        address: String,
        value: String,
      },
    ],
    outputs: [
      {
        n: { type: Number, required: true },
        value: { type: String, required: true },
        scriptPubKey: { type: String, required: true },
        type: String,
        address: String,
        spent: Boolean,
        spentTxid: String,
      },
    ],
    size: { type: Number, required: true },
    vsize: Number,
    weight: Number,
    fee: { type: String, required: true },
    feeRate: Number,
    lockTime: Number,
    version: { type: Number, required: true },
    isCoinbase: Boolean,
  },
  { _id: false }
);

// TON 元数据子 Schema
const TonMetadataSchema = new Schema(
  {
    messageHash: { type: String, required: true },
    workchain: { type: Number, required: true },
    shard: { type: String, required: true },
    lt: { type: String, required: true },
    messages: [
      {
        type: { type: String, enum: ['internal', 'external_in', 'external_out'] },
        source: String,
        destination: String,
        value: String,
        body: String,
        opcode: String,
      },
    ],
    fees: {
      totalFees: String,
      gasFees: String,
      storageFees: String,
      forwardFees: String,
    },
    computePhase: {
      success: Boolean,
      gasUsed: String,
      exitCode: Number,
    },
  },
  { _id: false }
);

// Cosmos 元数据子 Schema
const CosmosMetadataSchema = new Schema(
  {
    memo: String,
    gasWanted: { type: String, required: true },
    gasUsed: { type: String, required: true },
    fee: {
      amount: [
        {
          denom: String,
          amount: String,
        },
      ],
      gasLimit: String,
      payer: String,
      granter: String,
    },
    messages: [
      {
        typeUrl: { type: String, required: true },
        value: Schema.Types.Mixed,
      },
    ],
    events: [
      {
        type: { type: String, required: true },
        attributes: [
          {
            key: String,
            value: String,
          },
        ],
      },
    ],
    ibcInfo: {
      sourceChannel: String,
      sourcePort: String,
      destChannel: String,
      destPort: String,
      sequence: String,
      timeout: {
        height: String,
        timestamp: String,
      },
    },
  },
  { _id: false }
);

// 代币信息子 Schema
const TokenInfoSchema = new Schema(
  {
    address: { type: String, required: true, lowercase: true },
    symbol: { type: String, required: true },
    name: String,
    decimals: { type: Number, required: true },
    isNative: Boolean,
    raw: { type: String, required: true },
    formatted: String,
    usdValue: String,
  },
  { _id: false }
);

// 主 Activity Schema
const ActivitySchema = new Schema<IActivity>(
  {
    projectId: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    chain: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
    },
    chainFamily: {
      type: String,
      required: true,
      enum: Object.values(ChainFamily),
      index: true,
    },
    txHash: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    blockNumber: {
      type: Number,
      required: true,
      index: true,
      min: 0,
    },
    blockHash: {
      type: String,
      lowercase: true,
    },
    transactionIndex: {
      type: Number,
      min: 0,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    from: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    to: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      default: '0',
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.CONFIRMED,
      index: true,
    },
    activityType: {
      type: String,
      required: true,
      enum: Object.values(ActivityType),
      index: true,
    },
    tokens: {
      tokenIn: TokenInfoSchema,
      tokenOut: TokenInfoSchema,
      additionalTokens: [TokenInfoSchema],
    },
    contract: {
      address: { type: String, lowercase: true },
      name: String,
      method: String,
      methodSignature: String,
    },
    parsedData: Schema.Types.Mixed,
    tags: {
      type: [String],
      index: true,
      default: [],
    },
    notes: String,
    metadata: {
      evm: EvmMetadataSchema,
      svm: SvmMetadataSchema,
      move: MoveMetadataSchema,
      utxo: UtxoMetadataSchema,
      ton: TonMetadataSchema,
      cosmos: CosmosMetadataSchema,
    },
    source: {
      type: String,
      enum: ['rpc', 'indexer', 'manual', 'api'],
      default: 'rpc',
    },
    schemaVersion: {
      type: Number,
      required: true,
      default: CURRENT_SCHEMA_VERSION,
    },
    lastSyncedAt: Date,
  },
  {
    timestamps: true,
    collection: 'activities',
  }
);

// ========== 索引定义 ==========

// 唯一索引：交易哈希 + 链 (同一交易可能在不同链上)
ActivitySchema.index({ txHash: 1, chain: 1 }, { unique: true });

// 项目多链时间流
ActivitySchema.index({ projectId: 1, timestamp: -1 });

// 特定链数据过滤
ActivitySchema.index({ projectId: 1, chain: 1, timestamp: -1 });

// 用户资产历史 (发出)
ActivitySchema.index({ from: 1, timestamp: -1 });

// 用户资产历史 (接收)
ActivitySchema.index({ to: 1, timestamp: -1 });

// 地址活动 (任意方向)
ActivitySchema.index({ from: 1, to: 1, timestamp: -1 });

// 链族分析
ActivitySchema.index({ chainFamily: 1, activityType: 1, timestamp: -1 });

// 项目+活动类型
ActivitySchema.index({ projectId: 1, activityType: 1, timestamp: -1 });

// 区块索引 (用于区块重组处理)
ActivitySchema.index({ chain: 1, blockNumber: -1 });

// 状态索引 (查询待确认交易)
ActivitySchema.index({ status: 1, timestamp: -1 });

// 标签搜索
ActivitySchema.index({ tags: 1, timestamp: -1 });

// ========== 静态方法 ==========

ActivitySchema.statics.findByFilter = async function (
  filter: IActivityFilter,
  options: IPaginationOptions = {}
): Promise<IPaginatedResult<IActivity>> {
  const {
    page = 1,
    limit = 20,
    sortBy = 'timestamp',
    sortOrder = 'desc',
  } = options;

  const query: Record<string, unknown> = {};

  if (filter.projectId) query.projectId = filter.projectId;
  if (filter.chain) {
    query.chain = Array.isArray(filter.chain) ? { $in: filter.chain } : filter.chain;
  }
  if (filter.chainFamily) {
    query.chainFamily = Array.isArray(filter.chainFamily)
      ? { $in: filter.chainFamily }
      : filter.chainFamily;
  }
  if (filter.from) query.from = filter.from.toLowerCase();
  if (filter.to) query.to = filter.to.toLowerCase();
  if (filter.address) {
    const addr = filter.address.toLowerCase();
    query.$or = [{ from: addr }, { to: addr }];
  }
  if (filter.activityType) {
    query.activityType = Array.isArray(filter.activityType)
      ? { $in: filter.activityType }
      : filter.activityType;
  }
  if (filter.status) {
    query.status = Array.isArray(filter.status) ? { $in: filter.status } : filter.status;
  }
  if (filter.minValue || filter.maxValue) {
    query.value = {};
    if (filter.minValue) (query.value as Record<string, string>).$gte = filter.minValue;
    if (filter.maxValue) (query.value as Record<string, string>).$lte = filter.maxValue;
  }
  if (filter.startTime || filter.endTime) {
    query.timestamp = {};
    if (filter.startTime) (query.timestamp as Record<string, Date>).$gte = filter.startTime;
    if (filter.endTime) (query.timestamp as Record<string, Date>).$lte = filter.endTime;
  }
  if (filter.tags && filter.tags.length > 0) {
    query.tags = { $all: filter.tags };
  }
  if (filter.txHash) query.txHash = filter.txHash.toLowerCase();

  const skip = (page - 1) * limit;
  const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [data, total] = await Promise.all([
    this.find(query).sort(sort).skip(skip).limit(limit).lean(),
    this.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

ActivitySchema.statics.findRecentByProject = function (
  projectId: string,
  limit = 50
) {
  return this.find({ projectId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

ActivitySchema.statics.findByAddress = function (
  address: string,
  options: { chain?: string; limit?: number } = {}
) {
  const query: Record<string, unknown> = {
    $or: [
      { from: address.toLowerCase() },
      { to: address.toLowerCase() },
    ],
  };
  if (options.chain) query.chain = options.chain;

  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(options.limit || 100)
    .lean();
};

ActivitySchema.statics.aggregateByChain = function (
  startTime: Date,
  endTime?: Date
) {
  const match: Record<string, unknown> = {
    timestamp: { $gte: startTime },
  };
  if (endTime) {
    (match.timestamp as Record<string, Date>).$lte = endTime;
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$chain',
        count: { $sum: 1 },
        uniqueAddresses: { $addToSet: '$from' },
      },
    },
    {
      $project: {
        chain: '$_id',
        count: 1,
        uniqueAddressCount: { $size: '$uniqueAddresses' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// ========== 实例方法 ==========

ActivitySchema.methods.getExplorerUrl = async function (): Promise<string | null> {
  const Chain = mongoose.model('Chain');
  const chain = await Chain.findById(this.chain);
  if (!chain?.explorerUrl) return null;
  return `${chain.explorerUrl}/tx/${this.txHash}`;
};

ActivitySchema.methods.isConfirmed = function (): boolean {
  return this.status === TransactionStatus.CONFIRMED;
};

// ========== 中间件 ==========

// 保存前验证
ActivitySchema.pre('save', function (next) {
  // 确保地址格式一致
  if (this.from) this.from = this.from.toLowerCase();
  if (this.to) this.to = this.to.toLowerCase();
  if (this.txHash) this.txHash = this.txHash.toLowerCase();

  // 验证 metadata 与 chainFamily 匹配
  const familyMetadataMap: Record<ChainFamily, string> = {
    [ChainFamily.EVM]: 'evm',
    [ChainFamily.SVM]: 'svm',
    [ChainFamily.MOVE]: 'move',
    [ChainFamily.UTXO]: 'utxo',
    [ChainFamily.TON]: 'ton',
    [ChainFamily.COSMOS]: 'cosmos',
  };

  const expectedKey = familyMetadataMap[this.chainFamily as ChainFamily];
  if (expectedKey && this.metadata && !this.metadata[expectedKey as keyof typeof this.metadata]) {
    console.warn(
      `警告: chainFamily 为 ${this.chainFamily}，但 metadata.${expectedKey} 未设置`
    );
  }

  next();
});

// 更新 lastSyncedAt
ActivitySchema.pre('findOneAndUpdate', function () {
  this.set({ lastSyncedAt: new Date() });
});

export interface IActivityModel extends Model<IActivity> {
  findByFilter(
    filter: IActivityFilter,
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<IActivity>>;
  findRecentByProject(projectId: string, limit?: number): Promise<IActivity[]>;
  findByAddress(
    address: string,
    options?: { chain?: string; limit?: number }
  ): Promise<IActivity[]>;
  aggregateByChain(
    startTime: Date,
    endTime?: Date
  ): Promise<{ chain: string; count: number; uniqueAddressCount: number }[]>;
}

export const Activity = mongoose.model<IActivity, IActivityModel>(
  'Activity',
  ActivitySchema
);
```

---

## 4. 数据库集合设计

### 4.1 集合概览

| 集合名 | 用途 | 预估数据量 | 分片建议 |
|--------|------|------------|----------|
| `chains` | 链元数据配置 | 数十条 | 不分片 |
| `activities` | 核心交易/活动数据 | 数十亿条 | 按 chain + timestamp 分片 |
| `projects` | 项目/协议配置 | 数千条 | 不分片 |
| `sync_status` | 同步状态跟踪 | 数百条 | 不分片 |
| `address_labels` | 地址标签 | 数百万条 | 按 address 哈希分片 |

### 4.2 链元数据表 (`chains`) 详细设计

```javascript
// 完整示例文档
{
  "_id": "base",
  "name": "Base Mainnet",
  "family": "evm",
  "chainId": "8453",
  "nativeToken": "ETH",
  "nativeTokenDecimals": 18,
  "rpcUrls": [
    "https://mainnet.base.org",
    "https://base.llamarpc.com",
    "https://1rpc.io/base"
  ],
  "wsUrls": [
    "wss://base.publicnode.com"
  ],
  "explorerUrl": "https://basescan.org",
  "explorerApiUrl": "https://api.basescan.org/api",
  "isTestnet": false,
  "status": "active",
  "blockTime": 2,
  "iconUrl": "https://example.com/base-icon.png",
  "config": {
    "supportsEIP1559": true,
    "supportsTracing": false,
    "maxBlockRange": 10000
  },
  "createdAt": ISODate("2024-01-01T00:00:00Z"),
  "updatedAt": ISODate("2024-03-20T10:00:00Z")
}
```

### 4.3 活动/交易表 (`activities`) 详细设计

```javascript
// EVM 链完整示例
{
  "_id": ObjectId("65f123456789abcdef012345"),
  "projectId": "uniswap-v3",
  "chain": "base",
  "chainFamily": "evm",
  "txHash": "0xabc123def456789...",
  "blockNumber": 1823456,
  "blockHash": "0xblock123...",
  "transactionIndex": 42,
  "timestamp": ISODate("2024-03-20T10:00:00Z"),
  "from": "0xuser123...",
  "to": "0xcontract456...",
  "value": "0",
  "status": "confirmed",
  "activityType": "swap",
  "tokens": {
    "tokenIn": {
      "address": "0xusdc...",
      "symbol": "USDC",
      "name": "USD Coin",
      "decimals": 6,
      "raw": "1000000000",
      "formatted": "1000",
      "usdValue": "1000"
    },
    "tokenOut": {
      "address": "0xweth...",
      "symbol": "WETH",
      "name": "Wrapped Ether",
      "decimals": 18,
      "raw": "500000000000000000",
      "formatted": "0.5",
      "usdValue": "1000"
    }
  },
  "contract": {
    "address": "0xswapRouter...",
    "name": "SwapRouter02",
    "method": "exactInputSingle",
    "methodSignature": "0x414bf389"
  },
  "parsedData": {
    "poolAddress": "0xpool...",
    "fee": 3000,
    "sqrtPriceLimitX96": "0"
  },
  "tags": ["defi", "swap", "whale"],
  "metadata": {
    "evm": {
      "gasUsed": "150000",
      "gasPrice": "1000000000",
      "maxFeePerGas": "2000000000",
      "maxPriorityFeePerGas": "100000000",
      "nonce": 42,
      "type": 2,
      "input": "0x414bf389...",
      "logs": [
        {
          "logIndex": 0,
          "address": "0xusdc...",
          "topics": [
            "0xddf252ad...",
            "0x000...user123",
            "0x000...pool"
          ],
          "data": "0x000...3b9aca00"
        }
      ]
    }
  },
  "source": "rpc",
  "schemaVersion": 1,
  "createdAt": ISODate("2024-03-20T10:05:00Z"),
  "updatedAt": ISODate("2024-03-20T10:05:00Z"),
  "lastSyncedAt": ISODate("2024-03-20T10:05:00Z")
}
```

### 4.4 同步状态表 (`sync_status`)

```typescript
// types/sync-status.ts

export interface ISyncStatus {
  _id: string; // 格式: "{projectId}:{chain}"
  projectId: string;
  chain: string;
  lastSyncedBlock: number;
  lastSyncedTimestamp: Date;
  status: 'syncing' | 'synced' | 'error' | 'paused';
  errorMessage?: string;
  errorCount: number;
  syncSpeed: number; // 每秒处理的区块数
  estimatedCompletion?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

```javascript
// 示例文档
{
  "_id": "uniswap-v3:base",
  "projectId": "uniswap-v3",
  "chain": "base",
  "lastSyncedBlock": 1823450,
  "lastSyncedTimestamp": ISODate("2024-03-20T09:55:00Z"),
  "status": "syncing",
  "errorCount": 0,
  "syncSpeed": 50,
  "estimatedCompletion": ISODate("2024-03-20T12:00:00Z"),
  "createdAt": ISODate("2024-01-01T00:00:00Z"),
  "updatedAt": ISODate("2024-03-20T10:00:00Z")
}
```

### 4.5 地址标签表 (`address_labels`)

```typescript
// types/address-label.ts

export interface IAddressLabel {
  _id: string; // 格式: "{chain}:{address}"
  chain: string;
  address: string;
  labels: string[];
  name?: string;
  category?: 'exchange' | 'defi' | 'bridge' | 'whale' | 'contract' | 'scam' | 'other';
  isContract: boolean;
  contractInfo?: {
    name: string;
    symbol?: string;
    decimals?: number;
    verified: boolean;
    createdAt?: Date;
  };
  riskScore?: number; // 0-100
  source: 'manual' | 'etherscan' | 'arkham' | 'chainalysis' | 'community';
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 5. 索引策略

### 5.1 索引设计原则

| 原则 | 说明 |
|------|------|
| **ESR 规则** | Equality → Sort → Range，按此顺序排列复合索引字段 |
| **覆盖查询** | 尽量让索引包含查询所需字段，避免回表 |
| **索引选择性** | 高基数字段放前面，低基数字段放后面 |
| **写入权衡** | 索引过多会影响写入性能，需权衡 |

### 5.2 完整索引列表

```javascript
// chains 集合索引
db.chains.createIndex({ family: 1, status: 1 });
db.chains.createIndex({ chainId: 1, family: 1 }, { unique: true });

// activities 集合索引
// 唯一索引
db.activities.createIndex(
  { txHash: 1, chain: 1 },
  { unique: true, background: true }
);

// 业务查询索引
db.activities.createIndex(
  { projectId: 1, timestamp: -1 },
  { background: true }
);

db.activities.createIndex(
  { projectId: 1, chain: 1, timestamp: -1 },
  { background: true }
);

db.activities.createIndex(
  { projectId: 1, activityType: 1, timestamp: -1 },
  { background: true }
);

// 地址查询索引
db.activities.createIndex(
  { from: 1, timestamp: -1 },
  { background: true }
);

db.activities.createIndex(
  { to: 1, timestamp: -1 },
  { background: true }
);

// 组合地址查询 (支持 from OR to)
db.activities.createIndex(
  { from: 1, to: 1, timestamp: -1 },
  { background: true }
);

// 链族分析索引
db.activities.createIndex(
  { chainFamily: 1, activityType: 1, timestamp: -1 },
  { background: true }
);

// 区块索引 (用于重组处理和区块级查询)
db.activities.createIndex(
  { chain: 1, blockNumber: -1 },
  { background: true }
);

// 状态索引
db.activities.createIndex(
  { status: 1, timestamp: -1 },
  { background: true,
    partialFilterExpression: { status: { $ne: "confirmed" } }
  }
);

// 标签索引 (多值索引)
db.activities.createIndex(
  { tags: 1, timestamp: -1 },
  { background: true,
    partialFilterExpression: { tags: { $exists: true, $ne: [] } }
  }
);

// TTL 索引 (测试网数据自动清理)
db.activities.createIndex(
  { createdAt: 1 },
  {
    background: true,
    expireAfterSeconds: 30 * 24 * 60 * 60, // 30 天
    partialFilterExpression: {
      chain: { $in: ["base-sepolia", "ethereum-goerli", "solana-devnet"] }
    }
  }
);

// sync_status 集合索引
db.sync_status.createIndex({ projectId: 1, chain: 1 }, { unique: true });
db.sync_status.createIndex({ status: 1, updatedAt: -1 });

// address_labels 集合索引
db.address_labels.createIndex({ chain: 1, address: 1 }, { unique: true });
db.address_labels.createIndex({ labels: 1 });
db.address_labels.createIndex({ category: 1, riskScore: -1 });
```

### 5.3 索引使用场景对照

| 业务场景 | 推荐索引 | 查询示例 |
|----------|----------|----------|
| 全网交易检索 | `{ txHash: 1, chain: 1 }` | `db.activities.findOne({ txHash, chain })` |
| 项目主页最新动态 | `{ projectId: 1, timestamp: -1 }` | `find({ projectId }).sort({ timestamp: -1 }).limit(50)` |
| 某项目某链历史 | `{ projectId: 1, chain: 1, timestamp: -1 }` | `find({ projectId, chain }).sort({ timestamp: -1 })` |
| 钱包交易历史 | `{ from: 1, timestamp: -1 }` | `find({ from: address }).sort({ timestamp: -1 })` |
| 钱包收款历史 | `{ to: 1, timestamp: -1 }` | `find({ to: address }).sort({ timestamp: -1 })` |
| 地址全部活动 | `{ from: 1, to: 1, timestamp: -1 }` | `find({ $or: [{ from }, { to }] }).sort(...)` |
| EVM 链 Swap 统计 | `{ chainFamily: 1, activityType: 1, timestamp: -1 }` | `aggregate([{ $match: { chainFamily: "evm", activityType: "swap" }}])` |
| 区块重组处理 | `{ chain: 1, blockNumber: -1 }` | `deleteMany({ chain, blockNumber: { $gte: reorgBlock }})` |

### 5.4 索引性能监控

```javascript
// 查看索引使用情况
db.activities.aggregate([
  { $indexStats: {} }
]);

// 查看查询执行计划
db.activities.find({
  projectId: "uniswap-v3",
  chain: "base"
}).explain("executionStats");

// 查看慢查询
db.setProfilingLevel(1, { slowms: 100 });
db.system.profile.find().sort({ ts: -1 }).limit(10);
```

---

## 6. 数据验证规则

### 6.1 JSON Schema 验证

```javascript
// 在 MongoDB 中设置集合验证器
db.runCommand({
  collMod: "activities",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["projectId", "chain", "chainFamily", "txHash", "blockNumber", "timestamp", "from", "to", "status", "activityType"],
      properties: {
        projectId: {
          bsonType: "string",
          pattern: "^[a-z0-9-]+$",
          description: "项目 ID 必须为小写字母、数字和连字符"
        },
        chain: {
          bsonType: "string",
          pattern: "^[a-z0-9-]+$",
          description: "链 ID 必须为小写"
        },
        chainFamily: {
          enum: ["evm", "svm", "move", "utxo", "ton", "cosmos"],
          description: "必须是支持的链族类型"
        },
        txHash: {
          bsonType: "string",
          minLength: 10,
          description: "交易哈希不能为空"
        },
        blockNumber: {
          bsonType: "int",
          minimum: 0,
          description: "区块高度必须为非负整数"
        },
        timestamp: {
          bsonType: "date",
          description: "时间戳必须为日期类型"
        },
        from: {
          bsonType: "string",
          minLength: 10,
          description: "发送地址不能为空"
        },
        to: {
          bsonType: "string",
          minLength: 10,
          description: "接收地址不能为空"
        },
        value: {
          bsonType: "string",
          pattern: "^[0-9]+$",
          description: "金额必须为数字字符串"
        },
        status: {
          enum: ["pending", "confirmed", "failed", "dropped"],
          description: "状态必须是有效值"
        },
        activityType: {
          enum: ["transfer", "swap", "mint", "burn", "stake", "unstake", "bridge", "approve", "claim", "liquidity_add", "liquidity_remove", "nft_mint", "nft_transfer", "governance_vote", "contract_deploy", "other"],
          description: "活动类型必须是有效值"
        },
        schemaVersion: {
          bsonType: "int",
          minimum: 1,
          description: "Schema 版本号必须为正整数"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});
```

### 6.2 应用层验证 (Zod)

```typescript
// validators/activity.validator.ts

import { z } from 'zod';
import { ChainFamily, TransactionStatus, ActivityType } from '../types/enums';

// 地址验证器
const evmAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, '无效的 EVM 地址');
const solanaAddressSchema = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, '无效的 Solana 地址');
const bitcoinAddressSchema = z.string().regex(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/, '无效的 Bitcoin 地址');

// 动态地址验证
const addressSchema = z.string().min(10).max(100);

// 大数字符串验证
const bigIntStringSchema = z.string().regex(/^[0-9]+$/, '必须是数字字符串');

// 十六进制字符串验证
const hexStringSchema = z.string().regex(/^0x[a-fA-F0-9]*$/, '必须是十六进制字符串');

// 代币信息验证
const tokenInfoSchema = z.object({
  address: addressSchema,
  symbol: z.string().min(1).max(20),
  name: z.string().max(100).optional(),
  decimals: z.number().int().min(0).max(36),
  isNative: z.boolean().optional(),
  raw: bigIntStringSchema,
  formatted: z.string().optional(),
  usdValue: z.string().optional(),
});

// EVM 元数据验证
const evmMetadataSchema = z.object({
  gasUsed: bigIntStringSchema,
  cumulativeGasUsed: bigIntStringSchema.optional(),
  gasPrice: bigIntStringSchema.optional(),
  maxPriorityFeePerGas: bigIntStringSchema.optional(),
  maxFeePerGas: bigIntStringSchema.optional(),
  nonce: z.number().int().min(0),
  type: z.number().int().min(0).max(3).optional(),
  input: hexStringSchema.optional(),
  contractAddress: evmAddressSchema.optional(),
  logs: z.array(z.object({
    logIndex: z.number().int().min(0),
    address: evmAddressSchema,
    topics: z.array(hexStringSchema),
    data: hexStringSchema,
    removed: z.boolean().optional(),
  })).optional(),
});

// 完整活动验证 Schema
export const createActivitySchema = z.object({
  projectId: z.string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'projectId 只能包含小写字母、数字和连字符'),

  chain: z.string()
    .min(1)
    .max(30)
    .regex(/^[a-z0-9-]+$/, 'chain 只能包含小写字母、数字和连字符'),

  chainFamily: z.nativeEnum(ChainFamily),

  txHash: z.string().min(10).max(200),

  blockNumber: z.number().int().min(0),

  blockHash: z.string().optional(),

  transactionIndex: z.number().int().min(0).optional(),

  timestamp: z.date().or(z.string().datetime()),

  from: addressSchema.transform(s => s.toLowerCase()),

  to: addressSchema.transform(s => s.toLowerCase()),

  value: bigIntStringSchema.default('0'),

  status: z.nativeEnum(TransactionStatus).default(TransactionStatus.CONFIRMED),

  activityType: z.nativeEnum(ActivityType),

  tokens: z.object({
    tokenIn: tokenInfoSchema.optional(),
    tokenOut: tokenInfoSchema.optional(),
    additionalTokens: z.array(tokenInfoSchema).optional(),
  }).optional(),

  contract: z.object({
    address: addressSchema,
    name: z.string().max(100).optional(),
    method: z.string().max(100).optional(),
    methodSignature: z.string().max(20).optional(),
  }).optional(),

  parsedData: z.record(z.unknown()).optional(),

  tags: z.array(z.string().max(50)).max(20).optional(),

  notes: z.string().max(1000).optional(),

  metadata: z.object({
    evm: evmMetadataSchema.optional(),
    svm: z.object({}).passthrough().optional(),
    move: z.object({}).passthrough().optional(),
    utxo: z.object({}).passthrough().optional(),
    ton: z.object({}).passthrough().optional(),
    cosmos: z.object({}).passthrough().optional(),
  }),

  source: z.enum(['rpc', 'indexer', 'manual', 'api']).optional(),
});

// 验证函数
export function validateActivity(data: unknown) {
  return createActivitySchema.safeParse(data);
}

// 批量验证
export function validateActivities(dataArray: unknown[]) {
  return dataArray.map((data, index) => ({
    index,
    result: createActivitySchema.safeParse(data),
  }));
}
```

### 6.3 业务规则验证

```typescript
// validators/business-rules.ts

import { IActivity } from '../types/activity';
import { ChainFamily } from '../types/enums';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export function validateBusinessRules(activity: IActivity): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // 规则 1: metadata 必须匹配 chainFamily
  const familyMetadataMap: Record<ChainFamily, keyof IActivity['metadata']> = {
    [ChainFamily.EVM]: 'evm',
    [ChainFamily.SVM]: 'svm',
    [ChainFamily.MOVE]: 'move',
    [ChainFamily.UTXO]: 'utxo',
    [ChainFamily.TON]: 'ton',
    [ChainFamily.COSMOS]: 'cosmos',
  };

  const expectedKey = familyMetadataMap[activity.chainFamily];
  if (expectedKey && !activity.metadata[expectedKey]) {
    errors.push({
      field: 'metadata',
      message: `chainFamily 为 ${activity.chainFamily}，但缺少 metadata.${expectedKey}`,
      code: 'METADATA_FAMILY_MISMATCH',
    });
  }

  // 规则 2: swap 类型必须有 tokenIn 和 tokenOut
  if (activity.activityType === 'swap') {
    if (!activity.tokens?.tokenIn || !activity.tokens?.tokenOut) {
      warnings.push({
        field: 'tokens',
        message: 'swap 类型建议提供 tokenIn 和 tokenOut',
        code: 'SWAP_MISSING_TOKENS',
      });
    }
  }

  // 规则 3: 时间戳不能是未来时间
  const now = new Date();
  if (activity.timestamp > now) {
    errors.push({
      field: 'timestamp',
      message: '时间戳不能是未来时间',
      code: 'FUTURE_TIMESTAMP',
    });
  }

  // 规则 4: 确认状态的交易必须有 blockNumber
  if (activity.status === 'confirmed' && !activity.blockNumber) {
    errors.push({
      field: 'blockNumber',
      message: '已确认的交易必须有区块高度',
      code: 'CONFIRMED_WITHOUT_BLOCK',
    });
  }

  // 规则 5: EVM 地址格式验证
  if (activity.chainFamily === ChainFamily.EVM) {
    const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!evmAddressRegex.test(activity.from)) {
      errors.push({
        field: 'from',
        message: 'EVM 链的 from 地址格式无效',
        code: 'INVALID_EVM_ADDRESS',
      });
    }
    if (!evmAddressRegex.test(activity.to)) {
      errors.push({
        field: 'to',
        message: 'EVM 链的 to 地址格式无效',
        code: 'INVALID_EVM_ADDRESS',
      });
    }
  }

  // 规则 6: 大额交易标记
  const valueNum = BigInt(activity.value || '0');
  const ethThreshold = BigInt('10000000000000000000000'); // 10000 ETH
  if (valueNum > ethThreshold) {
    warnings.push({
      field: 'value',
      message: '检测到大额交易，建议添加 whale 标签',
      code: 'LARGE_VALUE_DETECTED',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
```

---

## 7. 安全性考虑

### 7.1 数据库访问安全

```typescript
// config/database.ts

import mongoose from 'mongoose';

interface DatabaseConfig {
  uri: string;
  options: mongoose.ConnectOptions;
}

export function getDatabaseConfig(): DatabaseConfig {
  const {
    MONGO_HOST,
    MONGO_PORT,
    MONGO_DATABASE,
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_REPLICA_SET,
    MONGO_AUTH_SOURCE,
    MONGO_TLS_ENABLED,
    MONGO_TLS_CA_FILE,
  } = process.env;

  // 构建连接 URI
  const credentials = MONGO_USER && MONGO_PASSWORD
    ? `${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PASSWORD)}@`
    : '';

  const uri = `mongodb://${credentials}${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`;

  const options: mongoose.ConnectOptions = {
    // 连接池配置
    maxPoolSize: 100,
    minPoolSize: 10,
    maxIdleTimeMS: 30000,

    // 超时配置
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 30000,

    // 重试配置
    retryWrites: true,
    retryReads: true,

    // 副本集配置
    ...(MONGO_REPLICA_SET && { replicaSet: MONGO_REPLICA_SET }),

    // 认证配置
    ...(MONGO_AUTH_SOURCE && { authSource: MONGO_AUTH_SOURCE }),

    // TLS/SSL 配置
    ...(MONGO_TLS_ENABLED === 'true' && {
      tls: true,
      tlsCAFile: MONGO_TLS_CA_FILE,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
    }),
  };

  return { uri, options };
}

// 连接数据库
export async function connectDatabase(): Promise<void> {
  const { uri, options } = getDatabaseConfig();

  mongoose.connection.on('connected', () => {
    console.log('MongoDB 连接成功');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB 连接错误:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB 连接断开');
  });

  // 优雅关闭
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB 连接已关闭');
    process.exit(0);
  });

  await mongoose.connect(uri, options);
}
```

### 7.2 输入清理与注入防护

```typescript
// utils/sanitizer.ts

import DOMPurify from 'isomorphic-dompurify';

/**
 * 清理用户输入，防止 NoSQL 注入
 */
export function sanitizeInput<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    // 移除 MongoDB 操作符
    let sanitized = input;

    // 防止 $where 注入
    if (sanitized.includes('$')) {
      sanitized = sanitized.replace(/\$/g, '');
    }

    // 清理 HTML (如果需要存储用户备注)
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });

    return sanitized as T;
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item)) as T;
  }

  if (typeof input === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      // 禁止以 $ 开头的键 (MongoDB 操作符)
      if (key.startsWith('$')) {
        console.warn(`已过滤可疑键: ${key}`);
        continue;
      }
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized as T;
  }

  return input;
}

/**
 * 验证并清理地址格式
 */
export function sanitizeAddress(address: string, chainFamily: string): string {
  const trimmed = address.trim().toLowerCase();

  switch (chainFamily) {
    case 'evm':
      // EVM 地址: 0x + 40 个十六进制字符
      if (!/^0x[a-f0-9]{40}$/.test(trimmed)) {
        throw new Error('无效的 EVM 地址格式');
      }
      return trimmed;

    case 'svm':
      // Solana 地址: Base58 编码, 32-44 字符
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
        throw new Error('无效的 Solana 地址格式');
      }
      return address; // Solana 地址区分大小写

    case 'utxo':
      // Bitcoin 地址
      if (!/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address)) {
        throw new Error('无效的 Bitcoin 地址格式');
      }
      return address;

    default:
      return trimmed;
  }
}

/**
 * 安全的查询构建器
 */
export function buildSafeQuery(
  filter: Record<string, unknown>
): Record<string, unknown> {
  const safeQuery: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(filter)) {
    // 只允许白名单中的字段
    const allowedFields = [
      'projectId', 'chain', 'chainFamily', 'txHash',
      'from', 'to', 'status', 'activityType', 'tags',
      'blockNumber', 'timestamp'
    ];

    if (!allowedFields.includes(key)) {
      console.warn(`已过滤未知查询字段: ${key}`);
      continue;
    }

    // 清理值
    safeQuery[key] = sanitizeInput(value);
  }

  return safeQuery;
}
```

### 7.3 速率限制与访问控制

```typescript
// middleware/rate-limiter.ts

import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

// 通用 API 限制器
export const apiLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:api',
  points: 100,        // 请求数
  duration: 60,       // 每 60 秒
  blockDuration: 60,  // 超限后阻止 60 秒
});

// 写入操作限制器 (更严格)
export const writeLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:write',
  points: 20,
  duration: 60,
  blockDuration: 120,
});

// 导出操作限制器
export const exportLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:export',
  points: 5,
  duration: 300,      // 每 5 分钟
  blockDuration: 600,
});

// Express 中间件
export function rateLimitMiddleware(limiter: RateLimiterRedis) {
  return async (req: any, res: any, next: any) => {
    const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';

    try {
      await limiter.consume(key);
      next();
    } catch (rejRes) {
      if (rejRes instanceof RateLimiterRes) {
        res.set('Retry-After', String(Math.ceil(rejRes.msBeforeNext / 1000)));
        res.status(429).json({
          error: '请求过于频繁，请稍后再试',
          retryAfter: Math.ceil(rejRes.msBeforeNext / 1000),
        });
      } else {
        next(rejRes);
      }
    }
  };
}
```

### 7.4 敏感数据处理

```typescript
// utils/privacy.ts

import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32 字节密钥
const IV_LENGTH = 16;

/**
 * 加密敏感数据
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * 解密敏感数据
 */
export function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * 地址脱敏显示
 */
export function maskAddress(address: string, showChars = 6): string {
  if (address.length <= showChars * 2) return address;
  return `${address.slice(0, showChars)}...${address.slice(-showChars)}`;
}

/**
 * 交易哈希脱敏
 */
export function maskTxHash(txHash: string): string {
  return maskAddress(txHash, 10);
}

/**
 * 审计日志记录
 */
export interface AuditLog {
  action: string;
  userId?: string;
  ip?: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

export async function logAudit(log: Omit<AuditLog, 'timestamp'>): Promise<void> {
  const auditEntry: AuditLog = {
    ...log,
    timestamp: new Date(),
  };

  // 写入审计日志集合
  // await AuditLogModel.create(auditEntry);

  // 或发送到日志服务
  console.log('[AUDIT]', JSON.stringify(auditEntry));
}
```

---

## 8. 性能优化

### 8.1 查询优化技巧

```typescript
// services/activity-query.service.ts

import { Activity } from '../schemas/activity.schema';
import { IActivity, IActivityFilter, IPaginatedResult } from '../types/activity';

export class ActivityQueryService {
  /**
   * 优化的分页查询 - 使用游标分页替代 skip
   */
  async findWithCursor(
    filter: IActivityFilter,
    options: {
      cursor?: string; // 上一页最后一条的 _id
      limit?: number;
      direction?: 'next' | 'prev';
    } = {}
  ): Promise<{
    data: IActivity[];
    nextCursor?: string;
    prevCursor?: string;
  }> {
    const { cursor, limit = 20, direction = 'next' } = options;

    const query: Record<string, unknown> = this.buildFilterQuery(filter);

    // 游标分页
    if (cursor) {
      query._id = direction === 'next'
        ? { $lt: cursor }
        : { $gt: cursor };
    }

    const sortOrder = direction === 'next' ? -1 : 1;

    const data = await Activity.find(query)
      .sort({ timestamp: sortOrder, _id: sortOrder })
      .limit(limit + 1) // 多取一条判断是否有下一页
      .lean();

    const hasMore = data.length > limit;
    if (hasMore) data.pop();

    if (direction === 'prev') data.reverse();

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1]?._id?.toString() : undefined,
      prevCursor: data[0]?._id?.toString(),
    };
  }

  /**
   * 投影优化 - 只返回需要的字段
   */
  async findSummary(
    filter: IActivityFilter,
    limit = 50
  ): Promise<Partial<IActivity>[]> {
    const query = this.buildFilterQuery(filter);

    // 排除大字段，减少网络传输
    return Activity.find(query)
      .select({
        projectId: 1,
        chain: 1,
        txHash: 1,
        timestamp: 1,
        from: 1,
        to: 1,
        value: 1,
        activityType: 1,
        status: 1,
        // 排除 metadata, parsedData, logs 等大字段
      })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * 聚合查询优化 - 使用 allowDiskUse
   */
  async aggregateStats(
    projectId: string,
    startTime: Date,
    endTime: Date
  ): Promise<{
    totalCount: number;
    byChain: { chain: string; count: number }[];
    byType: { type: string; count: number }[];
    topAddresses: { address: string; count: number }[];
  }> {
    const pipeline = [
      {
        $match: {
          projectId,
          timestamp: { $gte: startTime, $lte: endTime },
        },
      },
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          byChain: [
            { $group: { _id: '$chain', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
            { $project: { chain: '$_id', count: 1, _id: 0 } },
          ],
          byType: [
            { $group: { _id: '$activityType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $project: { type: '$_id', count: 1, _id: 0 } },
          ],
          topAddresses: [
            { $group: { _id: '$from', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { address: '$_id', count: 1, _id: 0 } },
          ],
        },
      },
    ];

    const [result] = await Activity.aggregate(pipeline).allowDiskUse(true);

    return {
      totalCount: result.totalCount[0]?.count || 0,
      byChain: result.byChain,
      byType: result.byType,
      topAddresses: result.topAddresses,
    };
  }

  private buildFilterQuery(filter: IActivityFilter): Record<string, unknown> {
    const query: Record<string, unknown> = {};

    if (filter.projectId) query.projectId = filter.projectId;
    if (filter.chain) query.chain = filter.chain;
    if (filter.chainFamily) query.chainFamily = filter.chainFamily;
    if (filter.from) query.from = filter.from.toLowerCase();
    if (filter.to) query.to = filter.to.toLowerCase();
    if (filter.activityType) query.activityType = filter.activityType;
    if (filter.status) query.status = filter.status;

    if (filter.startTime || filter.endTime) {
      query.timestamp = {};
      if (filter.startTime) (query.timestamp as Record<string, Date>).$gte = filter.startTime;
      if (filter.endTime) (query.timestamp as Record<string, Date>).$lte = filter.endTime;
    }

    return query;
  }
}
```

### 8.2 批量写入优化

```typescript
// services/bulk-writer.service.ts

import { Activity } from '../schemas/activity.schema';
import { CreateActivityInput } from '../types/activity';

export class BulkWriterService {
  private buffer: CreateActivityInput[] = [];
  private readonly batchSize: number;
  private readonly flushInterval: number;
  private flushTimer?: NodeJS.Timeout;

  constructor(options: { batchSize?: number; flushInterval?: number } = {}) {
    this.batchSize = options.batchSize || 1000;
    this.flushInterval = options.flushInterval || 5000;
    this.startFlushTimer();
  }

  /**
   * 添加到缓冲区
   */
  async add(activity: CreateActivityInput): Promise<void> {
    this.buffer.push(activity);

    if (this.buffer.length >= this.batchSize) {
      await this.flush();
    }
  }

  /**
   * 批量添加
   */
  async addMany(activities: CreateActivityInput[]): Promise<void> {
    this.buffer.push(...activities);

    while (this.buffer.length >= this.batchSize) {
      await this.flush();
    }
  }

  /**
   * 刷新缓冲区到数据库
   */
  async flush(): Promise<{ inserted: number; errors: number }> {
    if (this.buffer.length === 0) {
      return { inserted: 0, errors: 0 };
    }

    const batch = this.buffer.splice(0, this.batchSize);
    let inserted = 0;
    let errors = 0;

    try {
      // 使用 bulkWrite 进行高效批量写入
      const operations = batch.map(activity => ({
        updateOne: {
          filter: { txHash: activity.txHash, chain: activity.chain },
          update: { $setOnInsert: { ...activity, schemaVersion: 1 } },
          upsert: true,
        },
      }));

      const result = await Activity.bulkWrite(operations, {
        ordered: false, // 允许部分失败继续
      });

      inserted = result.upsertedCount + result.modifiedCount;
      errors = batch.length - inserted;

      console.log(`批量写入完成: 成功 ${inserted}, 失败 ${errors}`);
    } catch (error: any) {
      // 处理批量写入错误
      if (error.writeErrors) {
        errors = error.writeErrors.length;
        inserted = batch.length - errors;

        // 记录失败的文档
        for (const writeError of error.writeErrors) {
          console.error(`写入失败 [${writeError.index}]:`, writeError.errmsg);
        }
      } else {
        throw error;
      }
    }

    return { inserted, errors };
  }

  /**
   * 强制刷新并关闭
   */
  async close(): Promise<void> {
    this.stopFlushTimer();
    while (this.buffer.length > 0) {
      await this.flush();
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush().catch(console.error);
      }
    }, this.flushInterval);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
  }
}

// 使用示例
async function syncActivities(activities: CreateActivityInput[]) {
  const writer = new BulkWriterService({ batchSize: 500 });

  try {
    await writer.addMany(activities);
  } finally {
    await writer.close();
  }
}
```

### 8.3 缓存策略

```typescript
// services/cache.service.ts

import Redis from 'ioredis';
import { IActivity } from '../types/activity';

export class CacheService {
  private redis: Redis;
  private readonly defaultTTL = 300; // 5 分钟

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      keyPrefix: 'web3:',
    });
  }

  /**
   * 缓存交易详情
   */
  async cacheActivity(activity: IActivity): Promise<void> {
    const key = `activity:${activity.chain}:${activity.txHash}`;
    await this.redis.setex(key, this.defaultTTL, JSON.stringify(activity));
  }

  /**
   * 获取缓存的交易
   */
  async getCachedActivity(chain: string, txHash: string): Promise<IActivity | null> {
    const key = `activity:${chain}:${txHash}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * 缓存查询结果
   */
  async cacheQueryResult(
    queryHash: string,
    result: unknown,
    ttl = this.defaultTTL
  ): Promise<void> {
    const key = `query:${queryHash}`;
    await this.redis.setex(key, ttl, JSON.stringify(result));
  }

  /**
   * 获取缓存的查询结果
   */
  async getCachedQuery<T>(queryHash: string): Promise<T | null> {
    const key = `query:${queryHash}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * 使失效某个项目的所有缓存
   */
  async invalidateProject(projectId: string): Promise<void> {
    const pattern = `*:${projectId}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  /**
   * 计算查询的哈希值
   */
  static hashQuery(query: Record<string, unknown>): string {
    const crypto = require('crypto');
    const normalized = JSON.stringify(query, Object.keys(query).sort());
    return crypto.createHash('md5').update(normalized).digest('hex');
  }
}

// 带缓存的查询装饰器
export function withCache(ttl?: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const cacheService = new CacheService();

    descriptor.value = async function (...args: any[]) {
      const queryHash = CacheService.hashQuery({ method: propertyKey, args });

      // 尝试从缓存获取
      const cached = await cacheService.getCachedQuery(queryHash);
      if (cached) {
        return cached;
      }

      // 执行原方法
      const result = await originalMethod.apply(this, args);

      // 缓存结果
      await cacheService.cacheQueryResult(queryHash, result, ttl);

      return result;
    };

    return descriptor;
  };
}
```

### 8.4 连接池与读写分离

```typescript
// config/read-write-split.ts

import mongoose from 'mongoose';

interface MongoConfig {
  primary: string;    // 主节点 (写)
  secondary: string;  // 从节点 (读)
  replicaSet: string;
}

export class ReadWriteSplitConnection {
  private writeConnection: mongoose.Connection;
  private readConnection: mongoose.Connection;

  constructor(config: MongoConfig) {
    // 写连接 - 指向主节点
    this.writeConnection = mongoose.createConnection(config.primary, {
      readPreference: 'primary',
      replicaSet: config.replicaSet,
      maxPoolSize: 50,
    });

    // 读连接 - 指向从节点
    this.readConnection = mongoose.createConnection(config.secondary, {
      readPreference: 'secondaryPreferred',
      replicaSet: config.replicaSet,
      maxPoolSize: 100,
    });
  }

  getWriteConnection(): mongoose.Connection {
    return this.writeConnection;
  }

  getReadConnection(): mongoose.Connection {
    return this.readConnection;
  }

  async close(): Promise<void> {
    await Promise.all([
      this.writeConnection.close(),
      this.readConnection.close(),
    ]);
  }
}

// 使用示例
const mongoConfig: MongoConfig = {
  primary: process.env.MONGO_PRIMARY_URI!,
  secondary: process.env.MONGO_SECONDARY_URI!,
  replicaSet: process.env.MONGO_REPLICA_SET!,
};

const connections = new ReadWriteSplitConnection(mongoConfig);

// 读操作使用读连接
const ActivityReadModel = connections.getReadConnection().model('Activity', ActivitySchema);

// 写操作使用写连接
const ActivityWriteModel = connections.getWriteConnection().model('Activity', ActivitySchema);
```

---

## 9. 分片与高可用部署

### 9.1 分片策略

```javascript
// 初始化分片集群

// 1. 启用分片
sh.enableSharding("web3_db");

// 2. 对 activities 集合进行分片
// 选择分片键: chain + timestamp (范围分片)
// 这种方式确保同一链的数据在一起，同时按时间分布数据
sh.shardCollection("web3_db.activities", { chain: 1, timestamp: 1 });

// 3. 预分割 chunk (避免初期热点)
const chains = ["ethereum", "base", "arbitrum", "polygon", "solana", "sui"];
const startDate = new Date("2020-01-01");
const endDate = new Date();

chains.forEach(chain => {
  // 为每个链创建初始 chunk
  sh.splitAt("web3_db.activities", { chain: chain, timestamp: startDate });
  sh.splitAt("web3_db.activities", { chain: chain, timestamp: endDate });
});

// 4. 配置区域 (可选，地理分布)
sh.addShardTag("shard0", "US");
sh.addShardTag("shard1", "EU");
sh.addShardTag("shard2", "ASIA");

// 将不同链的数据分配到不同区域
sh.updateZoneKeyRange(
  "web3_db.activities",
  { chain: "ethereum", timestamp: MinKey },
  { chain: "ethereum", timestamp: MaxKey },
  "US"
);
```

### 9.2 分片键选择指南

| 分片键方案 | 优点 | 缺点 | 适用场景 |
|------------|------|------|----------|
| `{ chain: 1, timestamp: 1 }` | 同链数据聚集，范围查询高效 | 热门链可能成为热点 | 多链项目，按链查询为主 |
| `{ _id: "hashed" }` | 写入均匀分布 | 范围查询需广播 | 写入密集，查询模式随机 |
| `{ projectId: 1, timestamp: 1 }` | 按项目隔离数据 | 热门项目可能成为热点 | 多租户 SaaS 模式 |
| `{ txHash: "hashed" }` | 交易查询精确定位 | 范围查询效率低 | 交易检索为主 |

### 9.3 副本集配置

```javascript
// 副本集初始化配置
rs.initiate({
  _id: "web3-rs",
  members: [
    {
      _id: 0,
      host: "mongo-primary:27017",
      priority: 10,
      tags: { dc: "dc1", role: "primary" }
    },
    {
      _id: 1,
      host: "mongo-secondary1:27017",
      priority: 5,
      tags: { dc: "dc1", role: "secondary" }
    },
    {
      _id: 2,
      host: "mongo-secondary2:27017",
      priority: 5,
      tags: { dc: "dc2", role: "secondary" }
    },
    {
      _id: 3,
      host: "mongo-arbiter:27017",
      arbiterOnly: true,
      tags: { dc: "dc2", role: "arbiter" }
    }
  ],
  settings: {
    chainingAllowed: true,
    heartbeatTimeoutSecs: 10,
    electionTimeoutMillis: 10000,
    catchUpTimeoutMillis: 30000
  }
});

// 配置读偏好
// 应用层配置
const readPreferenceConfig = {
  // 实时数据查询 - 读主节点
  realtime: { readPreference: "primary" },

  // 历史数据查询 - 读从节点
  historical: {
    readPreference: "secondaryPreferred",
    maxStalenessSeconds: 90
  },

  // 报表查询 - 最近的从节点
  reporting: {
    readPreference: "nearest",
    tags: [{ role: "secondary" }]
  }
};
```

### 9.4 高可用架构图

```
                                    ┌─────────────────┐
                                    │   Application   │
                                    │    Servers      │
                                    └────────┬────────┘
                                             │
                                    ┌────────▼────────┐
                                    │   mongos Router │
                                    │   (多实例负载均衡)  │
                                    └────────┬────────┘
                                             │
              ┌──────────────────────────────┼──────────────────────────────┐
              │                              │                              │
     ┌────────▼────────┐            ┌────────▼────────┐            ┌────────▼────────┐
     │    Shard 0      │            │    Shard 1      │            │    Shard 2      │
     │  (EVM chains)   │            │  (SVM chains)   │            │  (Other chains) │
     └────────┬────────┘            └────────┬────────┘            └────────┬────────┘
              │                              │                              │
    ┌─────────┼─────────┐          ┌─────────┼─────────┐          ┌─────────┼─────────┐
    │         │         │          │         │         │          │         │         │
┌───▼───┐ ┌───▼───┐ ┌───▼───┐  ┌───▼───┐ ┌───▼───┐ ┌───▼───┐  ┌───▼───┐ ┌───▼───┐ ┌───▼───┐
│Primary│ │Second│ │Second│  │Primary│ │Second│ │Second│  │Primary│ │Second│ │Second│
└───────┘ └───────┘ └───────┘  └───────┘ └───────┘ └───────┘  └───────┘ └───────┘ └───────┘

                              ┌────────────────────┐
                              │   Config Servers   │
                              │   (3 节点副本集)     │
                              └────────────────────┘
```

### 9.5 备份与恢复

```bash
#!/bin/bash
# backup.sh - MongoDB 备份脚本

BACKUP_DIR="/data/backups"
DATE=$(date +%Y%m%d_%H%M%S)
MONGO_URI="mongodb://user:pass@localhost:27017"

# 创建备份目录
mkdir -p "${BACKUP_DIR}/${DATE}"

# 使用 mongodump 进行备份
mongodump \
  --uri="${MONGO_URI}" \
  --db=web3_db \
  --out="${BACKUP_DIR}/${DATE}" \
  --gzip \
  --oplog

# 上传到 S3 (可选)
aws s3 sync "${BACKUP_DIR}/${DATE}" "s3://your-bucket/mongodb-backups/${DATE}"

# 清理 7 天前的本地备份
find "${BACKUP_DIR}" -type d -mtime +7 -exec rm -rf {} +

echo "备份完成: ${BACKUP_DIR}/${DATE}"
```

```bash
#!/bin/bash
# restore.sh - MongoDB 恢复脚本

BACKUP_PATH=$1
MONGO_URI="mongodb://user:pass@localhost:27017"

if [ -z "$BACKUP_PATH" ]; then
  echo "用法: ./restore.sh <备份路径>"
  exit 1
fi

# 使用 mongorestore 恢复
mongorestore \
  --uri="${MONGO_URI}" \
  --db=web3_db \
  --gzip \
  --oplogReplay \
  --drop \
  "${BACKUP_PATH}/web3_db"

echo "恢复完成"
```

---

## 10. 数据迁移策略

### 10.1 Schema 版本管理

```typescript
// migrations/migration-manager.ts

import { Activity } from '../schemas/activity.schema';

interface Migration {
  version: number;
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial',
    up: async () => {
      // 初始版本，无需迁移
    },
    down: async () => {},
  },
  {
    version: 2,
    name: 'add_tokens_field',
    up: async () => {
      // 为旧数据添加 tokens 字段默认值
      await Activity.updateMany(
        { schemaVersion: 1, tokens: { $exists: false } },
        {
          $set: {
            tokens: null,
            schemaVersion: 2,
          },
        }
      );
    },
    down: async () => {
      await Activity.updateMany(
        { schemaVersion: 2 },
        {
          $unset: { tokens: '' },
          $set: { schemaVersion: 1 },
        }
      );
    },
  },
  {
    version: 3,
    name: 'normalize_addresses',
    up: async () => {
      // 批量将地址转为小写
      const cursor = Activity.find({
        schemaVersion: 2,
      }).cursor();

      let batch: any[] = [];
      const BATCH_SIZE = 1000;

      for await (const doc of cursor) {
        batch.push({
          updateOne: {
            filter: { _id: doc._id },
            update: {
              $set: {
                from: doc.from.toLowerCase(),
                to: doc.to.toLowerCase(),
                txHash: doc.txHash.toLowerCase(),
                schemaVersion: 3,
              },
            },
          },
        });

        if (batch.length >= BATCH_SIZE) {
          await Activity.bulkWrite(batch);
          batch = [];
        }
      }

      if (batch.length > 0) {
        await Activity.bulkWrite(batch);
      }
    },
    down: async () => {
      // 无法恢复大小写，仅回退版本号
      await Activity.updateMany(
        { schemaVersion: 3 },
        { $set: { schemaVersion: 2 } }
      );
    },
  },
];

export class MigrationManager {
  async getCurrentVersion(): Promise<number> {
    const doc = await Activity.findOne().sort({ schemaVersion: -1 }).lean();
    return doc?.schemaVersion || 0;
  }

  async migrate(targetVersion?: number): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const target = targetVersion ?? migrations[migrations.length - 1].version;

    console.log(`当前版本: ${currentVersion}, 目标版本: ${target}`);

    if (currentVersion === target) {
      console.log('已是最新版本');
      return;
    }

    if (currentVersion < target) {
      // 升级
      for (const migration of migrations) {
        if (migration.version > currentVersion && migration.version <= target) {
          console.log(`执行迁移: ${migration.name} (v${migration.version})`);
          await migration.up();
          console.log(`完成: ${migration.name}`);
        }
      }
    } else {
      // 降级
      for (const migration of [...migrations].reverse()) {
        if (migration.version <= currentVersion && migration.version > target) {
          console.log(`回滚迁移: ${migration.name} (v${migration.version})`);
          await migration.down();
          console.log(`完成: ${migration.name}`);
        }
      }
    }
  }
}
```

### 10.2 零停机迁移

```typescript
// migrations/zero-downtime-migration.ts

import { Activity } from '../schemas/activity.schema';

/**
 * 零停机迁移策略：
 * 1. 新字段使用可选类型
 * 2. 应用层同时支持新旧格式
 * 3. 后台逐步迁移旧数据
 * 4. 完成后清理旧字段
 */

export class ZeroDowntimeMigration {
  private isRunning = false;
  private shouldStop = false;

  /**
   * 后台增量迁移
   */
  async runBackgroundMigration(
    options: {
      batchSize?: number;
      delayMs?: number;
      filter?: Record<string, unknown>;
      transform: (doc: any) => any;
    }
  ): Promise<{ processed: number; errors: number }> {
    const { batchSize = 500, delayMs = 100, filter = {}, transform } = options;

    this.isRunning = true;
    let processed = 0;
    let errors = 0;

    try {
      while (!this.shouldStop) {
        // 获取一批未迁移的文档
        const docs = await Activity.find({
          ...filter,
          _migrated: { $ne: true },
        })
          .limit(batchSize)
          .lean();

        if (docs.length === 0) {
          console.log('迁移完成');
          break;
        }

        // 批量更新
        const operations = docs.map(doc => {
          try {
            const transformed = transform(doc);
            return {
              updateOne: {
                filter: { _id: doc._id },
                update: {
                  $set: { ...transformed, _migrated: true },
                },
              },
            };
          } catch (err) {
            errors++;
            console.error(`转换失败 [${doc._id}]:`, err);
            return null;
          }
        }).filter(Boolean);

        if (operations.length > 0) {
          await Activity.bulkWrite(operations as any);
          processed += operations.length;
        }

        console.log(`已处理: ${processed}, 错误: ${errors}`);

        // 避免过载
        await this.sleep(delayMs);
      }
    } finally {
      this.isRunning = false;
    }

    return { processed, errors };
  }

  /**
   * 停止迁移
   */
  stop(): void {
    this.shouldStop = true;
  }

  /**
   * 清理迁移标记
   */
  async cleanupMigrationFlags(): Promise<void> {
    await Activity.updateMany(
      { _migrated: true },
      { $unset: { _migrated: '' } }
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 使用示例：将旧格式的 value 字段从数字转为字符串
async function migrateValueField() {
  const migration = new ZeroDowntimeMigration();

  await migration.runBackgroundMigration({
    filter: { value: { $type: 'number' } },
    transform: (doc) => ({
      value: String(doc.value),
    }),
  });

  await migration.cleanupMigrationFlags();
}
```

### 10.3 数据导入导出

```typescript
// utils/data-export.ts

import { Activity } from '../schemas/activity.schema';
import { createWriteStream, createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import * as readline from 'readline';

/**
 * 导出数据为 JSONL 格式 (便于大数据处理)
 */
export async function exportToJsonl(
  filter: Record<string, unknown>,
  outputPath: string
): Promise<number> {
  const cursor = Activity.find(filter).cursor();
  const output = createWriteStream(outputPath);
  let count = 0;

  const transformToJsonl = new Transform({
    objectMode: true,
    transform(doc, encoding, callback) {
      count++;
      callback(null, JSON.stringify(doc) + '\n');
    },
  });

  await pipeline(cursor, transformToJsonl, output);

  console.log(`导出完成: ${count} 条记录 -> ${outputPath}`);
  return count;
}

/**
 * 从 JSONL 文件导入数据
 */
export async function importFromJsonl(
  inputPath: string,
  options: { batchSize?: number; upsert?: boolean } = {}
): Promise<{ imported: number; errors: number }> {
  const { batchSize = 1000, upsert = true } = options;

  const fileStream = createReadStream(inputPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let batch: any[] = [];
  let imported = 0;
  let errors = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      const doc = JSON.parse(line);
      batch.push(doc);

      if (batch.length >= batchSize) {
        const result = await writeBatch(batch, upsert);
        imported += result.success;
        errors += result.errors;
        batch = [];
      }
    } catch (err) {
      errors++;
      console.error('解析错误:', err);
    }
  }

  // 处理剩余数据
  if (batch.length > 0) {
    const result = await writeBatch(batch, upsert);
    imported += result.success;
    errors += result.errors;
  }

  console.log(`导入完成: 成功 ${imported}, 失败 ${errors}`);
  return { imported, errors };
}

async function writeBatch(
  docs: any[],
  upsert: boolean
): Promise<{ success: number; errors: number }> {
  try {
    if (upsert) {
      const operations = docs.map(doc => ({
        updateOne: {
          filter: { txHash: doc.txHash, chain: doc.chain },
          update: { $set: doc },
          upsert: true,
        },
      }));
      const result = await Activity.bulkWrite(operations, { ordered: false });
      return {
        success: result.upsertedCount + result.modifiedCount,
        errors: 0,
      };
    } else {
      const result = await Activity.insertMany(docs, { ordered: false });
      return { success: result.length, errors: 0 };
    }
  } catch (err: any) {
    const writeErrors = err.writeErrors?.length || 0;
    return {
      success: docs.length - writeErrors,
      errors: writeErrors,
    };
  }
}
```

---

## 11. 完整代码示例

### 11.1 完整的 CRUD 服务

```typescript
// services/activity.service.ts

import { Activity, IActivityModel } from '../schemas/activity.schema';
import {
  IActivity,
  CreateActivityInput,
  UpdateActivityInput,
  IActivityFilter,
  IPaginatedResult,
} from '../types/activity';
import { validateActivity, validateBusinessRules } from '../validators';
import { CacheService } from './cache.service';
import { BulkWriterService } from './bulk-writer.service';

export class ActivityService {
  private cache: CacheService;
  private bulkWriter: BulkWriterService;

  constructor() {
    this.cache = new CacheService();
    this.bulkWriter = new BulkWriterService({ batchSize: 500 });
  }

  /**
   * 创建单个活动
   */
  async create(input: CreateActivityInput): Promise<IActivity> {
    // 数据验证
    const validationResult = validateActivity(input);
    if (!validationResult.success) {
      throw new Error(`验证失败: ${JSON.stringify(validationResult.error)}`);
    }

    // 业务规则验证
    const businessValidation = validateBusinessRules(input as any);
    if (!businessValidation.valid) {
      throw new Error(`业务规则验证失败: ${JSON.stringify(businessValidation.errors)}`);
    }

    // 打印警告
    if (businessValidation.warnings.length > 0) {
      console.warn('业务规则警告:', businessValidation.warnings);
    }

    const activity = new Activity({
      ...input,
      schemaVersion: 1,
    });

    await activity.save();

    // 缓存
    await this.cache.cacheActivity(activity.toObject());

    return activity.toObject();
  }

  /**
   * 批量创建活动
   */
  async createMany(inputs: CreateActivityInput[]): Promise<{
    success: number;
    errors: { index: number; error: string }[];
  }> {
    const errors: { index: number; error: string }[] = [];
    let success = 0;

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const validationResult = validateActivity(input);

      if (!validationResult.success) {
        errors.push({
          index: i,
          error: JSON.stringify(validationResult.error),
        });
        continue;
      }

      await this.bulkWriter.add(input);
      success++;
    }

    await this.bulkWriter.flush();

    return { success, errors };
  }

  /**
   * 根据交易哈希和链查找
   */
  async findByTxHash(chain: string, txHash: string): Promise<IActivity | null> {
    // 先查缓存
    const cached = await this.cache.getCachedActivity(chain, txHash);
    if (cached) {
      return cached;
    }

    const activity = await Activity.findOne({
      chain: chain.toLowerCase(),
      txHash: txHash.toLowerCase(),
    }).lean();

    if (activity) {
      await this.cache.cacheActivity(activity);
    }

    return activity;
  }

  /**
   * 分页查询
   */
  async findByFilter(
    filter: IActivityFilter,
    options: { page?: number; limit?: number } = {}
  ): Promise<IPaginatedResult<IActivity>> {
    return Activity.findByFilter(filter, options);
  }

  /**
   * 查询地址的所有活动
   */
  async findByAddress(
    address: string,
    options: { chain?: string; limit?: number } = {}
  ): Promise<IActivity[]> {
    return Activity.findByAddress(address, options);
  }

  /**
   * 查询项目最新活动
   */
  async findRecentByProject(
    projectId: string,
    limit = 50
  ): Promise<IActivity[]> {
    return Activity.findRecentByProject(projectId, limit);
  }

  /**
   * 更新活动
   */
  async update(
    chain: string,
    txHash: string,
    update: UpdateActivityInput
  ): Promise<IActivity | null> {
    const activity = await Activity.findOneAndUpdate(
      {
        chain: chain.toLowerCase(),
        txHash: txHash.toLowerCase(),
      },
      { $set: update },
      { new: true }
    ).lean();

    if (activity) {
      // 更新缓存
      await this.cache.cacheActivity(activity);
    }

    return activity;
  }

  /**
   * 删除活动 (慎用)
   */
  async delete(chain: string, txHash: string): Promise<boolean> {
    const result = await Activity.deleteOne({
      chain: chain.toLowerCase(),
      txHash: txHash.toLowerCase(),
    });

    return result.deletedCount > 0;
  }

  /**
   * 处理区块重组
   */
  async handleReorg(chain: string, fromBlock: number): Promise<number> {
    const result = await Activity.deleteMany({
      chain: chain.toLowerCase(),
      blockNumber: { $gte: fromBlock },
    });

    console.log(`重组处理: 删除 ${result.deletedCount} 条记录 (${chain} >= ${fromBlock})`);

    return result.deletedCount;
  }

  /**
   * 统计查询
   */
  async getStats(
    projectId: string,
    startTime: Date,
    endTime: Date
  ): Promise<{
    totalCount: number;
    byChain: { chain: string; count: number }[];
    byType: { type: string; count: number }[];
  }> {
    const pipeline = [
      {
        $match: {
          projectId,
          timestamp: { $gte: startTime, $lte: endTime },
        },
      },
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          byChain: [
            { $group: { _id: '$chain', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $project: { chain: '$_id', count: 1, _id: 0 } },
          ],
          byType: [
            { $group: { _id: '$activityType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $project: { type: '$_id', count: 1, _id: 0 } },
          ],
        },
      },
    ];

    const [result] = await Activity.aggregate(pipeline);

    return {
      totalCount: result.totalCount[0]?.count || 0,
      byChain: result.byChain,
      byType: result.byType,
    };
  }
}
```

### 11.2 Express API 路由示例

```typescript
// routes/activity.routes.ts

import { Router, Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service';
import { rateLimitMiddleware, apiLimiter, writeLimiter } from '../middleware/rate-limiter';
import { sanitizeInput, buildSafeQuery } from '../utils/sanitizer';
import { z } from 'zod';

const router = Router();
const activityService = new ActivityService();

// 查询参数验证 Schema
const querySchema = z.object({
  projectId: z.string().optional(),
  chain: z.string().optional(),
  chainFamily: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  address: z.string().optional(),
  activityType: z.string().optional(),
  status: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// 错误处理中间件
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * GET /activities
 * 分页查询活动列表
 */
router.get(
  '/',
  rateLimitMiddleware(apiLimiter),
  asyncHandler(async (req, res) => {
    // 验证并清理查询参数
    const parseResult = querySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({
        error: '无效的查询参数',
        details: parseResult.error.errors,
      });
    }

    const { page, limit, ...filterParams } = parseResult.data;

    // 构建安全查询
    const filter = buildSafeQuery(filterParams);

    // 转换时间字段
    if (filterParams.startTime) {
      filter.startTime = new Date(filterParams.startTime);
    }
    if (filterParams.endTime) {
      filter.endTime = new Date(filterParams.endTime);
    }

    const result = await activityService.findByFilter(filter, { page, limit });

    res.json(result);
  })
);

/**
 * GET /activities/:chain/:txHash
 * 获取单个交易详情
 */
router.get(
  '/:chain/:txHash',
  rateLimitMiddleware(apiLimiter),
  asyncHandler(async (req, res) => {
    const { chain, txHash } = req.params;

    const activity = await activityService.findByTxHash(
      sanitizeInput(chain),
      sanitizeInput(txHash)
    );

    if (!activity) {
      return res.status(404).json({ error: '交易不存在' });
    }

    res.json(activity);
  })
);

/**
 * GET /activities/address/:address
 * 获取地址的活动历史
 */
router.get(
  '/address/:address',
  rateLimitMiddleware(apiLimiter),
  asyncHandler(async (req, res) => {
    const { address } = req.params;
    const { chain, limit } = req.query;

    const activities = await activityService.findByAddress(
      sanitizeInput(address),
      {
        chain: chain ? sanitizeInput(chain as string) : undefined,
        limit: limit ? parseInt(limit as string, 10) : 100,
      }
    );

    res.json({ data: activities });
  })
);

/**
 * GET /activities/project/:projectId/recent
 * 获取项目最新活动
 */
router.get(
  '/project/:projectId/recent',
  rateLimitMiddleware(apiLimiter),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const limit = parseInt(req.query.limit as string, 10) || 50;

    const activities = await activityService.findRecentByProject(
      sanitizeInput(projectId),
      Math.min(limit, 100)
    );

    res.json({ data: activities });
  })
);

/**
 * GET /activities/project/:projectId/stats
 * 获取项目统计数据
 */
router.get(
  '/project/:projectId/stats',
  rateLimitMiddleware(apiLimiter),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { startTime, endTime } = req.query;

    const start = startTime
      ? new Date(startTime as string)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const end = endTime ? new Date(endTime as string) : new Date();

    const stats = await activityService.getStats(
      sanitizeInput(projectId),
      start,
      end
    );

    res.json(stats);
  })
);

/**
 * POST /activities
 * 创建新活动 (内部 API)
 */
router.post(
  '/',
  rateLimitMiddleware(writeLimiter),
  asyncHandler(async (req, res) => {
    const input = sanitizeInput(req.body);
    const activity = await activityService.create(input);
    res.status(201).json(activity);
  })
);

/**
 * POST /activities/batch
 * 批量创建活动 (内部 API)
 */
router.post(
  '/batch',
  rateLimitMiddleware(writeLimiter),
  asyncHandler(async (req, res) => {
    const inputs = sanitizeInput(req.body.activities);

    if (!Array.isArray(inputs) || inputs.length === 0) {
      return res.status(400).json({ error: 'activities 必须是非空数组' });
    }

    if (inputs.length > 1000) {
      return res.status(400).json({ error: '单次最多提交 1000 条记录' });
    }

    const result = await activityService.createMany(inputs);
    res.status(201).json(result);
  })
);

/**
 * PATCH /activities/:chain/:txHash
 * 更新活动 (内部 API)
 */
router.patch(
  '/:chain/:txHash',
  rateLimitMiddleware(writeLimiter),
  asyncHandler(async (req, res) => {
    const { chain, txHash } = req.params;
    const update = sanitizeInput(req.body);

    const activity = await activityService.update(chain, txHash, update);

    if (!activity) {
      return res.status(404).json({ error: '交易不存在' });
    }

    res.json(activity);
  })
);

// 错误处理
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('API 错误:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: '数据验证失败', details: err.message });
  }

  res.status(500).json({ error: '服务器内部错误' });
});

export default router;
```

### 11.3 实际业务场景：DEX Swap 解析

```typescript
// parsers/uniswap-v3.parser.ts

import { ethers } from 'ethers';
import { CreateActivityInput } from '../types/activity';
import { ChainFamily, ActivityType, TransactionStatus } from '../types/enums';

// Uniswap V3 SwapRouter ABI (部分)
const SWAP_ROUTER_ABI = [
  'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)',
];

const ERC20_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

interface SwapEventData {
  tokenIn: { address: string; amount: bigint };
  tokenOut: { address: string; amount: bigint };
  sender: string;
  recipient: string;
}

export class UniswapV3Parser {
  private swapInterface: ethers.Interface;
  private erc20Interface: ethers.Interface;

  constructor() {
    this.swapInterface = new ethers.Interface(SWAP_ROUTER_ABI);
    this.erc20Interface = new ethers.Interface(ERC20_ABI);
  }

  /**
   * 解析 Uniswap V3 Swap 交易
   */
  async parseSwapTransaction(
    tx: {
      hash: string;
      blockNumber: number;
      timestamp: number;
      from: string;
      to: string;
      value: string;
      gasUsed: string;
      gasPrice: string;
      logs: Array<{
        address: string;
        topics: string[];
        data: string;
        logIndex: number;
      }>;
    },
    chain: string
  ): Promise<CreateActivityInput | null> {
    try {
      // 查找 Transfer 事件来确定 token 流向
      const transfers = this.parseTransferEvents(tx.logs, tx.from);

      if (transfers.length < 2) {
        console.warn('无法识别 Swap: Transfer 事件不足');
        return null;
      }

      // 第一个 transfer 通常是 tokenIn (用户发出)
      // 最后一个 transfer 通常是 tokenOut (用户收到)
      const tokenIn = transfers.find(t => t.from.toLowerCase() === tx.from.toLowerCase());
      const tokenOut = transfers.find(t => t.to.toLowerCase() === tx.from.toLowerCase());

      if (!tokenIn || !tokenOut) {
        console.warn('无法确定 tokenIn/tokenOut');
        return null;
      }

      // 获取代币信息 (实际使用时需要查询合约或缓存)
      const tokenInInfo = await this.getTokenInfo(tokenIn.token, chain);
      const tokenOutInfo = await this.getTokenInfo(tokenOut.token, chain);

      const activity: CreateActivityInput = {
        projectId: 'uniswap-v3',
        chain,
        chainFamily: ChainFamily.EVM,
        txHash: tx.hash,
        blockNumber: tx.blockNumber,
        timestamp: new Date(tx.timestamp * 1000),
        from: tx.from,
        to: tx.to,
        value: tx.value,
        status: TransactionStatus.CONFIRMED,
        activityType: ActivityType.SWAP,
        tokens: {
          tokenIn: {
            address: tokenIn.token,
            symbol: tokenInInfo.symbol,
            name: tokenInInfo.name,
            decimals: tokenInInfo.decimals,
            raw: tokenIn.amount.toString(),
            formatted: ethers.formatUnits(tokenIn.amount, tokenInInfo.decimals),
          },
          tokenOut: {
            address: tokenOut.token,
            symbol: tokenOutInfo.symbol,
            name: tokenOutInfo.name,
            decimals: tokenOutInfo.decimals,
            raw: tokenOut.amount.toString(),
            formatted: ethers.formatUnits(tokenOut.amount, tokenOutInfo.decimals),
          },
        },
        contract: {
          address: tx.to,
          name: 'SwapRouter02',
          method: 'exactInputSingle', // 需要从 input 解析
        },
        metadata: {
          evm: {
            gasUsed: tx.gasUsed,
            gasPrice: tx.gasPrice,
            nonce: 0, // 需要从完整交易数据获取
            logs: tx.logs.map(log => ({
              logIndex: log.logIndex,
              address: log.address,
              topics: log.topics,
              data: log.data,
            })),
          },
        },
        tags: ['defi', 'swap'],
      };

      // 检测是否为大额交易
      if (this.isWhaleTransaction(tokenIn.amount, tokenInInfo.decimals)) {
        activity.tags!.push('whale');
      }

      return activity;
    } catch (error) {
      console.error('解析 Swap 交易失败:', error);
      return null;
    }
  }

  private parseTransferEvents(
    logs: Array<{ address: string; topics: string[]; data: string; logIndex: number }>,
    userAddress: string
  ): Array<{ token: string; from: string; to: string; amount: bigint }> {
    const transfers: Array<{ token: string; from: string; to: string; amount: bigint }> = [];
    const transferTopic = ethers.id('Transfer(address,address,uint256)');

    for (const log of logs) {
      if (log.topics[0] === transferTopic && log.topics.length === 3) {
        try {
          const from = ethers.getAddress('0x' + log.topics[1].slice(26));
          const to = ethers.getAddress('0x' + log.topics[2].slice(26));
          const amount = BigInt(log.data);

          transfers.push({
            token: log.address,
            from,
            to,
            amount,
          });
        } catch {
          // 忽略解析失败的日志
        }
      }
    }

    return transfers;
  }

  private async getTokenInfo(
    address: string,
    chain: string
  ): Promise<{ symbol: string; name: string; decimals: number }> {
    // 实际实现需要查询合约或使用缓存
    // 这里返回占位数据
    return {
      symbol: 'UNKNOWN',
      name: 'Unknown Token',
      decimals: 18,
    };
  }

  private isWhaleTransaction(amount: bigint, decimals: number): boolean {
    // 超过 100 ETH 等值视为大额
    const threshold = BigInt(100) * BigInt(10 ** decimals);
    return amount > threshold;
  }
}
```

---

## 12. 监控与告警

### 12.1 Prometheus 指标

```typescript
// monitoring/metrics.ts

import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export const registry = new Registry();

// 数据库操作计数器
export const dbOperationsTotal = new Counter({
  name: 'web3_db_operations_total',
  help: '数据库操作总数',
  labelNames: ['collection', 'operation', 'status'],
  registers: [registry],
});

// 数据库操作延迟
export const dbOperationDuration = new Histogram({
  name: 'web3_db_operation_duration_seconds',
  help: '数据库操作延迟 (秒)',
  labelNames: ['collection', 'operation'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [registry],
});

// 活动数量 (按链分类)
export const activitiesByChain = new Gauge({
  name: 'web3_activities_by_chain',
  help: '按链分类的活动数量',
  labelNames: ['chain'],
  registers: [registry],
});

// 同步状态
export const syncStatus = new Gauge({
  name: 'web3_sync_status',
  help: '同步状态 (1=syncing, 2=synced, 0=error)',
  labelNames: ['project', 'chain'],
  registers: [registry],
});

// 同步落后的区块数
export const syncBlocksBehind = new Gauge({
  name: 'web3_sync_blocks_behind',
  help: '同步落后的区块数',
  labelNames: ['project', 'chain'],
  registers: [registry],
});

// API 请求计数
export const apiRequestsTotal = new Counter({
  name: 'web3_api_requests_total',
  help: 'API 请求总数',
  labelNames: ['method', 'path', 'status'],
  registers: [registry],
});

// API 请求延迟
export const apiRequestDuration = new Histogram({
  name: 'web3_api_request_duration_seconds',
  help: 'API 请求延迟 (秒)',
  labelNames: ['method', 'path'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
});

// Mongoose 查询计时中间件
export function mongooseQueryTimer() {
  return function (this: any, next: () => void) {
    const start = Date.now();
    const collection = this.model?.collection?.name || 'unknown';
    const operation = this.op || 'unknown';

    this.on('end', () => {
      const duration = (Date.now() - start) / 1000;
      dbOperationDuration.labels(collection, operation).observe(duration);
      dbOperationsTotal.labels(collection, operation, 'success').inc();
    });

    this.on('error', () => {
      dbOperationsTotal.labels(collection, operation, 'error').inc();
    });

    next();
  };
}

// Express 指标中间件
export function metricsMiddleware() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      const path = req.route?.path || req.path;
      const status = res.statusCode.toString();

      apiRequestsTotal.labels(req.method, path, status).inc();
      apiRequestDuration.labels(req.method, path).observe(duration);
    });

    next();
  };
}
```

### 12.2 健康检查

```typescript
// monitoring/health.ts

import mongoose from 'mongoose';
import Redis from 'ioredis';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  components: {
    mongodb: ComponentHealth;
    redis: ComponentHealth;
    sync: ComponentHealth;
  };
}

interface ComponentHealth {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  message?: string;
}

export class HealthChecker {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  }

  async check(): Promise<HealthStatus> {
    const [mongodb, redis, sync] = await Promise.all([
      this.checkMongoDB(),
      this.checkRedis(),
      this.checkSync(),
    ]);

    // 确定总体状态
    const components = { mongodb, redis, sync };
    const statuses = Object.values(components).map(c => c.status);

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (statuses.every(s => s === 'up')) {
      status = 'healthy';
    } else if (statuses.some(s => s === 'down')) {
      status = 'unhealthy';
    } else {
      status = 'degraded';
    }

    return {
      status,
      timestamp: new Date(),
      components,
    };
  }

  private async checkMongoDB(): Promise<ComponentHealth> {
    try {
      const start = Date.now();
      await mongoose.connection.db?.admin().ping();
      const latency = Date.now() - start;

      return {
        status: latency < 100 ? 'up' : 'degraded',
        latency,
      };
    } catch (error: any) {
      return {
        status: 'down',
        message: error.message,
      };
    }
  }

  private async checkRedis(): Promise<ComponentHealth> {
    try {
      const start = Date.now();
      await this.redis.ping();
      const latency = Date.now() - start;

      return {
        status: latency < 50 ? 'up' : 'degraded',
        latency,
      };
    } catch (error: any) {
      return {
        status: 'down',
        message: error.message,
      };
    }
  }

  private async checkSync(): Promise<ComponentHealth> {
    try {
      // 检查同步状态
      const SyncStatus = mongoose.model('SyncStatus');
      const staleThreshold = new Date(Date.now() - 10 * 60 * 1000); // 10 分钟

      const staleSyncs = await SyncStatus.countDocuments({
        status: 'syncing',
        updatedAt: { $lt: staleThreshold },
      });

      const errorSyncs = await SyncStatus.countDocuments({
        status: 'error',
      });

      if (errorSyncs > 0) {
        return {
          status: 'degraded',
          message: `${errorSyncs} 个同步任务出错`,
        };
      }

      if (staleSyncs > 0) {
        return {
          status: 'degraded',
          message: `${staleSyncs} 个同步任务停滞`,
        };
      }

      return { status: 'up' };
    } catch (error: any) {
      return {
        status: 'down',
        message: error.message,
      };
    }
  }
}

// Express 健康检查端点
export function healthRouter() {
  const router = require('express').Router();
  const checker = new HealthChecker();

  router.get('/health', async (req: any, res: any) => {
    const health = await checker.check();

    const statusCode = {
      healthy: 200,
      degraded: 200,
      unhealthy: 503,
    }[health.status];

    res.status(statusCode).json(health);
  });

  router.get('/ready', async (req: any, res: any) => {
    const health = await checker.check();
    res.status(health.status === 'unhealthy' ? 503 : 200).send(health.status);
  });

  router.get('/live', (req: any, res: any) => {
    res.status(200).send('ok');
  });

  return router;
}
```

### 12.3 告警配置 (Prometheus Alertmanager)

```yaml
# alerting/rules.yml

groups:
  - name: web3-database
    interval: 30s
    rules:
      # 数据库响应时间过高
      - alert: HighDatabaseLatency
        expr: histogram_quantile(0.95, rate(web3_db_operation_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "数据库延迟过高"
          description: "95 分位延迟超过 1 秒，当前值: {{ $value }}s"

      # 数据库操作错误率过高
      - alert: HighDatabaseErrorRate
        expr: |
          sum(rate(web3_db_operations_total{status="error"}[5m])) /
          sum(rate(web3_db_operations_total[5m])) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "数据库错误率过高"
          description: "错误率超过 1%，当前值: {{ $value | humanizePercentage }}"

      # 同步停滞
      - alert: SyncStalled
        expr: web3_sync_blocks_behind > 1000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "同步落后过多区块"
          description: "{{ $labels.project }}:{{ $labels.chain }} 落后 {{ $value }} 个区块"

      # 同步错误
      - alert: SyncError
        expr: web3_sync_status == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "同步任务出错"
          description: "{{ $labels.project }}:{{ $labels.chain }} 同步出错"

      # API 响应时间过高
      - alert: HighAPILatency
        expr: histogram_quantile(0.95, rate(web3_api_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API 响应时间过高"
          description: "95 分位延迟超过 2 秒"

      # API 错误率过高
      - alert: HighAPIErrorRate
        expr: |
          sum(rate(web3_api_requests_total{status=~"5.."}[5m])) /
          sum(rate(web3_api_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "API 错误率过高"
          description: "5xx 错误率超过 5%"
```

---

## 13. 扩展性指南

### 13.1 如何支持新链？

#### 同族扩展 (例如新增 EVM 链 Scroll)

```typescript
// 1. 在 chains 集合中添加配置
const scrollConfig = {
  _id: 'scroll',
  name: 'Scroll Mainnet',
  family: 'evm',
  chainId: '534352',
  nativeToken: 'ETH',
  nativeTokenDecimals: 18,
  rpcUrls: ['https://rpc.scroll.io'],
  explorerUrl: 'https://scrollscan.com',
  isTestnet: false,
  status: 'active',
  blockTime: 3,
};

await Chain.create(scrollConfig);

// 2. 活动数据沿用 metadata.evm 结构，无需任何代码修改
const activity: CreateActivityInput = {
  chain: 'scroll',
  chainFamily: ChainFamily.EVM,
  // ... 其他字段
  metadata: {
    evm: {
      gasUsed: '150000',
      nonce: 42,
      // ... EVM 标准字段
    },
  },
};
```

#### 新族扩展 (例如新增 Starknet)

```typescript
// 1. 在枚举中添加新链族
// types/enums.ts
export enum ChainFamily {
  // ... 现有值
  STARKNET = 'starknet',
}

// 2. 定义新链族的元数据类型
// types/metadata.ts
export interface IStarknetMetadata {
  /** 交易版本 */
  version: number;

  /** 合约地址 */
  contractAddress: string;

  /** 入口点选择器 */
  entryPointSelector: string;

  /** 调用数据 */
  calldata: string[];

  /** 最大费用 */
  maxFee: string;

  /** 签名 */
  signature: string[];

  /** 事件列表 */
  events: {
    fromAddress: string;
    keys: string[];
    data: string[];
  }[];
}

// 3. 更新 IChainMetadata 联合类型
export interface IChainMetadata {
  // ... 现有字段
  starknet?: IStarknetMetadata;
}

// 4. 在 Schema 中添加子 Schema
const StarknetMetadataSchema = new Schema({
  version: { type: Number, required: true },
  contractAddress: { type: String, required: true },
  entryPointSelector: { type: String, required: true },
  calldata: [String],
  maxFee: { type: String, required: true },
  signature: [String],
  events: [{
    fromAddress: String,
    keys: [String],
    data: [String],
  }],
}, { _id: false });

// 5. 添加链配置
const starknetConfig = {
  _id: 'starknet',
  name: 'Starknet Mainnet',
  family: 'starknet',
  chainId: 'SN_MAIN',
  nativeToken: 'ETH',
  nativeTokenDecimals: 18,
  rpcUrls: ['https://starknet-mainnet.public.blastapi.io'],
  isTestnet: false,
  status: 'active',
};
```

### 13.2 如何添加新的活动类型？

```typescript
// 1. 更新枚举
// types/enums.ts
export enum ActivityType {
  // ... 现有值
  PERP_OPEN = 'perp_open',       // 开永续合约仓位
  PERP_CLOSE = 'perp_close',     // 关闭永续合约仓位
  PERP_LIQUIDATE = 'perp_liquidate', // 永续合约清算
}

// 2. 更新 MongoDB 验证器
db.runCommand({
  collMod: "activities",
  validator: {
    $jsonSchema: {
      properties: {
        activityType: {
          enum: [
            // ... 现有值
            "perp_open", "perp_close", "perp_liquidate"
          ]
        }
      }
    }
  }
});

// 3. 添加特定的解析数据结构
// types/activity.ts
export interface IPerpParsedData {
  /** 交易对 */
  market: string;

  /** 方向 */
  side: 'long' | 'short';

  /** 仓位大小 */
  size: string;

  /** 杠杆倍数 */
  leverage: number;

  /** 开仓/平仓价格 */
  price: string;

  /** 实现盈亏 (平仓时) */
  realizedPnl?: string;

  /** 清算价格 (开仓时) */
  liquidationPrice?: string;
}

// 4. 在解析器中使用
const perpActivity: CreateActivityInput = {
  activityType: ActivityType.PERP_OPEN,
  parsedData: {
    market: 'ETH-USD',
    side: 'long',
    size: '10',
    leverage: 5,
    price: '2000',
    liquidationPrice: '1600',
  } as IPerpParsedData,
  // ...
};
```

### 13.3 性能扩展建议

| 数据规模 | 建议配置 |
|----------|----------|
| < 1亿条 | 单副本集，16GB+ 内存，SSD |
| 1-10亿条 | 副本集 + 读写分离，64GB+ 内存 |
| 10-100亿条 | 分片集群 (3+ 分片)，每分片 128GB+ 内存 |
| > 100亿条 | 分片集群 + 冷热分离，考虑时序数据库混合方案 |

---

## 14. 常见问题与最佳实践

### 14.1 FAQ

**Q1: 为什么使用字符串存储金额而不是数字？**

JavaScript 的 Number 类型最大安全整数为 `2^53 - 1`，约等于 `9 * 10^15`。以太坊的 wei 单位中，这仅代表约 9000 ETH。使用字符串可以安全存储任意精度的大数。

```typescript
// 错误示例
const value = 1000000000000000000000; // 1000 ETH = 10^21 wei
// 这会丢失精度！

// 正确示例
const value = "1000000000000000000000";
```

**Q2: 如何处理区块链重组？**

```typescript
async function handleChainReorg(chain: string, reorgDepth: number) {
  const latestBlock = await getLatestBlock(chain);
  const safeBlock = latestBlock - reorgDepth;

  // 1. 删除可能被重组的数据
  await Activity.deleteMany({
    chain,
    blockNumber: { $gt: safeBlock },
  });

  // 2. 更新同步状态
  await SyncStatus.updateOne(
    { chain },
    { $set: { lastSyncedBlock: safeBlock } }
  );

  // 3. 重新同步
  await resyncFromBlock(chain, safeBlock);
}
```

**Q3: 如何优化大量地址的查询？**

```typescript
// 不好的做法：多次查询
for (const address of addresses) {
  const activities = await Activity.find({ from: address });
}

// 好的做法：使用 $in 操作符
const activities = await Activity.find({
  from: { $in: addresses.map(a => a.toLowerCase()) },
}).limit(1000);

// 更好的做法：如果地址数量很大，使用聚合管道
const result = await Activity.aggregate([
  { $match: { from: { $in: addresses } } },
  { $group: { _id: '$from', activities: { $push: '$$ROOT' } } },
]);
```

**Q4: 如何处理高并发写入？**

```typescript
// 1. 使用批量写入
const bulkWriter = new BulkWriterService({ batchSize: 1000 });
await bulkWriter.addMany(activities);

// 2. 使用有序为 false 的 bulkWrite
await Activity.bulkWrite(operations, { ordered: false });

// 3. 考虑使用消息队列缓冲
import { Queue } from 'bullmq';

const activityQueue = new Queue('activities', { connection: redis });
await activityQueue.add('batch', { activities }, { delay: 0 });
```

### 14.2 检查清单

#### 上线前检查

- [ ] 所有索引已创建并生效
- [ ] 数据验证规则已配置
- [ ] 连接池大小已根据负载调优
- [ ] 读写分离已配置 (如适用)
- [ ] 备份策略已制定并测试
- [ ] 监控和告警已配置
- [ ] 健康检查端点可用
- [ ] 日志级别已适当配置
- [ ] 敏感信息已脱敏

#### 运维检查

- [ ] 定期检查慢查询日志
- [ ] 监控磁盘使用率
- [ ] 监控连接数
- [ ] 定期测试备份恢复
- [ ] 定期更新索引统计信息
- [ ] 检查副本集健康状态

### 14.3 推荐阅读

- [MongoDB 官方文档 - 数据建模](https://www.mongodb.com/docs/manual/data-modeling/)
- [MongoDB 官方文档 - 索引策略](https://www.mongodb.com/docs/manual/indexes/)
- [MongoDB 官方文档 - 分片](https://www.mongodb.com/docs/manual/sharding/)
- [Mongoose 文档](https://mongoosejs.com/docs/)

---

## 15. 总结

本文档提供了 Web3 多链数据存储的完整解决方案，核心要点如下：

1. **分层架构**: 通过 `chainFamily` + `chain` 双级结构解决链多样性问题
2. **灵活扩展**: `metadata` 嵌套字段支持无限横向扩展，新增链族无需修改现有结构
3. **类型安全**: 完整的 TypeScript 类型定义和 Mongoose Schema 确保数据一致性
4. **性能优化**: 游标分页、批量写入、Redis 缓存、读写分离等多层优化
5. **高可用**: 副本集、分片集群、自动备份确保服务可靠性
6. **可观测**: Prometheus 指标、健康检查、告警配置实现全面监控

建议在生产环境开启 **WiredTiger 压缩引擎** 和 **zstd 压缩算法**，以应对区块链数据巨大的存储需求。

---

*文档版本: v3.0*
*最后更新: 2024-03*
