import { create } from 'zustand';
import {
  CouncilState,
  CouncilMode,
  SessionMessage,
  CouncilResponse,
  UserQuery
} from '../shared/types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';

interface AppState {
  councilState: CouncilState | null;
  sessionMessages: SessionMessage[];
  currentResponse: CouncilResponse | null;
  isProcessing: boolean;
  ws: WebSocket | null;
  
  // Actions
  setCouncilState: (state: CouncilState) => void;
  addSessionMessage: (message: SessionMessage) => void;
  setCurrentResponse: (response: CouncilResponse | null) => void;
  setIsProcessing: (processing: boolean) => void;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  sendQuery: (content: string, modes: CouncilMode[]) => void;
  clearSession: () => void;
}

const useStore = create<AppState>((set, get) => ({
  councilState: null,
  sessionMessages: [],
  currentResponse: null,
  isProcessing: false,
  ws: null,

  setCouncilState: (state) => set({ councilState: state }),
  
  addSessionMessage: (message) => set((state) => ({
    sessionMessages: [...state.sessionMessages, message]
  })),
  
  setCurrentResponse: (response) => set({ currentResponse: response }),
  
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  
  connectWebSocket: () => {
    const ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'init':
          set({ councilState: data.payload });
          break;
        case 'phase':
          get().addSessionMessage(data.payload);
          break;
        case 'complete':
          set({ 
            currentResponse: data.payload,
            isProcessing: false 
          });
          break;
        case 'error':
          console.error('WebSocket error:', data.payload);
          set({ isProcessing: false });
          break;
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      set({ isProcessing: false });
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      set({ ws: null });
    };
    
    set({ ws });
  },
  
  disconnectWebSocket: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ ws: null });
    }
  },
  
  sendQuery: (content, modes) => {
    const { ws } = get();
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }
    
    set({ 
      isProcessing: true,
      sessionMessages: [],
      currentResponse: null 
    });
    
    const query: UserQuery = {
      content,
      modes,
      userId: 'user-1'
    };
    
    ws.send(JSON.stringify({
      type: 'query',
      payload: query
    }));
  },
  
  clearSession: () => set({
    sessionMessages: [],
    currentResponse: null,
    isProcessing: false
  })
}));

export default useStore;
