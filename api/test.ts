// api/test-page.ts
export default async function handler(req: Request) {
  // 只处理 GET 请求（浏览器访问默认是 GET）
  if (req.method !== 'GET') {
    return new Response('只支持 GET 请求', { status: 405 });
  }

  // 直接返回测试网页的完整 HTML（包含样式、脚本、功能）
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API 测试工具</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
    body { max-width: 600px; margin: 50px auto; padding: 0 20px; background: #f5f5f5; }
    .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { text-align: center; color: #333; margin-bottom: 30px; }
    .input-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; color: #666; font-weight: 500; }
    input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; }
    button { width: 100%; padding: 12px; background: #0070f3; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; margin-bottom: 10px; transition: background 0.3s; }
    button:hover { background: #0051a8; }
    .result { margin-top: 25px; padding: 15px; border-radius: 5px; background: #fafafa; border: 1px solid #eee; }
    .result h3 { color: #333; margin-bottom: 10px; }
    #resultText { color: #555; font-family: "Courier New", monospace; white-space: pre-wrap; word-break: break-all; }
    .success { color: #00b42a !important; }
    .error { color: #f53f3f !important; }
  </style>
</head>
<body>
  <div class="container">
    <h1>API 测试工具</h1>
    <div class="input-group">
      <label for="email">测试邮箱</label>
      <input type="email" id="email" placeholder="如 test@example.com" required>
    </div>
    <button onclick="testApi('subscribe')">测试 订阅接口</button>
    <button onclick="testApi('unsubscribe')">测试 取消订阅接口</button>
    <button onclick="testApi('check')">测试 检查订阅状态接口</button>
    <div class="result">
      <h3>返回结果</h3>
      <pre id="resultText">点击按钮开始测试...</pre>
    </div>
  </div>

  <script>
    // 相对路径请求 API（和当前接口同域名，无需改地址）
    const API_BASE = '/api';

    async function testApi(type) {
      const email = document.getElementById('email').value;
      const resultText = document.getElementById('resultText');
      let url, data;

      resultText.textContent = '请求中...';
      resultText.className = '';

      if (!email) {
        resultText.textContent = '请先输入邮箱！';
        resultText.className = 'error';
        return;
      }

      // 配置接口路径
      switch(type) {
        case 'subscribe': url = \`\${API_BASE}/subscribe\`; data = { email }; break;
        case 'unsubscribe': url = \`\${API_BASE}/unsubscribe\`; data = { email }; break;
        case 'check': url = \`\${API_BASE}/check\`; data = { email }; break;
      }

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        resultText.textContent = JSON.stringify(result, null, 2);
        // 成功/失败颜色区分
        if (res.ok && (result.success || result.subscribed !== undefined)) {
          resultText.className = 'success';
        } else {
          resultText.className = 'error';
        }
      } catch (err) {
        resultText.textContent = \`请求失败：\${err.message}\`;
        resultText.className = 'error';
      }
    }
  </script>
</body>
</html>
  `;

  // 返回 HTML 内容，告诉浏览器这是网页
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8', // 关键：声明内容是 HTML
      'Access-Control-Allow-Origin': '*'
    }
  });
}
