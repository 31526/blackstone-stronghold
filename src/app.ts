import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDB from '@/config/database';
import coinmarketcapRoutes from '@/routes/coinmarketcap.routes';
import etherscanRoutes from '@/routes/etherscan';
import binanceRoutes from '@/routes/binance';
import dexscreenerRoutes from '@/routes/dexscreener';
import bitgetRoutes from '@/routes/bitget';
import okxRoutes from '@/routes/okx';

// 加载环境变量
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查路由
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// CoinMarketCap 路由
app.use('/coinmarketcap', coinmarketcapRoutes);

// Etherscan 路由
app.use('/etherscan', etherscanRoutes);

// Binance 路由
app.use('/binance', binanceRoutes);

// DexScreener 路由
app.use('/dexscreener', dexscreenerRoutes);

// Bitget 路由
app.use('/bitget', bitgetRoutes);

// OKX 路由
app.use('/okx', okxRoutes);

// 启动服务器
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  });
};

startServer();

export default app;
