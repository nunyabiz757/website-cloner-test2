import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// API route handler for /api/capture
app.post('/api/capture', async (req, res) => {
  try {
    // Dynamically import the capture handler
    const { default: captureHandler } = await import('./api/capture.js');

    // Call the handler with Express req/res
    await captureHandler(req, res);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// Handle client-side routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`📦 Serving static files from: ${join(__dirname, 'dist')}`);
  console.log(`🔌 API endpoint available at: /api/capture`);
});
