/**
 * Helm Events Worker -- entry point.
 *
 * Handles:
 *   - scheduled (cron) event: triggers event collection from all sources
 *   - fetch event:
 *       GET  /api/events           -> events API
 *       POST /api/admin/refresh    -> manual collector trigger (X-Admin-Token guarded)
 *   - 404 for everything else (Cloudflare Pages handles static assets)
 */

import { corsHeaders } from './lib/cors.js';

export default {
  async scheduled(event, env, ctx) {
    const { collectEvents } = await import('./collector.js');
    ctx.waitUntil(collectEvents(env));
  },

  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    if (url.pathname === '/api/events') {
      const { handleEventsRequest } = await import('./api.js');
      return handleEventsRequest(request, env);
    }

    if (url.pathname === '/api/admin/refresh' && request.method === 'POST') {
      return handleAdminRefresh(request, env);
    }

    return new Response('Not Found', { status: 404 });
  },
};

async function handleAdminRefresh(request, env) {
  const headers = {
    'Content-Type': 'application/json',
    ...corsHeaders(),
  };

  const token = request.headers.get('X-Admin-Token');
  if (!env.ADMIN_TOKEN || !token || token !== env.ADMIN_TOKEN) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers,
    });
  }

  const { collectEvents } = await import('./collector.js');
  await collectEvents(env);

  let counts = {};
  let byCountry = {};
  try {
    const metaRaw = await env.EVENTS_KV.get('meta:last-fetch');
    if (metaRaw) {
      const m = JSON.parse(metaRaw);
      counts = m.sourceCounts || {};
      byCountry = m.byCountry || {};
    }
  } catch {
    // ignore
  }

  return new Response(
    JSON.stringify({ ok: true, sourceCounts: counts, byCountry }),
    { status: 200, headers }
  );
}
