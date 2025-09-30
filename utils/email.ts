import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// 发送订阅确认邮件
export async function sendSubscribeConfirm(email: string) {
  if (!process.env.SITE_URL) throw new Error('未配置SITE_URL');
  return transporter.sendMail({
    from: `"博客订阅" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: '订阅成功 - 博客更新提醒',
    html: `
      <p>你好！感谢订阅我的博客更新~</p>
      <p>取消订阅：<a href="${process.env.SITE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}">点击这里</a></p>
    `
  });
}

// 发送新文章通知
export async function sendNewArticleNotify(email: string, article: { title: string; link: string }) {
  if (!process.env.SITE_URL) throw new Error('未配置SITE_URL');
  return transporter.sendMail({
    from: `"新文章提醒" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `新文章：${article.title}`,
    html: `
      <p>新文章发布：<a href="${article.link}">${article.title}</a></p>
      <p>取消订阅：<a href="${process.env.SITE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}">点击这里</a></p>
    `
  });
}