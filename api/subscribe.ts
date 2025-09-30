import { IncomingMessage } from 'node:http'; // 替换Request为IncomingMessage
import { saveSubscriber, getSubscriber } from '../utils/pg';
import { sendSubscribeConfirm } from '../utils/email';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmailValid = (email: string) => EMAIL_REGEX.test(email);

export default async function handler(req: IncomingMessage) {
  if (!req.url) { // 处理url可能为undefined的情况
    return new Response(
      JSON.stringify({ error: '无效请求' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const email = url.searchParams.get('email')?.trim();

  if (!email || !isEmailValid(email)) {
    return new Response(
      JSON.stringify({ error: '请提供有效邮箱' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const existing = await getSubscriber(email);
    if (existing && existing.subscribed) {
      return new Response(
        JSON.stringify({ message: '已订阅' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    await saveSubscriber(email);
    await sendSubscribeConfirm(email);
    return new Response(
      JSON.stringify({ message: '订阅成功，确认邮件已发送' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('订阅失败：', error);
    return new Response(
      JSON.stringify({ error: '订阅失败，请重试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}