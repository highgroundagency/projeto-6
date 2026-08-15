import type { NextConfig } from 'next'

const emDesenvolvimento = process.env.NODE_ENV === 'development'

/**
 * CSP básica (§9). Notas honestas, registradas em docs/seguranca.md:
 * - `style-src 'unsafe-inline'` é exigido pelo Next/Tailwind em runtime.
 * - `script-src 'unsafe-inline'` cobre os scripts de bootstrap do App Router;
 *   uma CSP com nonce por requisição é o próximo passo, não o estado atual.
 * - `'unsafe-eval'` só existe em desenvolvimento (Fast Refresh).
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${emDesenvolvimento ? " 'unsafe-eval'" : ''}`,
  `connect-src 'self'${emDesenvolvimento ? ' ws: http://localhost:*' : ''}`,
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ')

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:caminho*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

export default nextConfig
