# 币安 Binance 账户 REST API 文档

## 概述

本文档描述了币安现货交易账户相关的 REST API 接口。

### 基础 URL

- **主要端点**: `https://api.binance.com`
- **备用端点**: `https://api1.binance.com`, `https://api2.binance.com`, `https://api3.binance.com`, `https://api4.binance.com`

### 鉴权说明

所有账户接口都需要 `USER_DATA` 权限，需要进行签名认证：

1. 请求需要包含 `timestamp` 参数（毫秒级时间戳）
2. 请求需要包含 `signature` 参数（HMAC SHA256 签名）
3. 请求头需要包含 `X-MBX-APIKEY`

### 签名生成方法

```javascript
const crypto = require('crypto');

function createSignature(queryString, secretKey) {
  return crypto.createHmac('sha256', secretKey)
    .update(queryString)
    .digest('hex');
}
```

---

## 账户接口列表

| 接口 | 方法 | 路径 | 权重 | 描述 |
|------|------|------|------|------|
| 账户信息 | GET | /api/v3/account | 20 | 获取当前账户信息 |
| 查询订单 | GET | /api/v3/order | 4 | 查询订单状态 |
| 当前挂单 | GET | /api/v3/openOrders | 6/80 | 获取当前挂单 |
| 所有订单 | GET | /api/v3/allOrders | 20 | 获取所有订单 |
| 成交历史 | GET | /api/v3/myTrades | 20/5 | 获取成交历史 |
| 未成交订单数 | GET | /api/v3/rateLimit/order | 40 | 查询未成交订单数 |
| 被阻止的匹配 | GET | /api/v3/myPreventedMatches | 2/20 | 查询因 STP 被阻止的匹配 |
| 分配查询 | GET | /api/v3/myAllocations | 20 | 查询 SOR 订单分配 |
| 佣金费率 | GET | /api/v3/account/commission | 20 | 查询账户佣金费率 |
| 订单修改记录 | GET | /api/v3/order/amendments | 4 | 查询订单修改记录 |
| 相关过���器 | GET | /api/v3/myFilters | 40 | 查询账户相关过滤器 |

---

## 接口详情

### 1. 账户信息 (USER_DATA)

获取当前账户信息。

**请求**

```
GET /api/v3/account
```

**参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| omitZeroBalances | BOOLEAN | 否 | 设为 true 时只返回非零余额，默认 false |
| recvWindow | DECIMAL | 否 | 请求有效期，最大 60000 毫秒 |
| timestamp | LONG | 是 | 时间戳 |

**权重**: 20

**数据源**: Memory => Database

**响应示例**

```json
{
  "makerCommission": 15,
  "takerCommission": 15,
  "buyerCommission": 0,
  "sellerCommission": 0,
  "commissionRates": {
    "maker": "0.00150000",
    "taker": "0.00150000",
    "buyer": "0.00000000",
    "seller": "0.00000000"
  },
  "canTrade": true,
  "canWithdraw": true,
  "canDeposit": true,
  "brokered": false,
  "requireSelfTradePrevention": false,
  "preventSor": false,
  "updateTime": 123456789,
  "accountType": "SPOT",
  "balances": [
    {
      "asset": "BTC",
      "free": "4723846.89208129",
      "locked": "0.00000000"
    },
    {
      "asset": "LTC",
      "free": "4763368.68006011",
      "locked": "0.00000000"
    }
  ],
  "permissions": ["SPOT"],
  "uid": 354937868
}
```

---

### 2. 查询订单 (USER_DATA)

查询订单状态。

**请求**

```
GET /api/v3/order
```

**参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| symbol | STRING | 是 | 交易对 |
| orderId | LONG | 否 | 订单 ID |
| origClientOrderId | STRING | 否 | 客户端订单 ID |
| recvWindow | DECIMAL | 否 | 请求有效期 |
| timestamp | LONG | 是 | 时间戳 |

**注意**: `orderId` 或 `origClientOrderId` 必须提供其一。

**权重**: 4

**数据源**: Memory => Database

**响应示例**

```json
{
  "symbol": "LTCBTC",
  "orderId": 1,
  "orderListId": -1,
  "clientOrderId": "myOrder1",
  "price": "0.1",
  "origQty": "1.0",
  "executedQty": "0.0",
  "cummulativeQuoteQty": "0.0",
  "status": "NEW",
  "timeInForce": "GTC",
  "type": "LIMIT",
  "side": "BUY",
  "stopPrice": "0.0",
  "icebergQty": "0.0",
  "time": 1499827319559,
  "updateTime": 1499827319559,
  "isWorking": true,
  "workingTime": 1499827319559,
  "origQuoteOrderQty": "0.000000",
  "selfTradePreventionMode": "NONE"
}
```

---

### 3. 当前挂单 (USER_DATA)

获取当前所有挂单。

**请求**

```
GET /api/v3/openOrders
```

**参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| symbol | STRING | 否 | 交易对，不传则返回所有交易对的挂单 |
| recvWindow | DECIMAL | 否 | 请求有效期 |
| timestamp | LONG | 是 | 时间戳 |

**权重**:
- 单个交易对: 6
- 不传 symbol: 80

**数据源**: Memory => Database

**响应示例**

```json
[
  {
    "symbol": "LTCBTC",
    "orderId": 1,
    "orderListId": -1,
    "clientOrderId": "myOrder1",
    "price": "0.1",
    "origQty": "1.0",
    "executedQty": "0.0",
    "cummulativeQuoteQty": "0.0",
    "status": "NEW",
    "timeInForce": "GTC",
    "type": "LIMIT",
    "side": "BUY",
    "stopPrice": "0.0",
    "icebergQty": "0.0",
    "time": 1499827319559,
    "updateTime": 1499827319559,
    "isWorking": true,
    "workingTime": 1499827319559,
    "origQuoteOrderQty": "0.000000",
    "selfTradePreventionMode": "NONE"
  }
]
```

---

### 4. 所有订单 (USER_DATA)

获取所有订单（活跃、已取消、已成交）。

**请求**

```
GET /api/v3/allOrders
```

**参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| symbol | STRING | 是 | 交易对 |
| orderId | LONG | 否 | 起始订单 ID |
| startTime | LONG | 否 | 开始时间 |
| endTime | LONG | 否 | 结束时间 |
| limit | INT | 否 | 数量限制，默认 500，最大 1000 |
| recvWindow | DECIMAL | 否 | 请求有效期 |
| timestamp | LONG | 是 | 时间戳 |

**注意**:
- 如果设置了 `orderId`，将返回 >= 该 orderId 的订单
- `startTime` 和 `endTime` 之间的时间间隔不能超过 24 小时

**权重**: 20

**数据源**: Database

---

### 5. 成交历史 (USER_DATA)

获取账户成交历史。

**请求**

```
GET /api/v3/myTrades
```

**参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| symbol | STRING | 是 | 交易对 |
| orderId | LONG | 否 | 订单 ID |
| startTime | LONG | 否 | 开始时间 |
| endTime | LONG | 否 | 结束时间 |
| fromId | LONG | 否 | 起始成交 ID |
| limit | INT | 否 | 数量限制，默认 500，最大 1000 |
| recvWindow | DECIMAL | 否 | 请求有效期 |
| timestamp | LONG | 是 | 时间戳 |

**权重**:
- 不带 orderId: 20
- 带 orderId: 5

**数据源**: Memory => Database

**响应示例**

```json
[
  {
    "symbol": "BNBBTC",
    "id": 28457,
    "orderId": 100234,
    "orderListId": -1,
    "price": "4.00000100",
    "qty": "12.00000000",
    "quoteQty": "48.000012",
    "commission": "10.10000000",
    "commissionAsset": "BNB",
    "time": 1499865549590,
    "isBuyer": true,
    "isMaker": false,
    "isBestMatch": true
  }
]
```

---

### 6. 查询未成交订单数 (USER_DATA)

显示用户所有时间间隔的未成交订单数。

**请求**

```
GET /api/v3/rateLimit/order
```

**参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| recvWindow | DECIMAL | 否 | 请求有效期 |
| timestamp | LONG | 是 | 时间戳 |

**权重**: 40

**数据源**: Memory

**响应示例**

```json
[
  {
    "rateLimitType": "ORDERS",
    "interval": "SECOND",
    "intervalNum": 10,
    "limit": 50,
    "count": 0
  },
  {
    "rateLimitType": "ORDERS",
    "interval": "DAY",
    "intervalNum": 1,
    "limit": 160000,
    "count": 0
  }
]
```

---

### 7. 查询被阻止的匹配 (USER_DATA)

显示因 STP（自我交易预防）而过期的订单列表。

**请求**

```
GET /api/v3/myPreventedMatches
```

**参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| symbol | STRING | 是 | 交易对 |
| preventedMatchId | LONG | 否 | 被阻止的匹配 ID |
| orderId | LONG | 否 | 订单 ID |
| fromPreventedMatchId | LONG | 否 | 起始被阻止匹配 ID |
| limit | INT | 否 | 数量限制，默认 500，最大 1000 |
| recvWindow | DECIMAL | 否 | 请求有效期 |
| timestamp | LONG | 是 | 时间戳 |

**支持的参数组合**:
- `symbol` + `preventedMatchId`
- `symbol` + `orderId`
- `symbol` + `orderId` + `fromPreventedMatchId`
- `symbol` + `orderId` + `fromPreventedMatchId` + `limit`

**权重**:
- 按 preventedMatchId 查询: 2
- 其他情况: 20

**数据源**: Database

---

### 8. 查询分配 (USER_DATA)

检索 SOR 订单的分配结果。

**请求**

```
GET /api/v3/myAllocations
```

**参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| symbol | STRING | 是 | 交易对 |
| startTime | LONG | 否 | 开始时间 |
| endTime | LONG | 否 | 结束时间 |
| fromAllocationId | INT | 否 | 起始分配 ID |
| limit | INT | 否 | 数量限制，默认 500，最大 1000 |
| orderId | LONG | 否 | 订单 ID |
| recvWindow | DECIMAL | 否 | 请求有效期 |
| timestamp | LONG | 是 | 时间戳 |

**权重**: 20

**数据源**: Database

**响应示例**

```json
[
  {
    "symbol": "BTCUSDT",
    "allocationId": 0,
    "allocationType": "SOR",
    "orderId": 1,
    "orderListId": -1,
    "price": "1.00000000",
    "qty": "5.00000000",
    "quoteQty": "5.00000000",
    "commission": "0.00000000",
    "commissionAsset": "BTC",
    "time": 1687506878118,
    "isBuyer": true,
    "isMaker": false,
    "isAllocator": false
  }
]
```

---

### 9. 查询佣金费率 (USER_DATA)

获取当前账户的佣金费率。

**请求**

```
GET /api/v3/account/commission
```

**参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| symbol | STRING | 是 | 交易对 |

**权重**: 20

**数据源**: Database

**响应示例**

```json
{
  "symbol": "BTCUSDT",
  "standardCommission": {
    "maker": "0.00000010",
    "taker": "0.00000020",
    "buyer": "0.00000030",
    "seller": "0.00000040"
  },
  "specialCommission": {
    "maker": "0.01000000",
    "taker": "0.02000000",
    "buyer": "0.03000000",
    "seller": "0.04000000"
  },
  "taxCommission": {
    "maker": "0.00000112",
    "taker": "0.00000114",
    "buyer": "0.00000118",
    "seller": "0.00000116"
  },
  "discount": {
    "enabledForAccount": true,
    "enabledForSymbol": true,
    "discountAsset": "BNB",
    "discount": "0.75000000"
  }
}
```

---

### 10. 查询订单修改记录 (USER_DATA)

查询单个订单的所有修改记录。

**请求**

```
GET /api/v3/order/amendments
```

**参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| symbol | STRING | 是 | 交易对 |
| orderId | LONG | 是 | 订单 ID |
| fromExecutionId | LONG | 否 | 起始执行 ID |
| limit | LONG | 否 | 数量限制，默认 500，最大 1000 |
| recvWindow | DECIMAL | 否 | 请求有效期 |
| timestamp | LONG | 是 | 时间戳 |

**权重**: 4

**数据源**: Database

**响应示例**

```json
[
  {
    "symbol": "BTCUSDT",
    "orderId": 9,
    "executionId": 22,
    "origClientOrderId": "W0fJ9fiLKHOJutovPK3oJp",
    "newClientOrderId": "UQ1Np3bmQ71jJzsSDW9Vpi",
    "origQty": "5.00000000",
    "newQty": "4.00000000",
    "time": 1741669661670
  }
]
```

---

### 11. 查询相关过滤器 (USER_DATA)

检索账户在给定交易对上的相关过滤器列表。

**请求**

```
GET /api/v3/myFilters
```

**参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| symbol | STRING | 是 | 交易对 |
| recvWindow | DECIMAL | 否 | 请求有效期 |
| timestamp | LONG | 是 | 时间戳 |

**权重**: 40

**数据源**: Memory

**响应示例**

```json
{
  "exchangeFilters": [
    {
      "filterType": "EXCHANGE_MAX_NUM_ORDERS",
      "maxNumOrders": 1000
    }
  ],
  "symbolFilters": [
    {
      "filterType": "MAX_NUM_ORDER_LISTS",
      "maxNumOrderLists": 20
    }
  ],
  "assetFilters": [
    {
      "filterType": "MAX_ASSET",
      "asset": "JPY",
      "limit": "1000000.00000000"
    }
  ]
}
```

---

## 错误码

| 错误码 | 描述 |
|--------|------|
| -1000 | 未知错误 |
| -1001 | 连接断开 |
| -1002 | 未授权 |
| -1003 | 请求过多 |
| -1006 | 意外响应 |
| -1007 | 超时 |
| -1014 | 未知订单组合 |
| -1015 | 订单过多 |
| -1016 | 服务关闭 |
| -1020 | 不支持的操作 |
| -1021 | 时间戳无效 |
| -1022 | 签名无效 |
| -2010 | 新订单被拒绝 |
| -2011 | 取消订单被拒绝 |
| -2013 | 订单不存在 |
| -2014 | API Key 格式无效 |
| -2015 | API Key 无效 |

---

## 访问限制

### IP 限制
- 每个 IP 有请求权重限制
- 超过限制返回 HTTP 429
- 持续违规会被自动封禁（HTTP 418）
- 封禁时间从 2 分钟到 3 天不等

### 订单限制
- 每个账户有未成交订单数限制
- 可通过 `/api/v3/rateLimit/order` 查询当前状态
- 如果订单持续被成交，可以继续下单

---

## 更新日志

- 2024-01: 初始版本
