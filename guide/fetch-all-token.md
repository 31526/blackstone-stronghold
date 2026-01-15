根据 CoinMarketCap (CMC) 官方文档，我为你整理了如何在 Node.js 中使用 API Key 请求接口的指引文档，并针对你的需求找到了查询代币列表的最佳接口。

---

# CoinMarketCap API Node.js 请求指引

## 1. 准备工作

1.  **获取 API Key**: 登录 [CoinMarketCap Developer Portal](https://pro.coinmarketcap.com/) 注册账号并获取你的 `API Key`。
2.  **环境地址**:
    *   **生产环境 (Production)**: `https://pro-api.coinmarketcap.com`
    *   **沙盒环境 (Sandbox/测试)**: `https://sandbox-api.coinmarketcap.com` (用于免费测试)

## 2. 身份验证方式

CoinMarketCap 要求将 API Key 放入 HTTP 请求头（Header）中，字段名为：
`X-CMC_PRO_API_KEY`

---

## 3. Node.js 请求示例 (使用 Axios)

推荐使用 `axios` 库，因为它处理 JSON 和 Header 非常方便。

### 安装依赖
```bash
npm install axios
```

### 基础请求代码
```javascript
const axios = require('axios');

// 配置常量
const API_KEY = '你的_API_KEY_在这里';
const BASE_URL = 'https://pro-api.coinmarketcap.com'; // 生产环境

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-CMC_PRO_API_KEY': API_KEY,
    'Accept': 'application/json',
    'Accept-Encoding': 'deflate, gzip' // 文档建议开启压缩以提高性能
  }
});

/**
 * 通用请求函数
 */
async function makeRequest(endpoint, params = {}) {
  try {
    const response = await client.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error('API 请求错误:', error.response ? error.response.data : error.message);
    throw error;
  }
}
```

---

## 4. 查询“所有代币列表”的接口

根据 CMC 文档，获取代币列表通常有两种场景，对应不同的接口：

### 方案 A：获取所有代币的映射列表 (ID Map)
如果你只需要代币的 **ID、名称、符号 (Symbol) 和合约地址**，而不关心即时价格，这个接口最省额度且返回数据最全。

*   **接口名称**: `ID Map`
*   **端点**: `/v1/cryptocurrency/map`
*   **用途**: 用于同步本地数据库的代币基础信息。

```javascript
async function getAllTokenMap() {
  const endpoint = '/v1/cryptocurrency/map';
  const params = {
    listing_status: 'active', // 仅获取活跃代币
    limit: 5000,              // 每次返回的数量
    sort: 'cmc_rank'          // 按排名排序
  };
  
  const data = await makeRequest(endpoint, params);
  console.log('获取到的代币数量:', data.data.length);
  return data.data; // 返回数组包含 id, name, symbol, platform 等
}
```

### 方案 B：获取最新排名和价格列表 (Listings Latest)
如果你需要代币的 **最新价格、市值、涨跌幅** 以及列表。

*   **接口名称**: `Latest Listings`
*   **端点**: `/v1/cryptocurrency/listings/latest`
*   **用途**: 获取按市值排名的代币行情列表。

```javascript
async function getLatestListings() {
  const endpoint = '/v1/cryptocurrency/listings/latest';
  const params = {
    start: 1,      // 从第 1 名开始
    limit: 100,    // 返回前 100 名
    convert: 'USD' // 价格转换为美元
  };

  const data = await makeRequest(endpoint, params);
  data.data.forEach(coin => {
    console.log(`${coin.cmc_rank}. ${coin.name} (${coin.symbol}) - $${coin.quote.USD.price}`);
  });
}
```

---

## 5. 重要注意事项

1.  **频率限制 (Rate Limits)**: 
    *   免费版 (Basic Plan) 限制较多，务必检查响应头中的 `Usage` 情况。
    *   不要在前端代码直接调用，否则会暴露 API Key。应通过你的 Node.js 后端转发。
2.  **大数处理**: 代币的价格或供应量可能非常大，虽然 Node.js 的数字类型可以处理大部分情况，但涉及精准计算建议使用 `big.js` 或 `bignumber.js`。
3.  **分页查询**: 
    *   代币总数通常有上万个。使用 `start` 和 `limit` 参数进行分页循环请求，以获取完整列表。
4.  **错误处理**: 
    *   `401`: API Key 错误。
    *   `429`: 触发频率限制。
    *   `402`: 额度已用完（Credit limit reached）。

## 6. 快速整合建议
如果你正在开发上一条回复中的“多链存储系统”，你可以先通过 `/v1/cryptocurrency/map` 接口获取数据，然后根据返回结果中的 `platform` 字段（例如 `platform.name === 'Ethereum'`）来自动判定该代币属于哪个 `chain` 或 `chainFamily`。