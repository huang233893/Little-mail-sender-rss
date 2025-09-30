// @ts-ignore 忽略 rss-parser 类型检查（因类型包无法安装）
import Parser from 'rss-parser';

// 初始化 RSS 解析器，可配置自定义请求头（避免部分网站反爬）
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
  }
});

/**
 * 解析 RSS 源，获取最新文章信息
 * @param rssUrl - RSS 源地址（如 https://example.com/rss.xml）
 * @returns 最新文章信息（id/标题/链接/发布时间），失败返回 null
 */
export async function getLatestArticle(rssUrl: string): Promise<{
  id: string;
  title: string;
  link: string;
  pubDate?: string;
} | null> {
  if (!rssUrl) {
    console.error('RSS URL 为空');
    return null;
  }

  try {
    // @ts-ignore 忽略返回值类型检查
    const feed = await parser.parseURL(rssUrl);
    
    // 检查是否有文章
    if (!feed.items || feed.items.length === 0) {
      console.log('RSS 源中未找到文章');
      return null;
    }

    // 取第一篇文章（最新发布）
    const latestItem = feed.items[0];
    
    // 确保关键字段存在（避免 undefined 错误）
    const articleId = latestItem.guid || latestItem.link || `auto-${Date.now()}`;
    const articleTitle = latestItem.title || '无标题文章';
    const articleLink = latestItem.link || '#';

    return {
      id: articleId,
      title: articleTitle,
      link: articleLink,
      pubDate: latestItem.pubDate
    };
  } catch (error) {
    console.error(`解析 RSS 失败（${rssUrl}）：`, error);
    return null;
  }
}