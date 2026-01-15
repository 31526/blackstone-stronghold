# Etherscan API 完整文档

## 概述

Etherscan API 提供了访问以太坊区块链数据的 RESTful 接口。

- **Base URL**: `https://api.etherscan.io/api`
- **认证方式**: 通过 `apikey` 查询参数传递 API Key
- **请求格式**: GET 请求
- **响应格式**: JSON

## API 分类总览

| 分类 | Module | 描述 |
|------|--------|------|
| [Account](#1-account-账户) | `account` | 账户余额、交易记录、代币转账等 |
| [Contract](#2-contract-合约) | `contract` | 合约 ABI、源码验证等 |
| [Transaction](#3-transaction-交易) | `transaction` | 交易执行状态、收据等 |
| [Block](#4-block-区块) | `block` | 区块奖励、倒计时等 |
| [Logs](#5-logs-日志) | `logs` | 事件日志查询 |
| [Geth/Parity Proxy](#6-gethparity-proxy-代理) | `proxy` | 以太坊 JSON-RPC 代理 |
| [Token](#7-token-代币) | `token` | ERC20 代币信息 |
| [Gas Tracker](#8-gas-tracker-gas追踪) | `gastracker` | Gas 价格预估 |
| [Stats](#9-stats-统计) | `stats` | 以太坊网络统计数据 |

---

## 1. Account (账户)

账户相关接口，用于查询账户余额、交易历史等。

### 1.1 获取单个地址的 ETH 余额

获取指定地址的原生代币 (ETH) 余额。

```
GET /api?module=account&action=balance&address={address}&tag=latest&apikey={apikey}
```

**参数:**
| 参数 | 必填 | 描述 |
|------|------|------|
| address | 是 | 以太坊地址 |
| tag | 否 | 区块标签: `latest`, `earliest`, `pending` |

**响应示例:**
```json
{
  "status": "1",
  "message": "OK",
  "result": "40807168566070000000000"
}
```

---

### 1.2 获取多个地址的 ETH 余额

批量查询多个地址的余额（最多 20 个地址）。

```
GET /api?module=account&action=balancemulti&address={address1,address2,...}&tag=latest&apikey={apikey}
```

**参数:**
| 参数 | 必填 | 描述 |
|------|------|------|
| address | 是 | 逗号分隔的地址列表（最多 20 个） |
| tag | 否 | 区块标签 |

---

### 1.3 获取普通交易列表

获取地址的普通交易记录。

```
GET /api?module=account&action=txlist&address={address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey={apikey}
```

**参数:**
| 参数 | 必填 | 描述 |
|------|------|------|
| address | 是 | 以太坊地址 |
| startblock | 否 | 起始区块号 |
| endblock | 否 | 结束区块号 |
| page | 否 | 页码 |
| offset | 否 | 每页数量（最大 10000） |
| sort | 否 | 排序: `asc` 或 `desc` |

---

### 1.4 获取内部交易列表

获取地址的内部交易（合约调用）记录。

```
GET /api?module=account&action=txlistinternal&address={address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey={apikey}
```

---

### 1.5 根据交易哈希获取内部交易

```
GET /api?module=account&action=txlistinternal&txhash={txhash}&apikey={apikey}
```

---

### 1.6 根据区块范围获取内部交易

```
GET /api?module=account&action=txlistinternal&startblock={startblock}&endblock={endblock}&page=1&offset=10&sort=asc&apikey={apikey}
```

---

### 1.7 获取 ERC20 代币转账记录

```
GET /api?module=account&action=tokentx&address={address}&contractaddress={contractaddress}&page=1&offset=100&startblock=0&endblock=99999999&sort=asc&apikey={apikey}
```

**参数:**
| 参数 | 必填 | 描述 |
|------|------|------|
| address | 否 | 持有者地址 |
| contractaddress | 否 | 代币合约地址 |

> 注意: `address` 和 `contractaddress` 至少需要提供一个

---

### 1.8 获取 ERC721 (NFT) 转账记录

```
GET /api?module=account&action=tokennfttx&address={address}&contractaddress={contractaddress}&page=1&offset=100&startblock=0&endblock=99999999&sort=asc&apikey={apikey}
```

---

### 1.9 获取 ERC1155 代币转账记录

```
GET /api?module=account&action=token1155tx&address={address}&contractaddress={contractaddress}&page=1&offset=100&startblock=0&endblock=99999999&sort=asc&apikey={apikey}
```

---

### 1.10 获取已挖区块列表

获取地址作为矿工挖出的区块列表。

```
GET /api?module=account&action=getminedblocks&address={address}&blocktype=blocks&page=1&offset=10&apikey={apikey}
```

**参数:**
| 参数 | 必填 | 描述 |
|------|------|------|
| blocktype | 否 | `blocks` 或 `uncles` |

---

### 1.11 获取历史 ETH 余额

获取指定区块高度时的 ETH 余额（仅限 Pro API）。

```
GET /api?module=account&action=balancehistory&address={address}&blockno={blockno}&apikey={apikey}
```

---

### 1.12 获取地址的代币余额

```
GET /api?module=account&action=tokenbalance&contractaddress={contractaddress}&address={address}&tag=latest&apikey={apikey}
```

---

### 1.13 获取地址持有的代币列表

```
GET /api?module=account&action=addresstokenbalance&address={address}&page=1&offset=100&apikey={apikey}
```

---

### 1.14 获取地址持有的 NFT 列表

```
GET /api?module=account&action=addresstokennftbalance&address={address}&page=1&offset=100&apikey={apikey}
```

---

## 2. Contract (合约)

智能合约相关接口。

### 2.1 获取已验证合约的 ABI

```
GET /api?module=contract&action=getabi&address={address}&apikey={apikey}
```

---

### 2.2 获取已验证合约的源代码

```
GET /api?module=contract&action=getsourcecode&address={address}&apikey={apikey}
```

**响应包含:**
- `SourceCode`: 合约源代码
- `ABI`: 合约 ABI
- `ContractName`: 合约名称
- `CompilerVersion`: 编译器版本
- `OptimizationUsed`: 是否开启优化
- `Runs`: 优化运行次数
- `ConstructorArguments`: 构造函数参数
- `EVMVersion`: EVM 版本
- `Library`: 使用的库
- `LicenseType`: 许可证类型
- `Proxy`: 是否为代理合约
- `Implementation`: 实现合约地址

---

### 2.3 获取合约创建者和创建交易哈希

```
GET /api?module=contract&action=getcontractcreation&contractaddresses={address1,address2,...}&apikey={apikey}
```

---

### 2.4 验证合约源代码

```
POST /api?module=contract&action=verifysourcecode&apikey={apikey}
```

**POST 参数:**
| 参数 | 必填 | 描述 |
|------|------|------|
| contractaddress | 是 | 合约地址 |
| sourceCode | 是 | 合约源代码 |
| codeformat | 是 | `solidity-single-file` 或 `solidity-standard-json-input` |
| contractname | 是 | 合约名称 |
| compilerversion | 是 | 编译器版本 |
| optimizationUsed | 是 | 0 = 否, 1 = 是 |
| runs | 否 | 优化运行次数 |
| constructorArguements | 否 | ABI 编码的构造函数参数 |
| evmversion | 否 | EVM 版本 |
| licenseType | 否 | 许可证类型 (1-14) |

---

### 2.5 检查源代码验证状态

```
GET /api?module=contract&action=checkverifystatus&guid={guid}&apikey={apikey}
```

---

### 2.6 验证代理合约

```
POST /api?module=contract&action=verifyproxycontract&apikey={apikey}
```

---

### 2.7 检查代理合约验证状态

```
GET /api?module=contract&action=checkproxyverification&guid={guid}&apikey={apikey}
```

---

## 3. Transaction (交易)

交易执行状态相关接口。

### 3.1 检查合约执行状态

检查交易执行是否成功（合约交易）。

```
GET /api?module=transaction&action=getstatus&txhash={txhash}&apikey={apikey}
```

**响应:**
```json
{
  "status": "1",
  "message": "OK",
  "result": {
    "isError": "0",
    "errDescription": ""
  }
}
```

---

### 3.2 检查交易收据状态

检查交易是否被成功提交。

```
GET /api?module=transaction&action=gettxreceiptstatus&txhash={txhash}&apikey={apikey}
```

**响应:**
```json
{
  "status": "1",
  "message": "OK",
  "result": {
    "status": "1"
  }
}
```

> `result.status`: "1" = 成功, "0" = 失败

---

## 4. Block (区块)

区块相关接口。

### 4.1 获取区块奖励

获取矿工的区块奖励和叔块奖励。

```
GET /api?module=block&action=getblockreward&blockno={blockno}&apikey={apikey}
```

---

### 4.2 获取区块倒计时

估算到达指定区块号的剩余时间。

```
GET /api?module=block&action=getblockcountdown&blockno={blockno}&apikey={apikey}
```

---

### 4.3 根据时间戳获取区块号

```
GET /api?module=block&action=getblocknobytime&timestamp={timestamp}&closest={before|after}&apikey={apikey}
```

**参数:**
| 参数 | 必填 | 描述 |
|------|------|------|
| timestamp | 是 | Unix 时间戳（秒） |
| closest | 是 | `before` 或 `after` |

---

### 4.4 获取每日平均区块大小

```
GET /api?module=block&action=dailyavgblocksize&startdate={startdate}&enddate={enddate}&sort=asc&apikey={apikey}
```

---

### 4.5 获取每日区块数量和奖励

```
GET /api?module=block&action=dailyblkcount&startdate={startdate}&enddate={enddate}&sort=asc&apikey={apikey}
```

---

### 4.6 获取每日区块奖励

```
GET /api?module=block&action=dailyblockrewards&startdate={startdate}&enddate={enddate}&sort=asc&apikey={apikey}
```

---

### 4.7 获取每日平均出块时间

```
GET /api?module=block&action=dailyavgblocktime&startdate={startdate}&enddate={enddate}&sort=asc&apikey={apikey}
```

---

### 4.8 获取每日叔块数量

```
GET /api?module=block&action=dailyuncleblkcount&startdate={startdate}&enddate={enddate}&sort=asc&apikey={apikey}
```

---

## 5. Logs (日志)

事件日志查询接口。

### 5.1 获取事件日志（按地址）

```
GET /api?module=logs&action=getLogs&address={address}&fromBlock={fromBlock}&toBlock={toBlock}&page=1&offset=1000&apikey={apikey}
```

---

### 5.2 获取事件日志（按主题过滤）

```
GET /api?module=logs&action=getLogs&address={address}&fromBlock={fromBlock}&toBlock={toBlock}&topic0={topic0}&topic0_1_opr=and&topic1={topic1}&apikey={apikey}
```

**主题操作符:**
| 参数 | 描述 |
|------|------|
| topic0_1_opr | topic0 和 topic1 的关系: `and` 或 `or` |
| topic1_2_opr | topic1 和 topic2 的关系 |
| topic2_3_opr | topic2 和 topic3 的关系 |
| topic0_2_opr | topic0 和 topic2 的关系 |
| topic0_3_opr | topic0 和 topic3 的关系 |
| topic1_3_opr | topic1 和 topic3 的关系 |

---

## 6. Geth/Parity Proxy (代理)

以太坊 JSON-RPC API 代理接口。

### 6.1 eth_blockNumber

获取最新区块号。

```
GET /api?module=proxy&action=eth_blockNumber&apikey={apikey}
```

---

### 6.2 eth_getBlockByNumber

根据区块号获取区块信息。

```
GET /api?module=proxy&action=eth_getBlockByNumber&tag={blockNumber}&boolean=true&apikey={apikey}
```

**参数:**
| 参数 | 描述 |
|------|------|
| tag | 区块号（十六进制）或 `latest`, `earliest`, `pending` |
| boolean | `true` 返回完整交易对象, `false` 只返回交易哈希 |

---

### 6.3 eth_getUncleByBlockNumberAndIndex

获取叔块信息。

```
GET /api?module=proxy&action=eth_getUncleByBlockNumberAndIndex&tag={blockNumber}&index={index}&apikey={apikey}
```

---

### 6.4 eth_getBlockTransactionCountByNumber

获取区块中的交易数量。

```
GET /api?module=proxy&action=eth_getBlockTransactionCountByNumber&tag={blockNumber}&apikey={apikey}
```

---

### 6.5 eth_getTransactionByHash

根据交易哈希获取交易详情。

```
GET /api?module=proxy&action=eth_getTransactionByHash&txhash={txhash}&apikey={apikey}
```

---

### 6.6 eth_getTransactionByBlockNumberAndIndex

根据区块号和索引获取交易。

```
GET /api?module=proxy&action=eth_getTransactionByBlockNumberAndIndex&tag={blockNumber}&index={index}&apikey={apikey}
```

---

### 6.7 eth_getTransactionCount

获取地址发送的交易数量（nonce）。

```
GET /api?module=proxy&action=eth_getTransactionCount&address={address}&tag=latest&apikey={apikey}
```

---

### 6.8 eth_sendRawTransaction

发送已签名的交易。

```
POST /api?module=proxy&action=eth_sendRawTransaction&hex={signedTransactionHex}&apikey={apikey}
```

---

### 6.9 eth_getTransactionReceipt

获取交易收据。

```
GET /api?module=proxy&action=eth_getTransactionReceipt&txhash={txhash}&apikey={apikey}
```

---

### 6.10 eth_call

执行只读智能合约调用。

```
GET /api?module=proxy&action=eth_call&to={contractAddress}&data={encodedFunctionCall}&tag=latest&apikey={apikey}
```

---

### 6.11 eth_getCode

获取合约字节码。

```
GET /api?module=proxy&action=eth_getCode&address={address}&tag=latest&apikey={apikey}
```

---

### 6.12 eth_getStorageAt

获取合约存储槽的值。

```
GET /api?module=proxy&action=eth_getStorageAt&address={address}&position={position}&tag=latest&apikey={apikey}
```

---

### 6.13 eth_gasPrice

获取当前 gas 价格。

```
GET /api?module=proxy&action=eth_gasPrice&apikey={apikey}
```

---

### 6.14 eth_estimateGas

估算交易所需 gas。

```
GET /api?module=proxy&action=eth_estimateGas&data={encodedFunctionCall}&to={toAddress}&value={value}&gasPrice={gasPrice}&gas={gas}&apikey={apikey}
```

---

## 7. Token (代币)

ERC20 代币相关接口。

### 7.1 获取 ERC20 代币总供应量

```
GET /api?module=stats&action=tokensupply&contractaddress={contractaddress}&apikey={apikey}
```

---

### 7.2 获取 ERC20 代币余额

```
GET /api?module=account&action=tokenbalance&contractaddress={contractaddress}&address={address}&tag=latest&apikey={apikey}
```

---

### 7.3 获取代币历史总供应量

```
GET /api?module=stats&action=tokensupplyhistory&contractaddress={contractaddress}&blockno={blockno}&apikey={apikey}
```

---

### 7.4 获取代币历史余额

```
GET /api?module=account&action=tokenbalancehistory&contractaddress={contractaddress}&address={address}&blockno={blockno}&apikey={apikey}
```

---

### 7.5 获取代币信息

```
GET /api?module=token&action=tokeninfo&contractaddress={contractaddress}&apikey={apikey}
```

---

### 7.6 获取地址的代币持有列表

```
GET /api?module=account&action=addresstokenbalance&address={address}&page=1&offset=100&apikey={apikey}
```

---

## 8. Gas Tracker (Gas 追踪)

Gas 价格估算接口。

### 8.1 获取预估 Gas 价格

```
GET /api?module=gastracker&action=gasoracle&apikey={apikey}
```

**响应:**
```json
{
  "status": "1",
  "message": "OK",
  "result": {
    "LastBlock": "13053741",
    "SafeGasPrice": "20",
    "ProposeGasPrice": "22",
    "FastGasPrice": "24",
    "suggestBaseFee": "19.230609716",
    "gasUsedRatio": "0.370119078777807,0.8954731,0.550911766666667,0.212457033333333,0.552463633333333"
  }
}
```

---

### 8.2 获取预估确认时间

根据 gas 价格估算交易确认时间。

```
GET /api?module=gastracker&action=gasestimate&gasprice={gaspriceInWei}&apikey={apikey}
```

---

### 8.3 获取每日平均 Gas Limit

```
GET /api?module=stats&action=dailyavggaslimit&startdate={startdate}&enddate={enddate}&sort=asc&apikey={apikey}
```

---

### 8.4 获取每日总 Gas 使用量

```
GET /api?module=stats&action=dailygasused&startdate={startdate}&enddate={enddate}&sort=asc&apikey={apikey}
```

---

### 8.5 获取每日平均 Gas 价格

```
GET /api?module=stats&action=dailyavggasprice&startdate={startdate}&enddate={enddate}&sort=asc&apikey={apikey}
```

---

## 9. Stats (统计)

以太坊网络统计数据接口。

### 9.1 获取 ETH 总供应量

```
GET /api?module=stats&action=ethsupply&apikey={apikey}
```

---

### 9.2 获取 ETH2 总供应量

```
GET /api?module=stats&action=ethsupply2&apikey={apikey}
```

---

### 9.3 获取 ETH 最新价格

```
GET /api?module=stats&action=ethprice&apikey={apikey}
```

**响应:**
```json
{
  "status": "1",
  "message": "OK",
  "result": {
    "ethbtc": "0.07526",
    "ethbtc_timestamp": "1621319146",
    "ethusd": "2347.11",
    "ethusd_timestamp": "1621319143"
  }
}
```

---

### 9.4 获取以太坊节点数量

```
GET /api?module=stats&action=nodecount&apikey={apikey}
```

---

### 9.5 获取每日网络交易费

```
GET /api?module=stats&action=dailytxnfee&startdate={startdate}&enddate={enddate}&sort=asc&apikey={apikey}
```

---

### 9.6 获取每日新地址数量

```
GET /api?module=stats&action=dailynewaddress&startdate={startdate}&enddate={enddate}&sort=asc&apikey={apikey}
```

---

### 9.7 获取每日网络利用率

```
GET /api?module=stats&action=dailynetutilization&startdate={startdate}&enddate={enddate}&sort=asc&apikey={apikey}
```

---

### 9.8 获取每日平均哈希率

```
GET /api?module=stats&action=dailyavghashrate&startdate={startdate}&enddate={enddate}&sort=asc&apikey={apikey}
```

---

### 9.9 获取每日交易数量

```
GET /api?module=stats&action=dailytx&startdate={startdate}&enddate={enddate}&sort=asc&apikey={apikey}
```

---

### 9.10 获取每日平均网络难度

```
GET /api?module=stats&action=dailyavgnetdifficulty&startdate={startdate}&enddate={enddate}&sort=asc&apikey={apikey}
```

---

### 9.11 获取历史 ETH 市值

```
GET /api?module=stats&action=ethdailymarketcap&startdate={startdate}&enddate={enddate}&sort=asc&apikey={apikey}
```

---

### 9.12 获取历史 ETH 价格

```
GET /api?module=stats&action=ethdailyprice&startdate={startdate}&enddate={enddate}&sort=asc&apikey={apikey}
```

---

## 错误码说明

| 状态码 | 消息 | 描述 |
|--------|------|------|
| 1 | OK | 请求成功 |
| 0 | NOTOK | 请求失败 |

**常见错误消息:**
- `Invalid API Key`: API Key 无效
- `Max rate limit reached`: 达到速率限制
- `No transactions found`: 未找到交易
- `Invalid address format`: 地址格式无效
- `Contract source code not verified`: 合约未验证

---

## 速率限制

| 计划 | 调用频率 | 每日限制 |
|------|----------|----------|
| Free | 5 次/秒 | 100,000 次 |
| Standard | 10 次/秒 | 200,000 次 |
| Advanced | 20 次/秒 | 500,000 次 |
| Professional | 30 次/秒 | 1,000,000 次 |

---

## 参考链接

- [Etherscan API 官方文档](https://docs.etherscan.io/)
- [获取 API Key](https://etherscan.io/myapikey)
- [API 使用条款](https://etherscan.io/terms)
