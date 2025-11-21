import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../store';
import { CouncilMode } from '../../shared/types';
import './ControlPanel.css';

const ControlPanel: React.FC = () => {
  const { councilState, clearSession } = useStore();

  if (!councilState) return null;

  return (
    <motion.div
      className="control-panel glass-dark"
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="panel-section">
        <h3>Council Configuration</h3>
        <div className="config-item">
          <label>Council Size</label>
          <span>{councilState.councilSize} members</span>
        </div>
        <div className="config-item">
          <label>Prime Architect</label>
          <span>{councilState.primeArchitect}</span>
        </div>
        <div className="config-item">
          <label>Refinement Cycles</label>
          <span>{councilState.maxRefinementCycles}</span>
        </div>
      </div>

      <div className="panel-section">
        <h3>Active Agents</h3>
        <div className="agents-list">
          {councilState.agents.map((agent) => (
            <div key={agent.id} className="agent-item">
              <div
                className="agent-color-marker"
                style={{ background: agent.color }}
              />
              <div className="agent-details">
                <div className="agent-item-name">{agent.name}</div>
                <div className="agent-item-archetype">{agent.archetype}</div>
                <div className="agent-item-model">{agent.model}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <h3>Available Modes</h3>
        <div className="modes-list">
          {Object.values(CouncilMode).map((mode) => (
            <div
              key={mode}
              className={`mode-item ${councilState.activeModes.includes(mode) ? 'active' : ''}`}
            >
              <span className="mode-icon">
                {mode === CouncilMode.DEBATE && '⚔️'}
                {mode === CouncilMode.RESEARCH && '🔬'}
                {mode === CouncilMode.BUILD && '🔨'}
                {mode === CouncilMode.AUDIT && '🔍'}
                {mode === CouncilMode.ORACLE && '🔮'}
                {mode === CouncilMode.GOD && '👁️'}
                {mode === CouncilMode.PREDICT && '📊'}
              </span>
              <span>{mode}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <button className="clear-button" onClick={clearSession}>
          Clear Session
        </button>
      </div>
    </motion.div>
  );
};

export default ControlPanel;
