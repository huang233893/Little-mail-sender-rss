import { Request } from 'node:http';
import { saveSubscriber, getSubscriber } from '../utils/pg';
import { sendSubscribeConfirm } from '../utils/email';

// 邮箱格式验证
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmailValid = (email: string) => EMAIL_REGEX.test(email);

export default async function handler(req: Request) {
  // 解析URL参数
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const email = url.searchParams.get('email')?.trim();

  // 验证邮箱参数
  if (!email || !isEmailValid(email)) {
    return new Response(
      JSON.stringify({ error: '请提供有效的邮箱地址' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 检查是否已订阅
    const existingSubscriber = await getSubscriber(email);
    if (existingSubscriber && existingSubscriber.subscribed) {
      return new Response(
        JSON.stringify({ message: '该邮箱已订阅' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 保存订阅信息并发送确认邮件
    await saveSubscriber(email);
    await sendSubscribeConfirm(email);

    return new Response(
      JSON.stringify({ message: '订阅成功，确认邮件已发送' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('订阅接口出错：', error);
    return new Response(
      JSON.stringify({ error: '订阅失败，请稍后重试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}