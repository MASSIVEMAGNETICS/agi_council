// Agent Archetypes
export enum AgentArchetype {
  LOGICIAN = 'Logician',
  HUMANIST = 'Humanist',
  ORACLE = 'Oracle',
  ENGINEER = 'Engineer',
  QUANT = 'Quant',
  STRATEGIST = 'Strategist',
  RESEARCHER = 'Researcher',
  ARTISAN = 'Artisan',
  MAVERICK = 'Maverick',
  INTEGRATOR = 'Integrator'
}

// Available AI Models
export enum AIModel {
  GPT_5_1_ULTRA = 'GPT-5.1 Ultra',
  CLAUDE_3_7_OPUS = 'Claude 3.7 Opus',
  GEMINI_ULTRA_2 = 'Gemini Ultra 2',
  LLAMA_5_405B = 'Llama 5 405B',
  DEEPSEEK_V4 = 'DeepSeek V4',
  MISTRAL_LARGE_2 = 'Mistral Large 2',
  QWEN_3_5_MAX = 'Qwen 3.5 Max',
  COMMAND_R_PLUS = 'Command R+',
  GROK_3 = 'Grok 3',
  RECURRENT_GEMINI = 'RecurrentGemini Experimental'
}

// Council Modes
export enum CouncilMode {
  DEBATE = 'Debate',
  RESEARCH = 'Research',
  BUILD = 'Build',
  AUDIT = 'Audit',
  ORACLE = 'Oracle',
  GOD = 'God',
  PREDICT = 'Predict'
}

// Agent Configuration
export interface AgentConfig {
  id: string;
  name: string;
  model: AIModel;
  archetype: AgentArchetype;
  personality: string;
  strengths: string[];
  weaknesses: string[];
  reasoningStyle: string;
  debateStyle: string;
  communicationTone: string;
  color: string; // For UI identification
}

// Message Types
export interface AgentMessage {
  agentId: string;
  agentName: string;
  content: string;
  timestamp: number;
  archetype: AgentArchetype;
  color: string;
}

export interface CrossAgentComment {
  fromAgentId: string;
  fromAgentName: string;
  toAgentId: string;
  toAgentName: string;
  comment: string;
  type: 'challenge' | 'support' | 'critique' | 'refine';
}

// Predict Mode Structures
export interface PredictionForecast {
  scenario: string;
  probability: number; // 0-100
  timeHorizon: 'short' | 'mid' | 'long';
  uncertaintyLevel: number; // 0-100
  keyVariables: string[];
  blackSwanEvents: string[];
}

export interface ScenarioBranch {
  type: 'baseline' | 'alternative' | 'extreme' | 'counterfactual';
  description: string;
  probability: number;
  impacts: string[];
  prerequisites: string[];
}

export interface PredictiveModeOutput {
  forecasts: PredictionForecast[];
  scenarioBranches: ScenarioBranch[];
  probabilityTable: Record<string, number>;
  confidenceScore: number;
  divergenceMap: Record<string, string[]>;
  minorityFutures: string[];
}

// Debate Structures
export interface DebateConflict {
  topic: string;
  agents: string[];
  positions: Record<string, string>;
  resolved: boolean;
  resolution?: string;
}

// Synthesis Output
export interface SynthesisOutput {
  unifiedConclusion: string;
  actionPlan: string[];
  riskEvaluation: string;
  confidenceScore: number;
  minorityReports: string[];
  agentContributions: Record<string, string>;
}

// Council State
export interface CouncilState {
  councilSize: number;
  agents: AgentConfig[];
  primeArchitect: string; // User name
  currentMode: CouncilMode;
  activeModes: CouncilMode[];
  refinementCycle: number;
  maxRefinementCycles: number;
}

// Session Message
export interface SessionMessage {
  phase: 'initial' | 'cross-agent' | 'debate' | 'synthesis' | 'refinement' | 'final';
  agentMessages?: AgentMessage[];
  crossAgentComments?: CrossAgentComment[];
  debateConflicts?: DebateConflict[];
  synthesis?: SynthesisOutput;
  predictiveOutput?: PredictiveModeOutput;
  timestamp: number;
}

// User Query
export interface UserQuery {
  content: string;
  modes: CouncilMode[];
  userId: string;
}

// Council Response
export interface CouncilResponse {
  sessionId: string;
  phases: SessionMessage[];
  finalOutput: string;
  nextDirective: string;
}
