import nodemailer from 'nodemailer';

// 创建SMTP连接（自动读取环境变量）
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER, // 你的邮箱账号
    pass: process.env.SMTP_PASS  // 邮箱授权码（不是密码）
  }
});

// 发送邮件函数
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: `"博客订阅" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('邮件发送失败:', error);
    throw new Error('发送邮件失败，请稍后重试');
  }
}