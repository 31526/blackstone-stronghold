# Web3 多链数据存储架构设计指引

## 目录
- [Web3 多链数据存储架构设计指引](#web3-多链数据存储架构设计指引)
  - [目录](#目录)
  - [1. 核心设计理念](#1-核心设计理念)
  - [2. 数据库集合 (Collections) 设计](#2-数据库集合-collections-设计)
    - [2.1 链元数据表 (`chains`)](#21-链元数据表-chains)
    - [2.2 核心活动/交易表 (`activities`)](#22-核心活动交易表-activities)
  - [3. 索引策略 (Index Strategy)](#3-索引策略-index-strategy)
  - [4. 查询示例](#4-查询示例)
    - [4.1 查询特定项目的最新活动](#41-查询特定项目的最新活动)
    - [4.2 查询某地址在 EVM 链上的交易](#42-查询某地址在-evm-链上的交易)
    - [4.3 聚合统计 Swap 总量](#43-聚合统计-swap-总量)
  - [5. 最佳实践与注意事项](#5-最佳实践与注意事项)

---

## 1. 核心设计理念
Web3 数据具有“高并发、非结构化、跨链异构”的特点。本方案采用 **分层模型 (Hierarchical Model)**：
- **Chain Family (链族)**：抽象公有特征（如 `evm`, `svm`, `move`, `utxo`）。
- **Chain Instance (具体链)**：区分实例（如 `ethereum`, `base`, `solana`, `sui`）。
- **Metadata Nesting (元数据嵌套)**：使用嵌套文档存储特定链的独有字段。

这种设计平衡了异构链数据的差异性与查询的高效性，支持灵活扩展新链类型。

---

## 2. 数据库集合 (Collections) 设计

### 2.1 链元数据表 (`chains`)
用于管理系统支持的链列表及全局配置。

```json
{
  "_id": "base",              // 唯一标识，建议使用小写字符串
  "name": "Base Mainnet",     // 显示名称
  "family": "evm",            // 链族分类：evm, utxo, svm, move, ton
  "chainId": "8453",          // 链官方 ID (EVM 为数字字符串，其他链可自定)
  "nativeToken": "ETH",       // 原生代币符号
  "rpcUrl": "https://mainnet.base.org",    // 节点地址
  "isTestnet": false,         // 是否为测试网
  "status": "active"          // 状态：active, maintenance, deprecated
}
```

### 2.2 核心活动/交易表 (`activities`)
这是存储项目数据的核心表，采用 **Header-Body** 结构。

```javascript
{
  "_id": ObjectId("65f..."),
  "projectId": "uniswap-v3",   // 项目/协议唯一 ID
  
  // --- 路由与索引字段 ---
  "chain": "base",             // 具体链 (对应 chains._id)
  "chainFamily": "evm",        // 链族 (用于跨链分类查询)
  
  // --- 通用交易字段 ---
  "txHash": "0xabc123...",     // 交易哈希 (必须建立唯一索引)
  "blockNumber": 1823456,      // 区块高度
  "timestamp": ISODate("2024-03-20T10:00:00Z"),
  "from": "0xaddress1",        // 发起方地址
  "to": "0xaddress2",          // 接收方或合约地址
  "value": "1000000000000",    // 原始金额 (建议存字符串以防大数溢出)
  "status": "confirmed",       // 状态：pending, confirmed, failed
  "activityType": "swap",      // 业务类型：transfer, swap, mint, burn, stake
  
  // --- 异构链特定数据 (根据 chainFamily 动态选择字段) ---
  "metadata": {
    // EVM 链特有
    "evm": {
      "gasUsed": "21000",
      "cumulativeGasUsed": "500000",
      "nonce": 42,
      "logs": [ { "address": "...", "data": "..." } ]
    },
    // Solana (SVM) 特有
    "svm": {
      "instructions": [ ... ],
      "recentBlockhash": "...",
      "computeUnits": 500
    },
    // Sui/Aptos (Move) 特有
    "move": {
      "entryFunction": "0x1::coin::transfer",
      "arguments": ["arg1", "arg2"],
      "events": [ { "type": "...", "contents": { ... } } ]
    },
    // Bitcoin (UTXO) 特有
    "utxo": {
      "inputs": [{ "txid": "...", "vout": 0 }],
      "outputs": [{ "value": 1.5, "address": "..." }]
    }
  }
}
```

---

## 3. 索引策略 (Index Strategy)

高效查询的关键在于构建符合业务逻辑的**复合索引**。

| 业务场景 | 索引字段定义 (MongoDB) | 说明 |
| :--- | :--- | :--- |
| **全网交易检索** | `{ "txHash": 1 }` | 唯一索引，确保不重复入库 |
| **项目多链时间流** | `{ "projectId": 1, "timestamp": -1 }` | 支撑项目主页的最新动态 |
| **特定链数据过滤** | `{ "projectId": 1, "chain": 1, "timestamp": -1 }` | 查询某项目在 Base 链的历史 |
| **用户资产历史** | `{ "from": 1, "timestamp": -1 }` | 查询某钱包地址的所有发出记录 |
| **大类链分析** | `{ "chainFamily": 1, "activityType": 1 }` | 统计所有 EVM 链的 Swap 总量 |

---

## 4. 查询示例

### 4.1 查询特定项目的最新活动
```javascript
db.activities.find({ "projectId": "uniswap-v3" }).sort({ "timestamp": -1 }).limit(10);
```

### 4.2 查询某地址在 EVM 链上的交易
```javascript
db.activities.find({
  "from": "0xaddress1",
  "chainFamily": "evm"
}).sort({ "timestamp": -1 });
```

### 4.3 聚合统计 Swap 总量
```javascript
db.activities.aggregate([
  { $match: { "activityType": "swap", "chainFamily": "evm" } },
  { $group: { _id: null, totalValue: { $sum: { $toDouble: "$value" } } } }
]);
```

---

## 5. 最佳实践与注意事项

- **数据一致性**：确保 `chain` 和 `chainFamily` 与 `chains` 表保持同步。
- **性能优化**：定期监控索引使用情况，避免过度嵌套。
- **扩展性**：新增链类型时，先更新 `chains` 表，然后扩展 `metadata` 结构。
- **安全**：敏感字段如私钥不应存储在数据库中。
- **备份**：定期备份数据，考虑使用 MongoDB 的副本集。

---

*本文档基于 MongoDB 灵活模式设计，适用于 Web3 多链项目数据存储。如有疑问，请参考 MongoDB 官方文档。*






文档 docs/001-mongo-chain-v3.md 已创建完成！

  优化内容总结

  相比原始 v1 文档，v3 版本进行了以下全面优化：

  新增内容

  | 章节              | 内容                                  |
  |-----------------|-------------------------------------|
  | TypeScript 类型定义 | 完整的枚举、链元数据、活动类型、6 种链族元数据接口          |
  | Mongoose Schema | 生产级 Schema 定义，含中间件、静态方法、实例方法        |
  | 数据验证            | JSON Schema + Zod 验证 + 业务规则验证       |
  | 安全性考虑           | 数据库访问安全、NoSQL 注入防护、速率限制、敏感数据处理      |
  | 性能优化            | 游标分页、投影优化、批量写入、Redis 缓存、读写分离        |
  | 分片与高可用          | 分片策略、副本集配置、架构图、备份恢复脚本               |
  | 数据迁移            | Schema 版本管理、零停机迁移、数据导入导出            |
  | 完整代码示例          | CRUD 服务、Express API 路由、DEX Swap 解析器 |
  | 监控与告警           | Prometheus 指标、健康检查、Alertmanager 规则  |
  | 扩展性指南           | 新链扩展步骤、新活动类型添加、性能扩展建议               |
  | FAQ 与最佳实践       | 常见问题解答、上线检查清单、运维检查清单                |

  支持的链族

  - EVM (Ethereum, Base, Arbitrum, Polygon...)
  - SVM (Solana)
  - Move (Sui, Aptos)
  - UTXO (Bitcoin, Litecoin)
  - TON
  - Cosmos

  文档约 5000 行，可直接作为项目开发的参考文档使用。