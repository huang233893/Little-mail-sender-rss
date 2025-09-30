import Parser from 'rss-parser';

const parser = new Parser();

// 解析RSS源，返回最新文章信息（取第一篇）
export async function getLatestArticle(rssUrl: string) {
  try {
    const feed = await parser.parseURL(rssUrl);
    if (feed.items.length === 0) {
      console.log('RSS源中无文章');
      return null;
    }

    const latestItem = feed.items[0];
    return {
      id: latestItem.guid || latestItem.link, // 用guid或链接作为唯一标识
      title: latestItem.title || '无标题',
      link: latestItem.link || '',
      pubDate: latestItem.pubDate || new Date().toISOString()
    };
  } catch (error) {
    console.error('RSS解析失败：', error);
    throw new Error(`解析RSS时出错：${(error as Error).message}`);
  }
}