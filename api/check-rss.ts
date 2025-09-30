import { kv } from '@vercel/kv';
import { sendEmail } from '../utils/email';

// 解析RSS获取最新文章
function parseRss(xml: string) {
  const titleMatch = xml.match(/<item>\s*<title>(.*?)<\/title>/);
  const linkMatch = xml.match(/<item>\s*<title>.*?<\/title>\s*<link>(.*?)<\/link>/);
  const pubDateMatch = xml.match(/<item>\s*<title>.*?<\/title>\s*<link>.*?<\/link>\s*<pubDate>(.*?)<\/pubDate>/);

  return {
    title: titleMatch?.[1] || null,
    link: linkMatch?.[1] || null,
    pubDate: pubDateMatch?.[1] || null
  };
}

export default async function handler(req: Request) {
  try {
    // 1. 获取你的RSS地址
    const rssUrl = 'https://www.sumi233.top/rss.xml'; // 替换为你的RSS地址
    const response = await fetch(rssUrl);
    const rssXml = await response.text();

    // 2. 解析最新文章
    const { title, link, pubDate } = parseRss(rssXml);
    if (!title || !link) {
      return new Response(JSON.stringify({ error: '解析RSS失败' }), { status: 500 });
    }

    // 3. 检查是否是新文章（对比KV中存储的上次文章）
    const lastPost = await kv.get('last_post');
    if (lastPost === `${title}|${pubDate}`) {
      return new Response(JSON.stringify({ message: '无新文章' }));
    }

    // 4. 存储最新文章标识到KV
    await kv.set('last_post', `${title}|${pubDate}`);

    // 5. 获取所有订阅者并发送通知
    const { keys } = await kv.scan(0, { match: '*@*' }); // 匹配邮箱格式的键
    for (const email of keys) {
      const data = await kv.get(email);
      if (data && JSON.parse(data as string).subscribed) {
        await sendEmail(
          email,
          `新文章发布：${title}`,
          `
            <h3>📝 新文章通知</h3>
            <p>最新文章：《${title}》</p>
            <p>点击查看：<a href="${link}" target="_blank">${link}</a></p>
          `
        );
      }
    }

    return new Response(JSON.stringify({ success: true, message: '邮件发送完成' }));
  } catch (error) {
    console.error('RSS检查失败:', error);
    return new Response(JSON.stringify({ error: '检查RSS失败' }), { status: 500 });
  }
}