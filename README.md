# OmniForge Multi-LLM Council

A self-optimizing, cross-reasoning, multi-agent intelligence engine composed of multiple AI models working together through debate, collaboration, and synthesis.

## 🌟 Features

### Multi-Agent Architecture
- **User + 4-10 AI agents** (default: user + 5 AI models)
- Each agent has unique identity, personality, and cognition style
- Cross-agent communication and debate
- Recursive refinement cycles
- Epistemic diversity through agent archetypes

### Agent Archetypes

1. **Logician** - Logic, structure, flaw detection
2. **Humanist** - Social, psychological, ethical reasoning
3. **Oracle** - Deep knowledge, evidence, factuality
4. **Engineer** - Code, architecture, system design
5. **Quant** - Math, statistics, modeling
6. **Strategist** - Planning, optimization, adversarial thinking
7. **Researcher** - Discovery, evidence gathering, hypothesis testing
8. **Artisan** - Creativity, aesthetics, metaphor
9. **Maverick** - Contrarian, edge-case explorer
10. **Integrator** - Synthesizes unified conclusions

### Operational Modes

- **Debate Mode** - Adversarial truth-seeking, strong counterarguments
- **Research Mode** - Collaborative fact-finding, knowledge synthesis
- **Build Mode** - Creates code, systems, architectures, documents
- **Audit Mode** - Error detection, logical validation, risk analysis
- **Oracle Mode** - Maximum reasoning depth with hidden chain-of-thought
- **God Mode** - Full chain-of-thought revealed; unrestricted meta-analysis
- **Predict Mode** - Future simulation, probability forecasting, scenario branching

### Council Interaction Pipeline

Every user message triggers:

1. **Initial Agent Responses** - Each agent responds from their archetype
2. **Cross-Agent Commentary** - Agents challenge, support, critique, refine
3. **Debate Cycle** - Triggered automatically if disagreement > 20%
4. **Synthesis Phase** - Unified conclusion with action plan and risk evaluation
5. **Recursive Refinement Loop** - 2+ cycles to optimize output
6. **Final Output** - Polished, multi-perspective result

### Predict Mode Capabilities

When Predict Mode is active:
- Forecasts with probability estimates (0-100%)
- Time horizons (short/mid/long)
- Uncertainty quantification
- Black Swan event identification
- Scenario branching (baseline, alternative, extreme, counterfactual)
- Unified predictive maps with confidence scores
- Multi-agent consensus with minority futures

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/MASSIVEMAGNETICS/agi_council.git
cd agi_council

# Install dependencies
npm install

# Build the project
npm run build
```

### Development

```bash
# Run in development mode (starts both server and client)
npm run dev

# Or run separately
npm run dev:server  # Server on port 3001
npm run dev:client  # Client on port 3000
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🎯 Usage

1. **Access the Interface**: Open http://localhost:3000 in your browser
2. **Select Modes**: Choose one or more operational modes (Debate, Research, Build, etc.)
3. **Enter Directive**: Type your question or task in the input field
4. **Observe Council**: Watch agents respond, debate, and synthesize
5. **Review Output**: Examine the unified conclusion and action plan

### Example Queries

```
"Design a scalable microservices architecture for an e-commerce platform"
Modes: Build, Audit, Strategist

"Predict the future of artificial general intelligence in the next 10 years"
Modes: Predict, Research, Oracle

"What are the ethical implications of autonomous AI systems?"
Modes: Debate, Humanist, Oracle
```

## 🏗️ Architecture

### Backend (Node.js + Express + WebSocket)
- `src/server/index.ts` - Express server with WebSocket support
- `src/server/orchestrator.ts` - Council orchestration engine
- Real-time message streaming
- Multi-agent coordination

### Frontend (React + TypeScript + Framer Motion)
- `src/client/` - React application
- Glassmorphic UI with dark theme
- Animated agent messages
- Real-time debate visualization
- Mode selector and agent management

### Shared Types
- `src/shared/types.ts` - TypeScript interfaces for all data structures

## 🎨 UI Features

- **ChatGPT-Dark Interface** - Professional dark theme
- **Animated Messages** - Smooth entry animations per agent
- **Colored Identity Markers** - Each agent has a unique color
- **Role Icons** - Visual archetype representation
- **Expand/Collapse** - Collapsible reasoning sections
- **Mode Selector** - Live mode toggling
- **Agent Management Panel** - Real-time agent status
- **Debate Visualization** - Visual conflict and resolution tracking
- **Consensus View** - Split view for majority/minority opinions
- **Glassmorphism** - Modern glass-effect UI elements
- **Smooth Transitions** - Framer Motion animations

## 🔧 Configuration

### Council Size
Default: 6 (user + 5 agents)
Configurable: 5-11 total (user + 4-10 agents)

### Available Models
- GPT-5.1 Ultra
- Claude 3.7 Opus
- Gemini Ultra 2
- Llama 5 405B
- DeepSeek V4
- Mistral Large 2
- Qwen 3.5 Max
- Command R+
- Grok 3
- RecurrentGemini Experimental

### Environment Variables

Create a `.env` file:

```env
PORT=3001
NODE_ENV=development
```

## 📊 Output Format

```
=== INITIAL AGENT RESPONSES ===
[Agent responses from each archetype]

=== CROSS-AGENT ANALYSIS ===
[Agent challenges, supports, critiques]

=== DEBATE / REFINEMENT CYCLES ===
[Conflicts and resolutions]

=== UNIFIED SYNTHESIS OUTPUT ===
[Polished consensus with action plan]

=== PREDICTIVE ANALYSIS === (if Predict mode active)
[Probability tables and scenario branches]

=== MINORITY REPORT === (if applicable)
[Alternative viewpoints preserved]

=== NEXT DIRECTIVE ===
"Prime Architect, what shall the Council examine next?"
```

## 🔒 Security

- Input validation on all API endpoints
- WebSocket message sanitization
- CORS configuration for production
- Environment-based configuration

## 🧪 Testing

```bash
npm test
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 📮 Support

For issues and questions, please use GitHub Issues.

---

**Prime Architect, what shall the Council examine next?**
