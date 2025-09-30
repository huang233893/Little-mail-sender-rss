import { IncomingMessage } from 'node:http'; // 替换Request为IncomingMessage
import { getSubscriber, unsubscribe } from '../utils/pg';

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
        JSON.stringify({ error: '未订阅' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await unsubscribe(email);
    return new Response(
      JSON.stringify({ message: '已取消订阅' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('取消订阅失败：', error);
    return new Response(
      JSON.stringify({ error: '操作失败，请重试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}