import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SessionMessage } from '../../shared/types';
import AgentMessageCard from './AgentMessageCard';
import './PhaseDisplay.css';

interface PhaseDisplayProps {
  message: SessionMessage;
  index: number;
}

const PhaseDisplay: React.FC<PhaseDisplayProps> = ({ message, index }) => {
  const [expanded, setExpanded] = useState(true);

  const getPhaseTitle = (phase: SessionMessage['phase']): string => {
    const titles = {
      initial: '🎯 Initial Agent Responses',
      'cross-agent': '💬 Cross-Agent Analysis',
      debate: '⚔️ Debate & Refinement Cycles',
      synthesis: '🔮 Unified Synthesis',
      refinement: '🔄 Refinement Loop',
      final: '✅ Final Output'
    };
    return titles[phase];
  };

  const getPhaseColor = (phase: SessionMessage['phase']): string => {
    const colors = {
      initial: '#3b82f6',
      'cross-agent': '#8b5cf6',
      debate: '#ef4444',
      synthesis: '#10b981',
      refinement: '#f59e0b',
      final: '#ec4899'
    };
    return colors[phase];
  };

  return (
    <motion.div
      className="phase-display"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div
        className="phase-header"
        onClick={() => setExpanded(!expanded)}
        style={{ borderLeftColor: getPhaseColor(message.phase) }}
      >
        <span className="phase-title">{getPhaseTitle(message.phase)}</span>
        <motion.span
          className="expand-icon"
          animate={{ rotate: expanded ? 0 : -90 }}
        >
          ▼
        </motion.span>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="phase-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {message.agentMessages && (
              <div className="agent-messages">
                {message.agentMessages.map((msg, idx) => (
                  <AgentMessageCard key={idx} message={msg} index={idx} />
                ))}
              </div>
            )}

            {message.crossAgentComments && (
              <div className="cross-agent-comments">
                {message.crossAgentComments.map((comment, idx) => (
                  <div key={idx} className="comment-item">
                    <span className="comment-from">{comment.fromAgentName}</span>
                    <span className="comment-type">{comment.type}</span>
                    <span className="comment-to">{comment.toAgentName}</span>
                    <span className="comment-text">: {comment.comment}</span>
                  </div>
                ))}
              </div>
            )}

            {message.debateConflicts && (
              <div className="debate-conflicts">
                {message.debateConflicts.map((conflict, idx) => (
                  <div key={idx} className="conflict-item">
                    <h5>Topic: {conflict.topic}</h5>
                    <p className={conflict.resolved ? 'resolved' : 'unresolved'}>
                      {conflict.resolved ? `✓ ${conflict.resolution}` : '⏳ Ongoing'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {message.synthesis && (
              <div className="synthesis-output">
                <div className="synthesis-section">
                  <h5>Unified Conclusion</h5>
                  <p>{message.synthesis.unifiedConclusion}</p>
                </div>
                <div className="synthesis-section">
                  <h5>Action Plan</h5>
                  <ol>
                    {message.synthesis.actionPlan.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
                <div className="synthesis-section">
                  <h5>Risk Evaluation</h5>
                  <p>{message.synthesis.riskEvaluation}</p>
                </div>
                <div className="confidence-score">
                  Confidence: {message.synthesis.confidenceScore}%
                </div>
              </div>
            )}

            {message.predictiveOutput && (
              <div className="predictive-output">
                <h5>📊 Predictive Analysis</h5>
                <div className="probability-table">
                  {Object.entries(message.predictiveOutput.probabilityTable).map(([key, value]) => (
                    <div key={key} className="probability-row">
                      <span>{key}</span>
                      <div className="probability-bar">
                        <div 
                          className="probability-fill" 
                          style={{ width: `${value}%` }}
                        />
                        <span>{value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PhaseDisplay;
