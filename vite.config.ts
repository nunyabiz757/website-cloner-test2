import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Security headers plugin
    {
      name: 'security-headers',
      configureServer(server) {
        server.middlewares.use((_req, res, next) => {
          // Content Security Policy
          res.setHeader(
            'Content-Security-Policy',
            [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline/eval needed for dev
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://api.ipify.org",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; ')
          );

          // X-Frame-Options
          res.setHeader('X-Frame-Options', 'DENY');

          // X-Content-Type-Options
          res.setHeader('X-Content-Type-Options', 'nosniff');

          // Referrer-Policy
          res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

          // Permissions-Policy
          res.setHeader(
            'Permissions-Policy',
            'geolocation=(), camera=(), microphone=(), payment=()'
          );

          // X-XSS-Protection (legacy browsers)
          res.setHeader('X-XSS-Protection', '1; mode=block');

          next();
        });
      },
    },
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    strictPort: false,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    },
  },
});
