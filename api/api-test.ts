export default async function handler() {
  return new Response(
    JSON.stringify({
      message: 'API服务运行正常',
      timestamp: new Date().toISOString(),
      database: 'Vercel PostgreSQL'
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}