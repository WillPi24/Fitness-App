/**
 * Helm Events Worker -- entry point.
 *
 * Handles:
 *   - scheduled (cron) event: triggers event collection from all sources
 *   - fetch event: serves the /api/events endpoint, returns 404 for everything else
 *     (Cloudflare Pages handles static files separately via routing rules)
 */

import { corsHeaders } from './lib/cors.js';

export default {
  async scheduled(event, env, ctx) {
    const { collectEvents } = await import('./collector.js');
    ctx.waitUntil(collectEvents(env));
  },

  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    // API route
    if (url.pathname === '/api/events') {
      const { handleEventsRequest } = await import('./api.js');
      return handleEventsRequest(request, env);
    }

    // Everything else: 404 (Pages serves static assets via its own routing)
    return new Response('Not Found', { status: 404 });
  },
};
