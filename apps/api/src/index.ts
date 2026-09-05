import type { HealthResponse } from '../../../packages/contracts/src/health';

export default {
  async fetch(request, env): Promise<Response> {
    const headers = { 'Cache-Control': 'no-store' };
    if (new URL(request.url).pathname !== '/api/health') {
      return Response.json({ error: 'not_found' }, { status: 404, headers });
    }
    if (request.method !== 'GET') {
      return Response.json({ error: 'method_not_allowed' }, { status: 405, headers: { ...headers, Allow: 'GET' } });
    }
    try {
      const row = await env.DB.prepare('SELECT version FROM poc_schema WHERE id = 1').first<{ version: number }>();
      if (row?.version !== 1) throw new Error('Schema unavailable');
      const result: HealthResponse = { status: 'ok', database: 'ok', schemaVersion: 1 };
      return Response.json(result, { headers });
    } catch {
      console.error(JSON.stringify({ event: 'health_check_failed', dependency: 'D1' }));
      return Response.json({ error: 'database_unavailable' }, { status: 503, headers });
    }
  },
} satisfies ExportedHandler<Env>;
