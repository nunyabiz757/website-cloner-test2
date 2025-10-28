import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Website Cloner Pro server...');
console.log('📁 Working directory:', __dirname);
console.log('📦 Dist directory:', join(__dirname, 'dist'));

// CORS middleware - allow requests from Vercel frontend
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://website-cloner-test2.vercel.app',
    'https://website-cloner-test2-git-main-saas-projects-projects.vercel.app',
    // Add any other Vercel deployment URLs
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || origin?.includes('.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Parse JSON bodies
app.use(express.json());

// Health check endpoints (must be BEFORE static middleware)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Website Cloner Pro API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API route handler for /api/capture
app.post('/api/capture', async (req, res) => {
  try {
    console.log('📥 Received capture request for:', req.body?.url);

    // Dynamically import the capture handler
    const { default: captureHandler } = await import('./api/capture.js');

    // Call the handler with Express req/res
    await captureHandler(req, res);
  } catch (error) {
    console.error('❌ API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Serve static files from the dist directory
// This will serve index.html for '/' automatically
app.use(express.static(join(__dirname, 'dist')));

// Handle client-side routing - serve index.html for any routes
// that didn't match static files or API endpoints
app.use((req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
    console.log('📄 Serving SPA for route:', req.path);
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('✅ Server successfully started!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌐 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📦 Serving static files from: ${join(__dirname, 'dist')}`);
  console.log(`🔌 API endpoint: POST /api/capture`);
  console.log(`💚 Health check: GET /health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});
