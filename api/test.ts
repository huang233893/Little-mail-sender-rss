export default async function handler() {
  return new Response(
    JSON.stringify({
      message: 'API正常运行',
      time: new Date().toISOString(),
      database: 'Vercel PostgreSQL'
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}