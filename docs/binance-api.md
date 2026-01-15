# Binance Spot REST API 文档

## 概述

本文档整理了币安现货交易 REST API 的主要行情接口及其访问限制。

## API 基本信息

### Base URL

- **https://api.binance.com** - 主接口
- **https://api-gcp.binance.com** - GCP接口
- **https://api1.binance.com** - 备用接口1
- **https://api2.binance.com** - 备用接口2
- **https://api3.binance.com** - 备用接口3
- **https://api4.binance.com** - 备用接口4
- **https://data-api.binance.vision** - 仅公开行情数据

> 注意: api1-api4 性能更好但稳定性略低

### 响应格式

- 默认返回 JSON 格式
- 所有时间戳以毫秒为单位（可通过 `X-MBX-TIME-UNIT: MICROSECOND` 请求微秒）

---

## 访问限制

### IP 限制

| 限制类型 | 间隔 | 限制值 |
|---------|------|--------|
| REQUEST_WEIGHT | 1分钟 | 6000 |
| RAW_REQUESTS | 5分钟 | 61000 |

### 订单限制

| 限制类型 | 间隔 | 限制值 |
|---------|------|--------|
| ORDERS | 1秒 | 10 |

### 响应头

- `X-MBX-USED-WEIGHT-(intervalNum)(intervalLetter)`: 当前IP已使用的权重
- `X-MBX-ORDER-COUNT-(intervalNum)(intervalLetter)`: 订单计数

### HTTP 返回码

| 代码 | 说明 |
|-----|------|
| 4XX | 请求格式错误 |
| 403 | WAF规则触发 |
| 409 | cancelReplace订单部分成功 |
| 429 | 请求频率超限 |
| 418 | IP被自动封禁 |
| 5XX | 服务器内部错误 |

---

## 请求鉴权

### 鉴权类型

| 类型 | 说明 |
|------|------|
| NONE | 公开市场数据，无需鉴权 |
| TRADE | 交易接口，需要签名 |
| USER_DATA | 账户信息，需要签名 |
| USER_STREAM | 用户数据流管理 |

### SIGNED 请求

需要以下参数：

- `timestamp`: 当前时间戳（毫秒或微秒）
- `signature`: HMAC SHA256 签名
- `recvWindow`: 可选，请求有效窗口（默认5000ms，最大60000ms）

### 签名算法 (HMAC SHA256)

```bash
# 1. 构造签名载荷
payload="symbol=BTCUSDT&side=BUY&type=LIMIT&timestamp=1499827319559"

# 2. 计算签名
signature=$(echo -n "$payload" | openssl dgst -sha256 -hmac "YOUR_SECRET_KEY")

# 3. 发送请求
curl -H "X-MBX-APIKEY: YOUR_API_KEY" \
  "https://api.binance.com/api/v3/order?$payload&signature=$signature"
```

---

## 通用接口

### 测试连通性

```
GET /api/v3/ping
```

- **权重**: 1
- **鉴权**: NONE

### 服务器时间

```
GET /api/v3/time
```

- **权重**: 1
- **鉴权**: NONE

**响应**:
```json
{
  "serverTime": 1499827319559
}
```

### 交易所信息

```
GET /api/v3/exchangeInfo
```

- **权重**: 20
- **鉴权**: NONE

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| symbol | STRING | NO | 单个交易对 |
| symbols | STRING | NO | 多个交易对，如 ["BTCUSDT","BNBUSDT"] |
| permissions | STRING | NO | 权限类型 |

---

## 行情接口

### 深度信息

```
GET /api/v3/depth
```

- **权重**: 根据limit变化 (5-50: 5, 100: 10, 500: 25, 1000: 50, 5000: 250)
- **鉴权**: NONE

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| symbol | STRING | YES | 交易对 |
| limit | INT | NO | 默认100，最大5000 |

**响应**:
```json
{
  "lastUpdateId": 1027024,
  "bids": [["4.00000000", "431.00000000"]],
  "asks": [["4.00000200", "12.00000000"]]
}
```

### 近期成交列表

```
GET /api/v3/trades
```

- **权重**: 10
- **鉴权**: NONE

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| symbol | STRING | YES | 交易对 |
| limit | INT | NO | 默认500，最大1000 |

### 历史成交

```
GET /api/v3/historicalTrades
```

- **权重**: 10
- **鉴权**: NONE（需要API Key）

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| symbol | STRING | YES | 交易对 |
| limit | INT | NO | 默认500，最大1000 |
| fromId | LONG | NO | 从哪个tradeId开始 |

### 聚合交易

```
GET /api/v3/aggTrades
```

- **权重**: 4
- **鉴权**: NONE

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| symbol | STRING | YES | 交易对 |
| fromId | LONG | NO | 从哪个ID开始 |
| startTime | LONG | NO | 起始时间戳 |
| endTime | LONG | NO | 结束时间戳 |
| limit | INT | NO | 默认500，最大1000 |

### K线数据

```
GET /api/v3/klines
```

- **权重**: 2
- **鉴权**: NONE

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| symbol | STRING | YES | 交易对 |
| interval | ENUM | YES | K线间隔 |
| startTime | LONG | NO | 起始时间 |
| endTime | LONG | NO | 结束时间 |
| timeZone | STRING | NO | 时区，默认0(UTC) |
| limit | INT | NO | 默认500，最大1000 |

**K线间隔值**:

| 类型 | 值 |
|-----|-----|
| 秒 | 1s |
| 分钟 | 1m, 3m, 5m, 15m, 30m |
| 小时 | 1h, 2h, 4h, 6h, 8h, 12h |
| 天 | 1d, 3d |
| 周 | 1w |
| 月 | 1M |

**响应**:
```json
[
  [
    1499040000000,      // 开盘时间
    "0.01634790",       // 开盘价
    "0.80000000",       // 最高价
    "0.01575800",       // 最低价
    "0.01577100",       // 收盘价
    "148976.11427815",  // 成交量
    1499644799999,      // 收盘时间
    "2434.19055334",    // 成交额
    308,                // 成交笔数
    "1756.87402397",    // 主动买入成交量
    "28.46694368",      // 主动买入成交额
    "0"                 // 忽略
  ]
]
```

### UI优化K线

```
GET /api/v3/uiKlines
```

- **权重**: 2
- **鉴权**: NONE
- **说明**: 与klines相同参数，返回优化的蜡烛图数据

### 当前平均价格

```
GET /api/v3/avgPrice
```

- **权重**: 2
- **鉴权**: NONE

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| symbol | STRING | YES | 交易对 |

**响应**:
```json
{
  "mins": 5,
  "price": "9.35751834",
  "closeTime": 1694061154503
}
```

### 24小时价格变动

```
GET /api/v3/ticker/24hr
```

- **权重**:
  - 单个symbol: 2
  - 无参数或多个: 80
  - 21-100个symbols: 40
- **鉴权**: NONE

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| symbol | STRING | NO | 单个交易对 |
| symbols | STRING | NO | 多个交易对数组 |
| type | ENUM | NO | FULL或MINI |
| symbolStatus | ENUM | NO | TRADING/HALT/BREAK |

### 交易日行情

```
GET /api/v3/ticker/tradingDay
```

- **权重**: 4 × symbol数量（最大200）
- **鉴权**: NONE

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| symbol | STRING | YES* | 单个交易对 |
| symbols | STRING | YES* | 多个交易对(最大100个) |
| timeZone | STRING | NO | 时区 |
| type | ENUM | NO | FULL或MINI |

### 最新价格

```
GET /api/v3/ticker/price
```

- **权重**:
  - 单个symbol: 2
  - 无参数或多个: 4
- **鉴权**: NONE

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| symbol | STRING | NO | 单个交易对 |
| symbols | STRING | NO | 多个交易对数组 |

**响应**:
```json
{
  "symbol": "BTCUSDT",
  "price": "42000.00000000"
}
```

### 最优挂单

```
GET /api/v3/ticker/bookTicker
```

- **权重**:
  - 单个symbol: 2
  - 无参数或多个: 4
- **鉴权**: NONE

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| symbol | STRING | NO | 单个交易对 |
| symbols | STRING | NO | 多个交易对数组 |

**响应**:
```json
{
  "symbol": "BTCUSDT",
  "bidPrice": "42000.00000000",
  "bidQty": "1.00000000",
  "askPrice": "42000.50000000",
  "askQty": "0.50000000"
}
```

### 滚动窗口价格变动

```
GET /api/v3/ticker
```

- **权重**: 4 × symbol数量（最大200）
- **鉴权**: NONE

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| symbol | STRING | YES* | 单个交易对 |
| symbols | STRING | YES* | 多个交易对(最大100个) |
| windowSize | ENUM | NO | 窗口大小，默认1d |
| type | ENUM | NO | FULL或MINI |

**windowSize 值**:
- 分钟: 1m, 2m, ..., 59m
- 小时: 1h, 2h, ..., 23h
- 天: 1d, 2d, ..., 7d

---

## 交易接口

### 下单

```
POST /api/v3/order
```

- **权重**: 1
- **鉴权**: TRADE

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| symbol | STRING | YES | 交易对 |
| side | ENUM | YES | BUY/SELL |
| type | ENUM | YES | 订单类型 |
| timeInForce | ENUM | NO | GTC/IOC/FOK |
| quantity | DECIMAL | NO | 数量 |
| quoteOrderQty | DECIMAL | NO | 报价资产数量 |
| price | DECIMAL | NO | 价格 |
| newClientOrderId | STRING | NO | 自定义订单ID |
| stopPrice | DECIMAL | NO | 止损价 |
| icebergQty | DECIMAL | NO | 冰山订单数量 |
| newOrderRespType | ENUM | NO | ACK/RESULT/FULL |
| recvWindow | LONG | NO | 有效窗口 |
| timestamp | LONG | YES | 时间戳 |

### 测试下单

```
POST /api/v3/order/test
```

- **权重**: 1
- **鉴权**: TRADE
- **说明**: 验证订单参数但不实际下单

### 撤单

```
DELETE /api/v3/order
```

- **权重**: 1
- **鉴权**: TRADE

### 查询订单

```
GET /api/v3/order
```

- **权重**: 4
- **鉴权**: USER_DATA

### 当前挂单

```
GET /api/v3/openOrders
```

- **权重**: 6（单个symbol）/ 80（全部）
- **鉴权**: USER_DATA

### 所有订单

```
GET /api/v3/allOrders
```

- **权重**: 20
- **鉴权**: USER_DATA

---

## 账户接口

### 账户信息

```
GET /api/v3/account
```

- **权重**: 20
- **鉴权**: USER_DATA

**响应**:
```json
{
  "makerCommission": 15,
  "takerCommission": 15,
  "buyerCommission": 0,
  "sellerCommission": 0,
  "canTrade": true,
  "canWithdraw": true,
  "canDeposit": true,
  "updateTime": 123456789,
  "accountType": "SPOT",
  "balances": [
    {
      "asset": "BTC",
      "free": "4723846.89208129",
      "locked": "0.00000000"
    }
  ]
}
```

### 账户成交历史

```
GET /api/v3/myTrades
```

- **权重**: 20
- **鉴权**: USER_DATA

---

## 枚举定义

### 交易对状态 (status)

| 值 | 说明 |
|----|------|
| TRADING | 交易中 |
| END_OF_DAY | 日终 |
| HALT | 暂停 |
| BREAK | 中断 |

### 订单状态 (status)

| 值 | 说明 |
|----|------|
| NEW | 已接受 |
| PENDING_NEW | 待处理 |
| PARTIALLY_FILLED | 部分成交 |
| FILLED | 完全成交 |
| CANCELED | 已撤销 |
| PENDING_CANCEL | 待撤销 |
| REJECTED | 已拒绝 |
| EXPIRED | 已过期 |
| EXPIRED_IN_MATCH | STP过期 |

### 订单类型 (type)

| 值 | 说明 |
|----|------|
| LIMIT | 限价单 |
| MARKET | 市价单 |
| STOP_LOSS | 止损单 |
| STOP_LOSS_LIMIT | 限价止损单 |
| TAKE_PROFIT | 止盈单 |
| TAKE_PROFIT_LIMIT | 限价止盈单 |
| LIMIT_MAKER | 只挂单 |

### 订单方向 (side)

| 值 | 说明 |
|----|------|
| BUY | 买入 |
| SELL | 卖出 |

### 有效期 (timeInForce)

| 值 | 说明 |
|----|------|
| GTC | 成交为止 |
| IOC | 立即成交或取消 |
| FOK | 全部成交或取消 |

### K线间隔 (interval)

| 值 | 说明 |
|----|------|
| 1s | 1秒 |
| 1m, 3m, 5m, 15m, 30m | 分钟 |
| 1h, 2h, 4h, 6h, 8h, 12h | 小时 |
| 1d, 3d | 天 |
| 1w | 周 |
| 1M | 月 |

### 响应类型 (newOrderRespType)

| 值 | 说明 |
|----|------|
| ACK | 仅确认 |
| RESULT | 订单结果 |
| FULL | 完整信息 |

---

## 过滤器

### 交易对过滤器

| 过滤器 | 说明 |
|-------|------|
| PRICE_FILTER | 价格限制 (minPrice, maxPrice, tickSize) |
| PERCENT_PRICE | 价格百分比限制 |
| PERCENT_PRICE_BY_SIDE | 按方向的价格百分比限制 |
| LOT_SIZE | 数量限制 (minQty, maxQty, stepSize) |
| MIN_NOTIONAL | 最小名义价值 |
| NOTIONAL | 名义价值范围 |
| ICEBERG_PARTS | 冰山订单部分数限制 |
| MARKET_LOT_SIZE | 市价单数量限制 |
| MAX_NUM_ORDERS | 最大订单数 |
| MAX_NUM_ALGO_ORDERS | 最大算法订单数 |
| MAX_NUM_ICEBERG_ORDERS | 最大冰山订单数 |
| MAX_POSITION | 最大持仓 |
| TRAILING_DELTA | 追踪止损限制 |

### 交易所过滤器

| 过滤器 | 说明 |
|-------|------|
| EXCHANGE_MAX_NUM_ORDERS | 交易所最大订单数 |
| EXCHANGE_MAX_NUM_ALGO_ORDERS | 交易所最大算法订单数 |
| EXCHANGE_MAX_NUM_ICEBERG_ORDERS | 交易所最大冰山订单数 |

---

## 错误代码

| 代码 | 说明 |
|-----|------|
| -1000 | 未知错误 |
| -1001 | 断开连接 |
| -1002 | 未授权 |
| -1003 | 请求过多 |
| -1006 | 意外响应 |
| -1007 | 超时 |
| -1014 | 不支持的订单组合 |
| -1015 | 订单过多 |
| -1016 | 服务关闭 |
| -1020 | 不支持的操作 |
| -1021 | 时间戳不在recvWindow内 |
| -1022 | 签名无效 |
| -1100 | 非法字符 |
| -1101 | 参数过多 |
| -1102 | 缺少必填参数 |
| -1103 | 未知参数 |
| -1104 | 未读参数 |
| -1105 | 参数为空 |
| -1106 | 不需要该参数 |
| -1111 | 精度过高 |
| -1112 | 空订单簿 |
| -1114 | 需要timeInForce |
| -1115 | 无效timeInForce |
| -1116 | 无效订单类型 |
| -1117 | 无效方向 |
| -1118 | 需要newClientOrderId |
| -1119 | 需要原始客户订单ID |
| -1120 | 无效间隔 |
| -1121 | 无效交易对 |
| -1125 | 无效listenKey |
| -1127 | 超过查询时间范围 |
| -1128 | 参数组合无效 |
| -1130 | 无效数据 |
| -2010 | 新订单被拒绝 |
| -2011 | 撤单被拒绝 |
| -2013 | 订单不存在 |
| -2014 | API Key格式无效 |
| -2015 | 无效API Key/IP/权限 |
