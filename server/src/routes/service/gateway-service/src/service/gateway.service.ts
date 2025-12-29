import type { BodyInit } from 'bun';
import { findServiceUrl } from '../config/routes.config';

export class GatewayService {
  private timeout: number = 30000; // 30 seconds default timeout

  constructor(timeout: number = 30000) {
    this.timeout = timeout;
  }

  async proxyRequest(
    path: string,
    method: string,
    headers: Record<string, string | undefined>,
    body?: BodyInit | null,
  ): Promise<Response> {
    const serviceInfo = findServiceUrl(path);

    if (!serviceInfo) {
      return new Response(
        JSON.stringify({ error: 'Service not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const { url: serviceUrl, prefix } = serviceInfo;

    // Strip the prefix from the path when forwarding to the service
    // e.g., /api/accounts/users -> /users
    const targetPath = path.replace(prefix, '') || '/';

    // Construct the full URL for the target service
    const targetUrl = `${serviceUrl}${targetPath}`;

    // Prepare headers (remove host header, add/update others as needed)
    const proxyHeaders: HeadersInit = {};
    Object.entries(headers).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      // Remove headers that shouldn't be forwarded
      if (
        lowerKey !== 'host' &&
        lowerKey !== 'connection' &&
        value
      ) {
        proxyHeaders[key] = value;
      }
    });

    // Add gateway headers
    proxyHeaders['x-forwarded-by'] = 'gateway';
    proxyHeaders['x-forwarded-for'] =
      headers['x-forwarded-for'] ||
      headers['x-real-ip'] ||
      'unknown';
    proxyHeaders['x-forwarded-proto'] =
      headers['x-forwarded-proto'] || 'http';

    // Make the request to the target service with timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.timeout,
      );

      const response = await fetch(targetUrl, {
        method,
        headers: proxyHeaders,
        body: body || undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Get response body
      const responseBody = await response.text();

      // Copy response headers and add gateway headers
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('x-gateway-upstream', serviceUrl);
      responseHeaders.set('x-gateway-original-path', path);

      // Return response with same status and headers
      return new Response(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      const isTimeout =
        error instanceof Error &&
        error.name === 'AbortError';

      return new Response(
        JSON.stringify({
          error: isTimeout
            ? 'Gateway Timeout'
            : 'Bad Gateway',
          message: isTimeout
            ? 'The upstream service did not respond in time'
            : error instanceof Error
              ? error.message
              : 'Unknown error',
          timestamp: new Date().toISOString(),
        }),
        {
          status: isTimeout ? 504 : 502,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }
}
