import { Request } from 'node:http';
import { getSubscriber, unsubscribe } from '../utils/pg';

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
    // 检查是否存在订阅
    const subscriber = await getSubscriber(email);
    if (!subscriber) {
      return new Response(
        JSON.stringify({ error: '该邮箱未订阅' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 取消订阅（更新状态）
    await unsubscribe(email);

    return new Response(
      JSON.stringify({ message: '已成功取消订阅' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('取消订阅接口出错：', error);
    return new Response(
      JSON.stringify({ error: '操作失败，请稍后重试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}