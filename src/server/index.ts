import express, { Request, Response } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { CouncilOrchestrator } from './orchestrator';
import { UserQuery, CouncilMode } from '../shared/types';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Council Orchestrator
const orchestrator = new CouncilOrchestrator(6, 'Prime Architect');

// REST API Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/council/state', (req: Request, res: Response) => {
  res.json(orchestrator.getState());
});

app.post('/api/council/query', async (req: Request, res: Response) => {
  try {
    const query: UserQuery = req.body;
    const response = await orchestrator.processQuery(query);
    res.json(response);
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

app.post('/api/council/config', (req: Request, res: Response) => {
  try {
    orchestrator.updateConfig(req.body);
    res.json({ success: true, state: orchestrator.getState() });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

// Create HTTP server
const server = createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  console.log('WebSocket client connected');

  ws.on('message', async (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'query') {
        const query: UserQuery = data.payload;
        const response = await orchestrator.processQuery(query);
        
        // Send response phases progressively
        response.phases.forEach((phase, index) => {
          setTimeout(() => {
            ws.send(JSON.stringify({
              type: 'phase',
              payload: phase
            }));
          }, index * 500); // Stagger phase delivery for animation
        });

        // Send final response
        setTimeout(() => {
          ws.send(JSON.stringify({
            type: 'complete',
            payload: response
          }));
        }, response.phases.length * 500 + 500);
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Error processing message' }
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });

  // Send initial state
  ws.send(JSON.stringify({
    type: 'init',
    payload: orchestrator.getState()
  }));
});

server.listen(port, () => {
  console.log(`🚀 OmniForge Council Server running on port ${port}`);
  console.log(`📡 WebSocket server available at ws://localhost:${port}/ws`);
  console.log(`🎯 API available at http://localhost:${port}/api`);
});
