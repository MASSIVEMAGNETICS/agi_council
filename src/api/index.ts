/**
 * Enterprise API Entry Point
 * Main entry for the OmniForge Council Enterprise API Server
 */

import { ApiServer } from './ApiServer';

const server = new ApiServer({
  port: parseInt(process.env.PORT || '3001'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  enableCompression: true,
  enableHelmet: true,
  enableRateLimiting: true
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\nShutting down gracefully...');
  try {
    await server.stop();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default server;
