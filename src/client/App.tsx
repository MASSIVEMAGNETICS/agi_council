import { useEffect } from 'react';
import useStore from './store';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import ControlPanel from './components/ControlPanel';
import './App.css';

function App() {
  const { connectWebSocket, disconnectWebSocket } = useStore();

  useEffect(() => {
    connectWebSocket();
    return () => disconnectWebSocket();
  }, [connectWebSocket, disconnectWebSocket]);

  return (
    <div className="app">
      <Header />
      <div className="main-content">
        <ChatInterface />
        <ControlPanel />
      </div>
    </div>
  );
}

export default App;
