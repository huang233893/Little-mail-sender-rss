import { Request } from 'node:http';
import { getSubscriber } from '../utils/pg';

export default async function handler(req: Request) {
  // 解析URL参数
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const email = url.searchParams.get('email')?.trim();

  if (!email) {
    return new Response(
      JSON.stringify({ error: '请提供邮箱地址' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const subscriber = await getSubscriber(email);

    if (!subscriber) {
      return new Response(
        JSON.stringify({ status: '未订阅' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        status: subscriber.subscribed ? '已订阅' : '已取消订阅',
        subscribeTime: subscriber.subscribe_time.toISOString() // PostgreSQL 时间转ISO格式
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('查询订阅状态接口出错：', error);
    return new Response(
      JSON.stringify({ error: '查询失败，请稍后重试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}