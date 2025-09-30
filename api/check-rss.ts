import { getLatestArticle } from '../utils/rss';
import { getLastArticleId, saveLastArticleId, getAllSubscribers } from '../utils/pg';
import { sendNewArticleNotify } from '../utils/email';

// 从环境变量获取RSS地址（必填）
const RSS_URL = process.env.RSS_URL;

export default async function handler() {
  // 检查RSS地址配置
  if (!RSS_URL) {
    return new Response('未配置 RSS_URL 环境变量', { status: 500 });
  }

  try {
    // 1. 获取最新文章
    const latestArticle = await getLatestArticle(RSS_URL);
    if (!latestArticle) {
      return new Response('未获取到有效文章', { status: 200 });
    }

    // 2. 对比上次记录的文章ID，判断是否为新文章
    const lastArticleId = await getLastArticleId();
    if (lastArticleId === latestArticle.id) {
      return new Response('无新文章发布', { status: 200 });
    }

    // 3. 有新文章：更新记录并通知订阅者
    await saveLastArticleId(latestArticle.id);
    const subscribers = await getAllSubscribers();

    if (subscribers.length === 0) {
      return new Response('检测到新文章，但无订阅用户', { status: 200 });
    }

    // 4. 批量发送通知邮件（控制并发，避免触发邮件服务商限制）
    const notifyPromises = subscribers.map(sub => 
      sendNewArticleNotify(sub.email, {
        title: latestArticle.title,
        link: latestArticle.link
      }).catch(err => {
        console.error(`给 ${sub.email} 发送邮件失败：`, err);
      })
    );
    await Promise.all(notifyPromises);

    return new Response(`新文章通知已发送给 ${subscribers.length} 位订阅者`, { status: 200 });
  } catch (error) {
    console.error('RSS检查与通知流程出错：', error);
    return new Response('处理失败', { status: 500 });
  }
}