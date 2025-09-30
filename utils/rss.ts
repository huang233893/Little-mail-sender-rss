export function parseRss(xml: string) {
  // 提取最新文章信息（适配Hexo RSS格式）
  const titleMatch = xml.match(/<item>\s*<title>(.*?)<\/title>/);
  const linkMatch = xml.match(/<item>\s*<title>.*?<\/title>\s*<link>(.*?)<\/link>/);
  const pubDateMatch = xml.match(/<item>\s*<title>.*?<\/title>\s*<link>.*?<\/link>\s*<pubDate>(.*?)<\/pubDate>/);

  return {
    latestTitle: titleMatch?.[1] || null,
    latestLink: linkMatch?.[1] || null,
    latestPubDate: pubDateMatch?.[1] || null
  };
}