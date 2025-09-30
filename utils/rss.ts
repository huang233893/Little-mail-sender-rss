import Parser from 'rss-parser'; // 修正模块导入

const parser = new Parser();

export async function getLatestArticle(rssUrl: string) {
  try {
    const feed = await parser.parseURL(rssUrl);
    if (feed.items.length === 0) return null;
    const latest = feed.items[0];
    return {
      id: latest.guid || latest.link,
      title: latest.title || '无标题',
      link: latest.link || '',
      pubDate: latest.pubDate
    };
  } catch (error) {
    console.error('RSS解析失败：', error);
    return null;
  }
}