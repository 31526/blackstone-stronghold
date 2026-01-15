这是一份关于 **Web3 多链项目数据存储方案** 的技术指引文档。该方案基于 MongoDB 的灵活模式设计，旨在平衡异构链数据的差异性与查询的高效性。

---

# Web3 多链数据存储架构设计指引

## 1. 核心设计理念
Web3 数据具有“高并发、非结构化、跨链异构”的特点。本方案采用 **分层模型 (Hierarchical Model)**：
- **Chain Family (链族)**：抽象公有特征（如 `evm`, `svm`, `move`, `utxo`）。
- **Chain Instance (具体链)**：区分实例（如 `ethereum`, `base`, `solana`, `sui`）。
- **Metadata Nesting (元数据嵌套)**：使用嵌套文档存储特定链的独有字段。

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
  "rpcUrl": "https://...",    // 节点地址
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

## 4. 扩展性指南

### 4.1 如何支持新链？
1.  **同族扩展**：若新增一条 EVM 链（如 Scroll），只需在 `chains` 表插入新文档，`activities` 表沿用 `metadata.evm` 结构即可。
2.  **新族扩展**：若新增一种非现有架构的链（如 TON），在 `activities` 的 `metadata` 对象下新增 `ton: { ... }` 字段，无需对旧数据进行 Schema 修改。

### 4.2 高性能查询技巧
- **Projection (投影)**：查询时仅返回需要的字段（如不返回复杂的 `metadata.evm.logs`），减少网络 IO。
- **Bucket Pattern (桶模式)**：如果某个项目每秒产生万级数据，建议按“分钟”或“小时”对数据进行预聚合存储。
- **TTL Index**：对于测试网数据，可设置 `expireAfterSeconds` 自动清理，保持数据库精简。

---

## 5. 示例查询代码 (Node.js)

```javascript
// 1. 查询某个项目在所有 EVM 兼容链上的最新 50 条大额交易
db.activities.find({
  projectId: "uniswap-v3",
  chainFamily: "evm",
  value: { $gt: "1000000000000000000" } // > 1 ETH
})
.sort({ timestamp: -1 })
.limit(50);

// 2. 统计 Sui 链上特定合约函数的调用次数
db.activities.countDocuments({
  chain: "sui",
  "metadata.move.entryFunction": "0xdee9::clob_market::place_market_order"
});

// 3. 聚合查询：按链统计过去 24 小时的交易量
db.activities.aggregate([
  { $match: { timestamp: { $gte: new Date(Date.now() - 24*60*60*1000) } } },
  { $group: { _id: "$chain", total: { $sum: 1 } } }
]);
```

---

## 6. 总结
该模型通过 **`chainFamily` + `chain`** 的双级结构解决了 Web3 链多样性的痛点，配合 **`metadata` 嵌套字段** 实现了极强的横向扩展能力。建议在生产环境开启 **WiredTiger 压缩引擎**，以应对区块链数据巨大的存储需求。