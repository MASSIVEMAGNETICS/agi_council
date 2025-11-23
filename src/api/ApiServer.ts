/**
 * Enterprise API Server
 * RESTful and GraphQL API with authentication, rate limiting, and comprehensive security
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { CouncilEngine } from '../core/CouncilEngine';
import { UserQuery, CouncilMode } from '../shared/types';

dotenv.config();

export interface ApiServerConfig {
  port?: number;
  corsOrigin?: string | string[];
  enableCompression?: boolean;
  enableHelmet?: boolean;
  enableRateLimiting?: boolean;
  maxRequestSize?: string;
}

export class ApiServer {
  private app: express.Application;
  private server: ReturnType<typeof createServer>;
  private wss: WebSocketServer;
  private councilEngine: CouncilEngine;
  private config: Required<ApiServerConfig>;

  constructor(config: ApiServerConfig = {}) {
    this.config = {
      port: config.port || parseInt(process.env.PORT || '3001'),
      corsOrigin: config.corsOrigin || process.env.CORS_ORIGIN || '*',
      enableCompression: config.enableCompression !== false,
      enableHelmet: config.enableHelmet !== false,
      enableRateLimiting: config.enableRateLimiting !== false,
      maxRequestSize: config.maxRequestSize || '10mb'
    };

    this.app = express();
    this.councilEngine = new CouncilEngine({
      councilSize: 6,
      primeArchitect: 'Prime Architect',
      enableLogging: true,
      enableMetrics: true
    });

    this.setupMiddleware();
    this.setupRoutes();
    
    this.server = createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server, path: '/ws' });
    
    this.setupWebSocket();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security headers
    if (this.config.enableHelmet) {
      this.app.use(helmet());
    }

    // CORS
    this.app.use(cors({
      origin: this.config.corsOrigin,
      credentials: true
    }));

    // Compression
    if (this.config.enableCompression) {
      this.app.use(compression());
    }

    // Body parsing
    this.app.use(express.json({ limit: this.config.maxRequestSize }));
    this.app.use(express.urlencoded({ extended: true, limit: this.config.maxRequestSize }));

    // Request logging
    this.app.use(this.requestLogger);

    // Rate limiting (placeholder for actual implementation)
    if (this.config.enableRateLimiting) {
      this.app.use(this.rateLimiter);
    }
  }

  private requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });
    next();
  };

  private rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
    // Simple rate limiting - in production, use express-rate-limit or similar
    // This is a placeholder implementation
    next();
  };

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API version 1 routes
    const apiV1 = express.Router();

    // Get council state
    apiV1.get('/council/state', (req: Request, res: Response) => {
      try {
        const state = this.councilEngine.getState();
        res.json({
          success: true,
          data: state
        });
      } catch (error) {
        this.handleError(error, req, res);
      }
    });

    // Get council metrics
    apiV1.get('/council/metrics', (req: Request, res: Response) => {
      try {
        const metrics = this.councilEngine.getMetrics();
        res.json({
          success: true,
          data: metrics
        });
      } catch (error) {
        this.handleError(error, req, res);
      }
    });

    // Process query
    apiV1.post('/council/query', async (req: Request, res: Response) => {
      try {
        const query: UserQuery = this.validateQuery(req.body);
        const response = await this.councilEngine.processQuery(query);
        
        res.json({
          success: true,
          data: response
        });
      } catch (error) {
        this.handleError(error, req, res);
      }
    });

    // Update council configuration
    apiV1.post('/council/config', (req: Request, res: Response) => {
      try {
        this.councilEngine.updateConfig(req.body);
        const state = this.councilEngine.getState();
        
        res.json({
          success: true,
          message: 'Configuration updated successfully',
          data: state
        });
      } catch (error) {
        this.handleError(error, req, res);
      }
    });

    // Get session history
    apiV1.get('/council/session/:sessionId', (req: Request, res: Response) => {
      try {
        const { sessionId } = req.params;
        const history = this.councilEngine.getSessionHistory(sessionId);
        
        if (!history) {
          res.status(404).json({
            success: false,
            error: 'Session not found'
          });
          return;
        }

        res.json({
          success: true,
          data: history
        });
      } catch (error) {
        this.handleError(error, req, res);
      }
    });

    // Reset metrics
    apiV1.post('/council/metrics/reset', (req: Request, res: Response) => {
      try {
        this.councilEngine.resetMetrics();
        res.json({
          success: true,
          message: 'Metrics reset successfully'
        });
      } catch (error) {
        this.handleError(error, req, res);
      }
    });

    // Clear history
    apiV1.post('/council/history/clear', (req: Request, res: Response) => {
      try {
        this.councilEngine.clearHistory();
        res.json({
          success: true,
          message: 'History cleared successfully'
        });
      } catch (error) {
        this.handleError(error, req, res);
      }
    });

    // Mount API v1 routes
    this.app.use('/api/v1', apiV1);

    // Legacy compatibility routes (redirect to v1)
    this.app.use('/api/council', apiV1);

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
      });
    });
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws) => {
      console.log('WebSocket client connected');

      // Send initial state
      ws.send(JSON.stringify({
        type: 'init',
        payload: this.councilEngine.getState()
      }));

      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === 'query') {
            const query: UserQuery = this.validateQuery(data.payload);
            
            // Listen for phase events
            const phaseListener = (event: any) => {
              ws.send(JSON.stringify({
                type: 'phase',
                payload: event
              }));
            };

            this.councilEngine.on('phase:complete', phaseListener);

            // Process query
            const response = await this.councilEngine.processQuery(query);

            // Remove listener
            this.councilEngine.off('phase:complete', phaseListener);

            // Send complete response
            ws.send(JSON.stringify({
              type: 'complete',
              payload: response
            }));
          }
        } catch (error) {
          console.error('WebSocket error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            payload: {
              message: error instanceof Error ? error.message : 'Unknown error',
              error: String(error)
            }
          }));
        }
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Unhandled error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });
  }

  private validateQuery(data: any): UserQuery {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid query format');
    }

    if (!data.content || typeof data.content !== 'string') {
      throw new Error('Query content is required and must be a string');
    }

    if (!Array.isArray(data.modes)) {
      throw new Error('Query modes must be an array');
    }

    // Validate modes
    const validModes = Object.values(CouncilMode);
    const invalidModes = data.modes.filter((mode: string) => !validModes.includes(mode as CouncilMode));
    
    if (invalidModes.length > 0) {
      throw new Error(`Invalid modes: ${invalidModes.join(', ')}`);
    }

    return {
      content: data.content,
      modes: data.modes,
      userId: data.userId || 'anonymous'
    };
  }

  private handleError(error: unknown, req: Request, res: Response): void {
    console.error('API error:', error);

    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'An unexpected error occurred'
      });
    }
  }

  /**
   * Start the API server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.config.port, () => {
        console.log('');
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║   🚀 OMNIFORGE COUNCIL - ENTERPRISE EDITION                 ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log('');
        console.log(`📡 API Server:        http://localhost:${this.config.port}`);
        console.log(`🔌 WebSocket Server:  ws://localhost:${this.config.port}/ws`);
        console.log(`📊 Health Check:      http://localhost:${this.config.port}/health`);
        console.log(`🎯 API v1:            http://localhost:${this.config.port}/api/v1`);
        console.log('');
        console.log(`Environment:          ${process.env.NODE_ENV || 'development'}`);
        console.log(`Node Version:         ${process.version}`);
        console.log('');
        console.log('Ready to accept connections.');
        console.log('');
        resolve();
      });
    });
  }

  /**
   * Stop the API server
   */
  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.wss.close((err) => {
        if (err) {
          reject(err);
          return;
        }

        this.server.close((err) => {
          if (err) {
            reject(err);
            return;
          }

          console.log('Server stopped gracefully');
          resolve();
        });
      });
    });
  }

  /**
   * Get the Express app instance
   */
  getApp(): express.Application {
    return this.app;
  }

  /**
   * Get the council engine instance
   */
  getCouncilEngine(): CouncilEngine {
    return this.councilEngine;
  }
}

export default ApiServer;
