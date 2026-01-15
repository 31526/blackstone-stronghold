# blackstone-stronghold



⏺ 项目配置完成！以下是项目结构：

  blackstoneStronghold/
  ├── src/
  │   ├── config/
  │   │   └── database.ts      # MongoDB 连接配置
  │   ├── controllers/         # 控制器
  │   ├── models/              # 数据模型
  │   ├── routes/              # 路由
  │   ├── middlewares/         # 中间件
  │   ├── utils/               # 工具函数
  │   └── app.ts               # 入口文件
  ├── dist/                    # 编译输出目录
  ├── .env                     # 环境变量
  ├── .env.example# 环境变量示例
  ├── .gitignore
  ├── .prettierrc
  ├── eslint.config.js
  ├── nodemon.json
  ├── package.json
  └── tsconfig.json

  可用命令：

  | 命令            | 说明            |
  |---------------|---------------|
  | pnpm dev      | 开发模式（热重载）     |
  | pnpm build    | 编译 TypeScript |
  | pnpm start    | 运行编译后的代码      |
  | pnpm lint     | 代码检查          |
  | pnpm lint:fix | 自动修复代码问题      |
  | pnpm format   | 格式化代码         |

  路径别名使用示例：
  import connectDB from '@/config/database';

  启动开发服务器：pnpm dev