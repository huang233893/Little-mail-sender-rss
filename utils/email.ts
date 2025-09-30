import nodemailer from 'nodemailer';

// 创建邮件 transporter（从环境变量读取配置）
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465', // 465端口启用SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// 发送订阅确认邮件
export async function sendSubscribeConfirm(email: string) {
  if (!process.env.SITE_URL) {
    throw new Error('未配置 SITE_URL 环境变量');
  }

  return transporter.sendMail({
    from: `"博客订阅通知" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: '订阅成功 - 博客更新提醒',
    html: `
      <p>你好！</p>
      <p>感谢订阅我的博客更新，新文章发布时会第一时间通过邮件通知你~</p>
      <p>如果想取消订阅，可点击：<a href="${process.env.SITE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}">取消订阅</a></p>
    `
  });
}

// 发送新文章通知邮件
export async function sendNewArticleNotify(email: string, article: { title: string; link: string }) {
  if (!process.env.SITE_URL) {
    throw new Error('未配置 SITE_URL 环境变量');
  }

  return transporter.sendMail({
    from: `"新文章提醒" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `新文章发布：${article.title}`,
    html: `
      <p>你好！检测到博客有新文章发布：</p>
      <h3><a href="${article.link}" target="_blank">${article.title}</a></h3>
      <p>不想收到提醒？<a href="${process.env.SITE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}">取消订阅</a></p>
    `
  });
}