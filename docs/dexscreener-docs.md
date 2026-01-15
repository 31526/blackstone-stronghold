
⏺ 让我创建一个测试脚本来直接调用 API 并保存结果：

⏺ Write(scripts/test-dexscreener.ts)
  ⎿  Wrote 123 lines to scripts/test-dexscreener.ts
     /**
      * DexScreener API 测试脚本
      * 测试所有 API 端点并将结果保存到 data 目录
      */
     import * as fs from 'fs/promises';
     import * as path from 'path';
     import {
       getLatestTokenProfiles,
       getLatestTokenBoosts,
     … +113 lines (ctrl+o to expand)

⏺ Bash(npx ts-node -r tsconfig-paths/register scripts/test-dexscreener.ts 2>&1)
  ⎿  ========================================
     DexScreener API 测试
     ========================================
     … +52 lines (ctrl+o to expand)

⏺ 所有测试都通过了！让我验证保存的文件：

⏺ Bash(ls -la data/dexscreener/)
  ⎿  total 496
     drwxr-xr-x  10 master  staff    320 Jan 15 23:17 .
     drwxr-xr-x  39 master  staff   1248 Jan 15 23:16 ..
     … +8 lines (ctrl+o to expand)

⏺ 让我查看一个示例文件确认数据格式正确：

⏺ Read(data/dexscreener/test_pairs_eth_usdc.json)
  ⎿  Read 135 lines

⏺ 所有任务已完成！让我总结一下创建的文件结构：

  开发完成总结

  创建的文件

  blackstoneStronghold/
  ├── docs/
  │   └── dexscreener-api.json          # Postman 兼容的 API 文档 (可直接导入)
  ├── src/
  │   ├── apis/
  │   │   └── dexscreener/
  │   │       └── types.ts               # TypeScript 类型定义 (接口、枚举)
  │   ├── services/
  │   │   └── dexscreener.service.ts     # DexScreener API 服务封装
  │   ├── routes/
  │   │   └── dexscreener/
  │   │       └── index.ts               # /dexscreener 路由 (含所有二级路由)
  │   └── app.ts                         # 已注册 dexscreener 路由
  ├── scripts/
  │   └── test-dexscreener.ts            # API 测试脚本
  └── data/
      └── dexscreener/                   # 测试结果 JSON 文件
          ├── test_token_profiles_latest.json
          ├── test_token_boosts_latest.json
          ├── test_token_boosts_top.json
          ├── test_orders_sol.json
          ├── test_pairs_eth_usdc.json
          ├── test_tokens_weth.json
          ├── test_search_pepe.json
          └── test_search_weth.json

  API 路由一览

  | 路由                                         | 方法  | 描述           |
  |--------------------------------------------|-----|--------------|
  | /dexscreener/token-profiles/latest         | GET | 获取最新代币配置文件   |
  | /dexscreener/token-boosts/latest           | GET | 获取最新代币加速     |
  | /dexscreener/token-boosts/top              | GET | 获取热门代币加速     |
  | /dexscreener/orders/:chainId/:tokenAddress | GET | 获取代币订单状态     |
  | /dexscreener/pairs/:chainId/:pairAddresses | GET | 根据交易对地址获取交易对 |
  | /dexscreener/tokens/:tokenAddresses        | GET | 根据代币地址获取交易对  |
  | /dexscreener/search?q={keyword}            | GET | 搜索交易对        |

  所有路由都支持 ?save=true 参数将结果保存到 data/dexscreener/ 目录。

  类型定义

  - 枚举: ChainId, OrderType, OrderStatus, SocialLinkType
  - 接口: Token, Pair, PairsResponse, TokenProfile, TokenBoost, Order, Boost, OrdersResponse 等