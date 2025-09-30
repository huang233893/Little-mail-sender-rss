import { IncomingMessage } from 'node:http'; // 替换Request为IncomingMessage
import { getSubscriber } from '../utils/pg';

export default async function handler(req: IncomingMessage) {
  if (!req.url) {
    return new Response(
      JSON.stringify({ error: '无效请求' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const email = url.searchParams.get('email')?.trim();

  if (!email) {
    return new Response(
      JSON.stringify({ error: '请提供邮箱' }),
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
        subscribeTime: subscriber.subscribe_time.toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('查询失败：', error);
    return new Response(
      JSON.stringify({ error: '查询失败，请重试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}