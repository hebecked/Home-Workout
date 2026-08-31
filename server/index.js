/* global Headers, Request, Response */

const withSecurityHeaders = (response) => {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
};

export default {
  async fetch(request, env) {
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404 || request.method !== 'GET') return withSecurityHeaders(asset);

    const accept = request.headers.get('Accept') ?? '';
    if (!accept.includes('text/html')) return withSecurityHeaders(asset);

    const fallbackUrl = new URL('/index.html', request.url);
    const fallback = await env.ASSETS.fetch(new Request(fallbackUrl, request));
    return withSecurityHeaders(fallback);
  }
};
