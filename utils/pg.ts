import { sql } from '@vercel/postgres';

// 初始化数据库表（首次运行时自动创建 subscribers 表）
async function initTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS subscribers (
        email TEXT PRIMARY KEY,  # 邮箱作为唯一主键
        subscribed BOOLEAN NOT NULL DEFAULT true,
        subscribe_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    // 存储最新文章ID的表（单条记录）
    await sql`
      CREATE TABLE IF NOT EXISTS rss_state (
        key TEXT PRIMARY KEY DEFAULT 'last_article_id',
        value TEXT NOT NULL
      );
      -- 初始化一条默认记录（如果不存在）
      INSERT INTO rss_state (value) 
      VALUES ('') 
      ON CONFLICT (key) DO NOTHING;
    `;
    console.log('数据库表初始化成功');
  } catch (error) {
    console.error('数据库表初始化失败：', error);
  }
}

// 初始化表（项目启动时执行）
initTable();

// 存储订阅用户
export async function saveSubscriber(email: string) {
  try {
    // 若已存在则更新为订阅状态，否则插入新记录
    await sql`
      INSERT INTO subscribers (email, subscribed)
      VALUES (${email}, true)
      ON CONFLICT (email) 
      DO UPDATE SET subscribed = true;
    `;
  } catch (error) {
    console.error('保存订阅用户失败：', error);
    throw error;
  }
}

// 获取订阅用户信息
export async function getSubscriber(email: string) {
  const { rows } = await sql`
    SELECT * FROM subscribers WHERE email = ${email};
  `;
  return rows[0] || null;
}

// 取消订阅
export async function unsubscribe(email: string) {
  await sql`
    UPDATE subscribers 
    SET subscribed = false 
    WHERE email = ${email};
  `;
}

// 获取所有已订阅的用户
export async function getAllSubscribers() {
  const { rows } = await sql`
    SELECT email FROM subscribers WHERE subscribed = true;
  `;
  return rows.map(row => ({ email: row.email }));
}

// 存储最新文章ID
export async function saveLastArticleId(id: string) {
  await sql`
    UPDATE rss_state 
    SET value = ${id} 
    WHERE key = 'last_article_id';
  `;
}

// 获取最新文章ID
export async function getLastArticleId() {
  const { rows } = await sql`
    SELECT value FROM rss_state WHERE key = 'last_article_id';
  `;
  return rows[0]?.value || null;
}