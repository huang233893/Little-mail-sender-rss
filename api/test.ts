// 极简测试 API，无任何依赖和复杂逻辑
export default async function handler(req: Request) {
  return new Response(JSON.stringify({ message: "API 正常" }), {
    headers: { "Content-Type": "application/json" }
  });
}
