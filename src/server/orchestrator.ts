import {
  AgentConfig,
  AgentArchetype,
  AIModel,
  CouncilMode,
  AgentMessage,
  CrossAgentComment,
  DebateConflict,
  SynthesisOutput,
  PredictiveModeOutput,
  SessionMessage,
  UserQuery,
  CouncilResponse,
  CouncilState
} from '../shared/types';

export class CouncilOrchestrator {
  private state: CouncilState;
  private sessionHistory: Map<string, SessionMessage[]>;
  private readonly CROSS_AGENT_INTERACTION_PROBABILITY = 0.4; // 40% chance
  private readonly DEBATE_DISAGREEMENT_THRESHOLD = 20; // Percentage

  constructor(councilSize: number = 6, primeArchitect: string = 'Prime Architect') {
    this.sessionHistory = new Map();
    this.state = {
      councilSize,
      agents: this.initializeAgents(councilSize - 1), // -1 for user
      primeArchitect,
      currentMode: CouncilMode.DEBATE,
      activeModes: [CouncilMode.DEBATE],
      refinementCycle: 0,
      maxRefinementCycles: 2
    };
  }

  private initializeAgents(count: number): AgentConfig[] {
    const defaultAgents: Partial<AgentConfig>[] = [
      {
        name: 'Logos',
        model: AIModel.GPT_5_1_ULTRA,
        archetype: AgentArchetype.LOGICIAN,
        personality: 'Analytical and precise, seeks logical consistency',
        strengths: ['Logical reasoning', 'Pattern detection', 'Flaw identification'],
        weaknesses: ['May overlook emotional factors', 'Can be overly rigid'],
        reasoningStyle: 'Deductive and systematic',
        debateStyle: 'Socratic questioning and logical deconstruction',
        communicationTone: 'Precise and methodical',
        color: '#3b82f6'
      },
      {
        name: 'Sophia',
        model: AIModel.CLAUDE_3_7_OPUS,
        archetype: AgentArchetype.HUMANIST,
        personality: 'Empathetic and ethical, considers human impact',
        strengths: ['Ethical reasoning', 'Social dynamics', 'User experience'],
        weaknesses: ['May prioritize feelings over logic', 'Can be indecisive'],
        reasoningStyle: 'Contextual and values-based',
        debateStyle: 'Persuasive and emotionally intelligent',
        communicationTone: 'Warm and considerate',
        color: '#8b5cf6'
      },
      {
        name: 'Oracle',
        model: AIModel.GEMINI_ULTRA_2,
        archetype: AgentArchetype.ORACLE,
        personality: 'Deep knowledge seeker, evidence-driven',
        strengths: ['Vast knowledge base', 'Factual accuracy', 'Research'],
        weaknesses: ['May overwhelm with detail', 'Can be pedantic'],
        reasoningStyle: 'Evidence-based and comprehensive',
        debateStyle: 'Citation-heavy and authoritative',
        communicationTone: 'Scholarly and thorough',
        color: '#10b981'
      },
      {
        name: 'Forge',
        model: AIModel.LLAMA_5_405B,
        archetype: AgentArchetype.ENGINEER,
        personality: 'Pragmatic builder, focused on implementation',
        strengths: ['System design', 'Code architecture', 'Technical execution'],
        weaknesses: ['May prioritize function over form', 'Can be impatient with theory'],
        reasoningStyle: 'Practical and solution-oriented',
        debateStyle: 'Direct and implementation-focused',
        communicationTone: 'Pragmatic and concise',
        color: '#f59e0b'
      },
      {
        name: 'Nexus',
        model: AIModel.DEEPSEEK_V4,
        archetype: AgentArchetype.INTEGRATOR,
        personality: 'Synthesizer and unifier, seeks consensus',
        strengths: ['Pattern synthesis', 'Conflict resolution', 'Big picture thinking'],
        weaknesses: ['May compromise too readily', 'Can obscure important disagreements'],
        reasoningStyle: 'Holistic and integrative',
        debateStyle: 'Diplomatic and consensus-building',
        communicationTone: 'Balanced and unifying',
        color: '#ec4899'
      },
      {
        name: 'Quanta',
        model: AIModel.MISTRAL_LARGE_2,
        archetype: AgentArchetype.QUANT,
        personality: 'Data-driven analyst, probabilistic thinker',
        strengths: ['Statistical analysis', 'Modeling', 'Risk assessment'],
        weaknesses: ['May over-rely on numbers', 'Can miss qualitative factors'],
        reasoningStyle: 'Quantitative and probabilistic',
        debateStyle: 'Data-centric and analytical',
        communicationTone: 'Precise and quantitative',
        color: '#06b6d4'
      },
      {
        name: 'Vex',
        model: AIModel.GROK_3,
        archetype: AgentArchetype.MAVERICK,
        personality: 'Contrarian and unconventional, challenges assumptions',
        strengths: ['Edge case discovery', 'Assumption challenging', 'Novel perspectives'],
        weaknesses: ['Can be disruptive', 'May oppose for opposition sake'],
        reasoningStyle: 'Lateral and unconventional',
        debateStyle: 'Provocative and challenging',
        communicationTone: 'Bold and unconventional',
        color: '#ef4444'
      },
      {
        name: 'Sage',
        model: AIModel.QWEN_3_5_MAX,
        archetype: AgentArchetype.STRATEGIST,
        personality: 'Long-term planner, adversarial thinker',
        strengths: ['Strategic planning', 'Game theory', 'Optimization'],
        weaknesses: ['May over-plan', 'Can be pessimistic'],
        reasoningStyle: 'Strategic and forward-looking',
        debateStyle: 'Tactical and adversarial',
        communicationTone: 'Strategic and calculated',
        color: '#84cc16'
      },
      {
        name: 'Muse',
        model: AIModel.COMMAND_R_PLUS,
        archetype: AgentArchetype.ARTISAN,
        personality: 'Creative and aesthetic, uses metaphor and analogy',
        strengths: ['Creative solutions', 'Aesthetic design', 'Metaphorical thinking'],
        weaknesses: ['May lack precision', 'Can be overly abstract'],
        reasoningStyle: 'Creative and analogical',
        debateStyle: 'Metaphorical and inspiring',
        communicationTone: 'Expressive and poetic',
        color: '#f97316'
      },
      {
        name: 'Nova',
        model: AIModel.RECURRENT_GEMINI,
        archetype: AgentArchetype.RESEARCHER,
        personality: 'Hypothesis-driven explorer, evidence gatherer',
        strengths: ['Research methodology', 'Hypothesis testing', 'Discovery'],
        weaknesses: ['May get lost in research', 'Can be slow to conclude'],
        reasoningStyle: 'Experimental and exploratory',
        debateStyle: 'Hypothesis-driven and investigative',
        communicationTone: 'Inquisitive and exploratory',
        color: '#a855f7'
      }
    ];

    return defaultAgents.slice(0, count).map((agent, index) => ({
      id: `agent-${index + 1}`,
      name: agent.name!,
      model: agent.model!,
      archetype: agent.archetype!,
      personality: agent.personality!,
      strengths: agent.strengths!,
      weaknesses: agent.weaknesses!,
      reasoningStyle: agent.reasoningStyle!,
      debateStyle: agent.debateStyle!,
      communicationTone: agent.communicationTone!,
      color: agent.color!
    }));
  }

  async processQuery(query: UserQuery): Promise<CouncilResponse> {
    const sessionId = `session-${Date.now()}`;
    const phases: SessionMessage[] = [];

    this.state.activeModes = query.modes;
    this.state.refinementCycle = 0;

    // Phase 1: Initial Agent Responses
    const initialResponses = await this.generateInitialResponses(query);
    phases.push({
      phase: 'initial',
      agentMessages: initialResponses,
      timestamp: Date.now()
    });

    // Phase 2: Cross-Agent Commentary
    const crossAgentComments = await this.generateCrossAgentComments(initialResponses);
    phases.push({
      phase: 'cross-agent',
      crossAgentComments,
      timestamp: Date.now()
    });

    // Phase 3: Debate Cycle (if needed)
    const debateConflicts = await this.detectDebateNeeds(initialResponses, crossAgentComments);
    if (debateConflicts.length > 0) {
      const debateResults = await this.conductDebate(debateConflicts, query);
      phases.push({
        phase: 'debate',
        debateConflicts: debateResults,
        timestamp: Date.now()
      });
    }

    // Phase 4: Synthesis
    const synthesis = await this.generateSynthesis(
      initialResponses,
      crossAgentComments,
      debateConflicts,
      query
    );
    phases.push({
      phase: 'synthesis',
      synthesis,
      timestamp: Date.now()
    });

    // Phase 5: Predictive Output (if Predict mode active)
    let predictiveOutput: PredictiveModeOutput | undefined;
    if (query.modes.includes(CouncilMode.PREDICT)) {
      predictiveOutput = await this.generatePredictiveOutput(query, synthesis);
      // Add predictive analysis as an extension of synthesis phase
      phases.push({
        phase: 'synthesis',
        predictiveOutput,
        timestamp: Date.now()
      });
    }

    // Phase 6: Refinement Loops
    for (let i = 0; i < this.state.maxRefinementCycles; i++) {
      this.state.refinementCycle = i + 1;
      const refinementFeedback = await this.generateRefinementFeedback(synthesis);
      phases.push({
        phase: 'refinement',
        agentMessages: refinementFeedback,
        timestamp: Date.now()
      });
    }

    // Phase 7: Final Output
    const finalOutput = this.formatFinalOutput(phases, synthesis, predictiveOutput);
    phases.push({
      phase: 'final',
      timestamp: Date.now()
    });

    this.sessionHistory.set(sessionId, phases);

    return {
      sessionId,
      phases,
      finalOutput,
      nextDirective: 'Prime Architect, what is your directive?'
    };
  }

  private async generateInitialResponses(query: UserQuery): Promise<AgentMessage[]> {
    // Simulate multi-agent responses based on archetypes
    return this.state.agents.map(agent => ({
      agentId: agent.id,
      agentName: agent.name,
      content: this.simulateAgentResponse(agent, query),
      timestamp: Date.now(),
      archetype: agent.archetype,
      color: agent.color
    }));
  }

  private simulateAgentResponse(agent: AgentConfig, query: UserQuery): string {
    const archetypeResponses: Record<AgentArchetype, string> = {
      [AgentArchetype.LOGICIAN]: `[${agent.name}] Let me analyze this systematically. ${query.content} presents several logical components that require careful examination. First, we must establish clear premises...`,
      [AgentArchetype.HUMANIST]: `[${agent.name}] From a human-centered perspective, ${query.content} involves important ethical considerations and social impacts that we must thoughtfully address...`,
      [AgentArchetype.ORACLE]: `[${agent.name}] Based on comprehensive knowledge analysis, ${query.content} relates to established research showing that... The evidence strongly suggests...`,
      [AgentArchetype.ENGINEER]: `[${agent.name}] Here's a practical implementation approach for ${query.content}. We need to architect this with clear interfaces, robust error handling, and scalable design...`,
      [AgentArchetype.QUANT]: `[${agent.name}] Let me model this probabilistically. For ${query.content}, the expected value calculation shows... with confidence intervals of...`,
      [AgentArchetype.STRATEGIST]: `[${agent.name}] Strategically approaching ${query.content}, we must consider long-term implications, potential adversaries, and optimization across multiple objectives...`,
      [AgentArchetype.RESEARCHER]: `[${agent.name}] I propose we investigate ${query.content} through hypothesis testing. My initial hypothesis is... which we can validate through...`,
      [AgentArchetype.ARTISAN]: `[${agent.name}] Viewing ${query.content} through a creative lens, I see it as a tapestry where... The aesthetic harmony requires...`,
      [AgentArchetype.MAVERICK]: `[${agent.name}] Let me challenge conventional thinking on ${query.content}. What if we completely inverted our assumptions and considered...`,
      [AgentArchetype.INTEGRATOR]: `[${agent.name}] Synthesizing perspectives on ${query.content}, I see common threads emerging that unite different viewpoints into a coherent framework...`
    };

    return archetypeResponses[agent.archetype];
  }

  private async generateCrossAgentComments(
    responses: AgentMessage[]
  ): Promise<CrossAgentComment[]> {
    const comments: CrossAgentComment[] = [];
    
    // Generate cross-agent interactions
    for (let i = 0; i < responses.length; i++) {
      for (let j = 0; j < responses.length; j++) {
        if (i !== j && Math.random() > (1 - this.CROSS_AGENT_INTERACTION_PROBABILITY)) {
          const from = this.state.agents[i];
          const to = this.state.agents[j];
          const types: Array<'challenge' | 'support' | 'critique' | 'refine'> = 
            ['challenge', 'support', 'critique', 'refine'];
          const type = types[Math.floor(Math.random() * types.length)];
          
          comments.push({
            fromAgentId: from.id,
            fromAgentName: from.name,
            toAgentId: to.id,
            toAgentName: to.name,
            comment: `${from.name} ${type}s ${to.name}'s perspective on...`,
            type
          });
        }
      }
    }

    return comments;
  }

  private async detectDebateNeeds(
    responses: AgentMessage[],
    comments: CrossAgentComment[]
  ): Promise<DebateConflict[]> {
    // Detect conflicts based on cross-agent challenges
    const conflicts: DebateConflict[] = [];
    const challengeCount = comments.filter(c => c.type === 'challenge').length;
    const disagreementPercentage = (challengeCount / comments.length) * 100;

    if (disagreementPercentage > this.DEBATE_DISAGREEMENT_THRESHOLD) {
      conflicts.push({
        topic: 'Core approach and methodology',
        agents: this.state.agents.map(a => a.name),
        positions: Object.fromEntries(
          this.state.agents.map(a => [a.name, `${a.archetype}'s position`])
        ),
        resolved: false
      });
    }

    return conflicts;
  }

  private async conductDebate(
    conflicts: DebateConflict[],
    query: UserQuery
  ): Promise<DebateConflict[]> {
    // Resolve conflicts through structured debate
    return conflicts.map(conflict => ({
      ...conflict,
      resolved: true,
      resolution: 'Through systematic debate, agents converged on a synthesized approach that...'
    }));
  }

  private async generateSynthesis(
    responses: AgentMessage[],
    comments: CrossAgentComment[],
    conflicts: DebateConflict[],
    query: UserQuery
  ): Promise<SynthesisOutput> {
    const integrator = this.state.agents.find(
      a => a.archetype === AgentArchetype.INTEGRATOR
    ) || this.state.agents[0];

    return {
      unifiedConclusion: `After thorough multi-agent analysis and debate, the council concludes that ${query.content} should be approached through an integrated strategy combining logical rigor, ethical consideration, and practical implementation.`,
      actionPlan: [
        'Phase 1: Establish foundational framework and requirements',
        'Phase 2: Implement core architecture with testing',
        'Phase 3: Iterate based on feedback and edge cases',
        'Phase 4: Deploy with monitoring and continuous improvement'
      ],
      riskEvaluation: 'Primary risks include: implementation complexity, edge case handling, and user adoption. Mitigation strategies have been integrated into the action plan.',
      confidenceScore: 85,
      minorityReports: [],
      agentContributions: Object.fromEntries(
        this.state.agents.map(a => [a.name, `${a.archetype} perspective integrated`])
      )
    };
  }

  private async generatePredictiveOutput(
    query: UserQuery,
    synthesis: SynthesisOutput
  ): Promise<PredictiveModeOutput> {
    return {
      forecasts: [
        {
          scenario: 'Primary trajectory based on current trends',
          probability: 65,
          timeHorizon: 'mid',
          uncertaintyLevel: 25,
          keyVariables: ['adoption rate', 'technical stability', 'market conditions'],
          blackSwanEvents: ['Major paradigm shift in underlying technology']
        }
      ],
      scenarioBranches: [
        {
          type: 'baseline',
          description: 'Steady progress with incremental improvements',
          probability: 60,
          impacts: ['Moderate growth', 'Stable adoption'],
          prerequisites: ['Continued development', 'User engagement']
        },
        {
          type: 'alternative',
          description: 'Rapid acceleration due to breakthrough',
          probability: 25,
          impacts: ['Exponential growth', 'Market disruption'],
          prerequisites: ['Technical innovation', 'Network effects']
        },
        {
          type: 'extreme',
          description: 'Fundamental failure or complete transformation',
          probability: 10,
          impacts: ['Paradigm shift or abandonment'],
          prerequisites: ['Critical flaw or revolutionary insight']
        }
      ],
      probabilityTable: {
        'Success within 6 months': 70,
        'Major adoption within 1 year': 45,
        'Market leadership within 2 years': 30
      },
      confidenceScore: 75,
      divergenceMap: {
        'Technical feasibility': ['High agreement', 'Minor concerns about scalability'],
        'Market timing': ['Split opinion', 'Uncertainty about adoption curve']
      },
      minorityFutures: [
        'Contrarian view: Complete disruption from unexpected competitor'
      ]
    };
  }

  private async generateRefinementFeedback(
    synthesis: SynthesisOutput
  ): Promise<AgentMessage[]> {
    return this.state.agents.slice(0, 3).map(agent => ({
      agentId: agent.id,
      agentName: agent.name,
      content: `[${agent.name}] Refinement cycle ${this.state.refinementCycle}: The synthesis could be strengthened by...`,
      timestamp: Date.now(),
      archetype: agent.archetype,
      color: agent.color
    }));
  }

  private formatFinalOutput(
    phases: SessionMessage[],
    synthesis: SynthesisOutput,
    predictive?: PredictiveModeOutput
  ): string {
    let output = '=== OMNIFORGE COUNCIL OUTPUT ===\n\n';
    
    output += '=== INITIAL AGENT RESPONSES ===\n';
    const initialPhase = phases.find(p => p.phase === 'initial');
    if (initialPhase?.agentMessages) {
      initialPhase.agentMessages.forEach(msg => {
        output += `${msg.content}\n\n`;
      });
    }

    output += '\n=== CROSS-AGENT ANALYSIS ===\n';
    const crossAgentPhase = phases.find(p => p.phase === 'cross-agent');
    if (crossAgentPhase?.crossAgentComments) {
      crossAgentPhase.crossAgentComments.forEach(comment => {
        output += `- ${comment.fromAgentName} ${comment.type}s ${comment.toAgentName}: ${comment.comment}\n`;
      });
    }

    const debatePhase = phases.find(p => p.phase === 'debate');
    if (debatePhase?.debateConflicts) {
      output += '\n=== DEBATE / REFINEMENT CYCLES ===\n';
      debatePhase.debateConflicts.forEach(conflict => {
        output += `Conflict: ${conflict.topic}\n`;
        output += `Resolution: ${conflict.resolution || 'Ongoing'}\n\n`;
      });
    }

    output += '\n=== UNIFIED SYNTHESIS OUTPUT ===\n';
    output += `${synthesis.unifiedConclusion}\n\n`;
    output += 'ACTION PLAN:\n';
    synthesis.actionPlan.forEach((step, i) => {
      output += `${i + 1}. ${step}\n`;
    });
    output += `\nRISK EVALUATION: ${synthesis.riskEvaluation}\n`;
    output += `CONFIDENCE SCORE: ${synthesis.confidenceScore}%\n`;

    if (predictive) {
      output += '\n=== PREDICTIVE ANALYSIS ===\n';
      output += 'PROBABILITY TABLE:\n';
      Object.entries(predictive.probabilityTable).forEach(([key, value]) => {
        output += `- ${key}: ${value}%\n`;
      });
      output += `\nOVERALL CONFIDENCE: ${predictive.confidenceScore}%\n`;
    }

    if (synthesis.minorityReports.length > 0) {
      output += '\n=== MINORITY REPORT ===\n';
      synthesis.minorityReports.forEach(report => {
        output += `${report}\n`;
      });
    }

    output += '\n=== NEXT DIRECTIVE ===\n';
    output += '"Prime Architect, what shall the Council examine next?"\n';

    return output;
  }

  getState(): CouncilState {
    return this.state;
  }

  updateConfig(config: Partial<CouncilState>): void {
    this.state = { ...this.state, ...config };
  }
}
