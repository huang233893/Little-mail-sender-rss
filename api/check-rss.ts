import { getLatestArticle } from '../utils/rss';
import { getLastArticleId, saveLastArticleId, getAllSubscribers } from '../utils/pg';
import { sendNewArticleNotify } from '../utils/email';

const RSS_URL = process.env.RSS_URL;

export default async function handler() {
  if (!RSS_URL) {
    return new Response('未配置RSS_URL', { status: 500 });
  }

  try {
    const latestArticle = await getLatestArticle(RSS_URL);
    if (!latestArticle) {
      return new Response('未获取到文章', { status: 200 });
    }

    const lastId = await getLastArticleId();
    if (lastId === latestArticle.id) {
      return new Response('无新文章', { status: 200 });
    }

    await saveLastArticleId(latestArticle.id);
    const subscribers = await getAllSubscribers();

    if (subscribers.length === 0) {
      return new Response('有新文章，无订阅者', { status: 200 });
    }

    await Promise.all(subscribers.map(sub => 
      sendNewArticleNotify(sub.email, {
        title: latestArticle.title,
        link: latestArticle.link
      }).catch(err => console.error(`发送失败（${sub.email}）：`, err))
    ));

    return new Response(`已通知 ${subscribers.length} 人`, { status: 200 });
  } catch (error) {
    console.error('处理失败：', error);
    return new Response('处理失败', { status: 500 });
  }
}