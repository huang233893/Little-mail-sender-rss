import { kv } from '@vercel/kv'; // 自动关联Vercel KV
import { sendEmail } from '../utils/email';

export default async function handler(req: Request) {
  // 处理跨域
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  // 只接受POST请求
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: '只支持POST请求' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const { email } = await req.json();

    // 验证邮箱格式
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: '请输入有效的邮箱' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const emailKey = email.toLowerCase();

    // 存储到KV
    await kv.set(emailKey, JSON.stringify({
      subscribed: true,
      createdAt: new Date().toISOString()
    }));

    // 发送确认邮件
    await sendEmail(
      email,
      '订阅成功 - 博客更新通知',
      `
        <h3>🎉 订阅成功！</h3>
        <p>你已成功订阅我们的博客更新，新文章发布时会第一时间通知你~</p>
      `
    );

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '订阅失败，请稍后重试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}